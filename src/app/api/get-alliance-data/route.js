import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { calcAuto, calcTele, calcEnd } from "@/util/calculations";

export const dynamic = 'force-dynamic'; // Prevent static generation during build
export const revalidate = 300; // Cache for 5 minutes

const avgNonNegative = (values) => {
  const filtered = values.filter(v => typeof v === 'number' && v >= 0);
  return filtered.length > 0
    ? Math.round((filtered.reduce((a, b) => a + b, 0) / filtered.length) * 10) / 10
    : -1;
};


export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM scc2025;`;
    let responseObject = {};

    // Try to fetch TBA team data, but don't fail if it doesn't work
    let frcAPITeamData = [];
    try {
      const tbaResponse = await fetch(`https://www.thebluealliance.com/api/v3/event/2026capoh/teams`, {
        headers: {
          "X-TBA-Auth-Key": process.env.TBA_AUTH_KEY || "",
          "Accept": "application/json"
        },
      });
      if (tbaResponse.status === 200) {
        frcAPITeamData = await tbaResponse.json();
      } else {
        console.warn(`TBA API returned status ${tbaResponse.status}, continuing without team names`);
      }
    } catch (tbaError) {
      console.warn("TBA API error, continuing without team names:", tbaError.message);
    }

    rows.forEach((row) => {
      if (!row.noshow) {
        let auto = calcAuto(row);
        let tele = calcTele(row);
        let end = calcEnd(row);
        const teamKey = String(row.team);

        let frcAPITeamInfo = frcAPITeamData.filter(teamData => parseInt(teamData.team_number) === parseInt(row.team));

        if (!responseObject[teamKey]) {
          responseObject[teamKey] = initializeTeamData(row, auto, tele, end, frcAPITeamInfo);
        } else {
          accumulateTeamData(responseObject[teamKey], row, auto, tele, end);
        }
      }
    });

    calculateAverages(responseObject, rows);
    calculateLast3EPA(responseObject, rows);
    calculateDisplayEPA(responseObject);

    return NextResponse.json(responseObject, { status: 200 });

  } catch (error) {
    console.error("Error fetching alliance data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

function initializeTeamData(row, auto, tele, end, frcAPITeamInfo) {
  // Calculate fuel and climb points
  const fuel = (row.autofuel || 0) + (row.telefuel || 0);
  
  // Calculate climb points (auto climb = 15 if Success (2), end climb = 10/20/30 for L1/L2/L3)
  let climbPoints = 0;
  if (row.autoclimb === 2) climbPoints += 15; // 2 = Success (0=None, 1=Fail, 2=Success)
  if (row.endclimbposition != null && row.endclimbposition !== undefined) {
    // endclimbposition: 0=LeftL3, 1=LeftL2, 2=LeftL1, 3=CenterL3, 4=CenterL2, 5=CenterL1, 6=RightL3, 7=RightL2, 8=RightL1
    // Map integer to level: 0,3,6 = L3; 1,4,7 = L2; 2,5,8 = L1
    const level = row.endclimbposition % 3; // 0=L3, 1=L2, 2=L1
    if (level === 0) climbPoints += 30; // L3
    else if (level === 1) climbPoints += 20; // L2
    else if (level === 2) climbPoints += 10; // L1
  }
  
  return {
    team: row.team,
    teamName: frcAPITeamInfo.length === 0 ? "🤖" : frcAPITeamInfo[0].nickname,
    auto,
    tele,
    end,
    fuel,
    climb: climbPoints,
    intake: {
      ground: row.intakeground ? 1 : 0,
      outpost: row.intakeoutpost ? 1 : 0,
    },
    passing: {
      bulldozer: row.passingbulldozer ? 1 : 0,
      shooter: row.passingshooter ? 1 : 0,
      dump: row.passingdump ? 1 : 0,
    },
    endgame: createEndgameData(row.endclimbposition),
    qualitative: {
      aggression: row.aggression,
      climbhazard: row.climbhazard,
      hoppercapacity: row.hoppercapacity,
      maneuverability: row.maneuverability,
      durability: row.durability,
      defenseevasion: row.defenseevasion,
      climbspeed: row.climbspeed,
      fuelspeed: row.fuelspeed,
      passingspeed: row.passingspeed,
      autodeclimbspeed: row.autodeclimbspeed,
      bumpspeed: row.bumpspeed,
    },
  };
}

function accumulateTeamData(teamData, row, auto, tele, end) {
  teamData.auto += auto;
  teamData.tele += tele;
  teamData.end += end;

  // Accumulate fuel
  const fuel = (row.autofuel || 0) + (row.telefuel || 0);
  teamData.fuel += fuel;

  // Accumulate climb points
  let climbPoints = 0;
  if (row.autoclimb === 2) climbPoints += 15; // 2 = Success
  if (row.endclimbposition != null && row.endclimbposition !== undefined) {
    // endclimbposition: 0=LeftL3, 1=LeftL2, 2=LeftL1, 3=CenterL3, 4=CenterL2, 5=CenterL1, 6=RightL3, 7=RightL2, 8=RightL1
    // Map integer to level: 0,3,6 = L3; 1,4,7 = L2; 2,5,8 = L1
    const level = row.endclimbposition % 3; // 0=L3, 1=L2, 2=L1
    if (level === 0) climbPoints += 30; // L3
    else if (level === 1) climbPoints += 20; // L2
    else if (level === 2) climbPoints += 10; // L1
  }
  teamData.climb += climbPoints;

  // Accumulate intake types
  if (row.intakeground) teamData.intake.ground += 1;
  if (row.intakeoutpost) teamData.intake.outpost += 1;

  // Accumulate passing types
  if (row.passingbulldozer) teamData.passing.bulldozer += 1;
  if (row.passingshooter) teamData.passing.shooter += 1;
  if (row.passingdump) teamData.passing.dump += 1;

  // Accumulate endgame data
  const endgameData = createEndgameData(row.endclimbposition);
  for (let key in endgameData) {
    teamData.endgame[key] += endgameData[key];
  }

  // Accumulate qualitative ratings (sum them for averaging later)
  teamData.qualitative.aggression += row.aggression || 0;
  teamData.qualitative.climbhazard += row.climbhazard || 0;
  teamData.qualitative.hoppercapacity += row.hoppercapacity || 0;
  teamData.qualitative.maneuverability += row.maneuverability || 0;
  teamData.qualitative.durability += row.durability || 0;
  teamData.qualitative.defenseevasion += row.defenseevasion || 0;
  teamData.qualitative.climbspeed += row.climbspeed || 0;
  teamData.qualitative.fuelspeed += row.fuelspeed || 0;
  teamData.qualitative.passingspeed += row.passingspeed || 0;
  teamData.qualitative.autodeclimbspeed += row.autodeclimbspeed || 0;
  teamData.qualitative.bumpspeed += row.bumpspeed || 0;
}

function createEndgameData(endclimbposition) {
  // endclimbposition: 0=LeftL3, 1=LeftL2, 2=LeftL1, 3=CenterL3, 4=CenterL2, 5=CenterL1, 6=RightL3, 7=RightL2, 8=RightL1
  if (!endclimbposition || endclimbposition === null || endclimbposition === undefined) {
    return { L1: 0, L2: 0, L3: 0, None: 1 };
  }
  // Map integer to level: 0,3,6 = L3; 1,4,7 = L2; 2,5,8 = L1
  const level = endclimbposition % 3; // 0=L3, 1=L2, 2=L1
  return {
    L1: level === 2 ? 1 : 0,
    L2: level === 1 ? 1 : 0,
    L3: level === 0 ? 1 : 0,
    None: 0,
  };
}

function calculateAverages(responseObject, rows) {
  const average = (value, count) => (count > 0 ? Math.round((value / count) * 10) / 10 : 0);

  for (let team in responseObject) {
    let teamData = responseObject[team];
    let count = rows.filter((row) => row.team === parseInt(team) && !row.noshow).length;

    teamData.auto = average(teamData.auto, count);
    teamData.tele = average(teamData.tele, count);
    teamData.end = average(teamData.end, count);
    teamData.fuel = average(teamData.fuel, count);
    teamData.avgFuel = teamData.fuel; // match-view expects avgFuel
    teamData.climb = average(teamData.climb, count);

    // Calculate passing percentages (percentage of matches using each passing type)
    teamData.passing = {
      bulldozer: count > 0 ? Math.round((100 * teamData.passing.bulldozer) / count) : 0,
      shooter: count > 0 ? Math.round((100 * teamData.passing.shooter) / count) : 0,
      dump: count > 0 ? Math.round((100 * teamData.passing.dump) / count) : 0,
    };

    // Calculate endgame percentages
    let locationSum =
      teamData.endgame.L1 + teamData.endgame.L2 + teamData.endgame.L3 + teamData.endgame.None;

    teamData.endgame = locationSum > 0
      ? {
          L1: Math.round((100 * teamData.endgame.L1) / locationSum),
          L2: Math.round((100 * teamData.endgame.L2) / locationSum),
          L3: Math.round((100 * teamData.endgame.L3) / locationSum),
          None: Math.round((100 * teamData.endgame.None) / locationSum),
        }
      : { L1: 0, L2: 0, L3: 0, None: 100 };

    // Calculate qualitative ratings (average of non-negative values, -1 for not rated)
    const teamRows = rows.filter(row => row.team === parseInt(team) && !row.noshow);

    teamData.qualitative = {
      aggression: avgNonNegative(teamRows.map(r => r.aggression)),
      climbhazard: avgNonNegative(teamRows.map(r => r.climbhazard)),
      hoppercapacity: avgNonNegative(teamRows.map(r => r.hoppercapacity)),
      maneuverability: avgNonNegative(teamRows.map(r => r.maneuverability)),
      durability: avgNonNegative(teamRows.map(r => r.durability)),
      defenseevasion: avgNonNegative(teamRows.map(r => r.defenseevasion)),
      climbspeed: avgNonNegative(teamRows.map(r => r.climbspeed)),
      fuelspeed: avgNonNegative(teamRows.map(r => r.fuelspeed)),
      passingspeed: avgNonNegative(teamRows.map(r => r.passingspeed)),
      autodeclimbspeed: avgNonNegative(teamRows.map(r => r.autodeclimbspeed)),
      bumpspeed: avgNonNegative(teamRows.map(r => r.bumpspeed)),
    };
  }
}

function calculateLast3EPA(responseObject, rows) {
  Object.keys(responseObject).forEach(team => {
    // Filter rows for this team and calculate metrics
    const teamRows = rows
      .filter(r => String(r.team) === String(team) && !r.noshow)
      .map(r => ({
        ...r,
        auto: calcAuto(r),
        tele: calcTele(r),
        end: calcEnd(r),
        epa: calcAuto(r) + calcTele(r) + calcEnd(r),
      }));
    
    // Group by match
    const matchGroups = {};
    teamRows.forEach(row => {
      if (!matchGroups[row.match]) {
        matchGroups[row.match] = [];
      }
      matchGroups[row.match].push(row);
    });
    
    // Calculate average per match
    const matchAverages = Object.entries(matchGroups).map(([match, matchRows]) => {
      return {
        match: parseInt(match),
        auto: matchRows.reduce((sum, r) => sum + r.auto, 0) / matchRows.length,
        tele: matchRows.reduce((sum, r) => sum + r.tele, 0) / matchRows.length,
        end: matchRows.reduce((sum, r) => sum + r.end, 0) / matchRows.length,
        epa: matchRows.reduce((sum, r) => sum + r.epa, 0) / matchRows.length
      };
    });
    
    // Sort by match number and take last 3 matches
    const last3Matches = matchAverages
      .sort((a, b) => a.match - b.match)
      .slice(-3);
    
    // Calculate averages for the last 3 matches
    const avg = (arr, field) => {
      if (arr.length === 0) return 0;
      const sum = arr.reduce((sum, r) => sum + (r[field] || 0), 0);
      return Math.round((sum / arr.length) * 10) / 10;
    };
    
    // Store the results
    responseObject[team].last3Auto = avg(last3Matches, "auto");
    responseObject[team].last3Tele = avg(last3Matches, "tele");
    responseObject[team].last3End = avg(last3Matches, "end");
    responseObject[team].last3EPA = avg(last3Matches, "epa");
  });
}

// Blended EPA for display: (Last 3 + total average) / 2 for total and A/T/E breakdown
function calculateDisplayEPA(responseObject) {
  Object.keys(responseObject).forEach(team => {
    const t = responseObject[team];
    const avgAuto = t.auto ?? 0;
    const avgTele = t.tele ?? 0;
    const avgEnd = t.end ?? 0;
    const avgEPA = avgAuto + avgTele + avgEnd;
    t.displayAuto = Math.round(((t.last3Auto ?? 0) + avgAuto) / 2 * 10) / 10;
    t.displayTele = Math.round(((t.last3Tele ?? 0) + avgTele) / 2 * 10) / 10;
    t.displayEnd = Math.round(((t.last3End ?? 0) + avgEnd) / 2 * 10) / 10;
    t.displayEPA = Math.round(((t.last3EPA ?? 0) + avgEPA) / 2 * 10) / 10;
  });
}