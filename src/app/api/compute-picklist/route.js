import { NextResponse } from "next/server";
import { sql } from '@vercel/postgres';
import { tidy, mutate, arrange, desc, mean, select, summarizeAll, summarize, max, groupBy } from '@tidyjs/tidy';
import { calcAuto, calcTele, calcEnd, calcEPA } from "@/util/calculations";

export const dynamic = 'force-dynamic'; // Prevent static generation during build

export async function POST(request) {

  const requestBody = await request.json(); // Weight inputs

  let data = await sql`SELECT * FROM scc2025;`;

  let rows = data.rows;

  function averageField(index) {
    // Boolean fields - return true if any row has it as true
    if (['noshow', 'intakeground', 'intakeoutpost', 'passingbulldozer', 'passingshooter', 'passingdump', 'shootwhilemove', 'bump', 'trench', 'stuckonfuel', 'playeddefense', 'winauto', 'climbtf', 'wideclimb'].includes(index)) {
      return arr => arr.some(row => row[index] === true);
    }
    // String/Text fields - join with comma
    if (['scoutname', 'generalcomments', 'breakdowncomments', 'defensecomments'].includes(index)) {
      return arr => arr.map(row => row[index]).filter(a => a != null).join(', ') || null;
    }
    // Numeric fields - calculate mean
    const validValues = arr => arr.map(row => row[index]).filter(val => val != null && !isNaN(val));
    return arr => validValues(arr).length > 0 
      ? validValues(arr).reduce((sum, v) => sum + v, 0) / validValues(arr).length 
      : 0;    
  }

  // Pre-process: remove no-shows
  rows = rows.filter(row => !row.noshow);

  // Calculate consistency per team before summarizing
  const teamConsistencyMap = Object.fromEntries(
    tidy(rows, groupBy(['team'], [
      summarize({
        consistency: arr => {
          const uniqueMatches = new Set(arr.map(row => row.match));
          const uniqueBreakdownCount = Array.from(uniqueMatches).filter(match =>
            arr.some(row => row.match === match && row.breakdowncomments && row.breakdowncomments.trim() !== "")
          ).length;
          const breakdownRate = uniqueMatches.size > 0 
            ? (uniqueBreakdownCount / uniqueMatches.size) * 100 
            : 0;

          const epaValues = arr.map(row => row.epa).filter(v => typeof v === 'number' && !isNaN(v));
          const meanVal = epaValues.reduce((a, b) => a + b, 0) / epaValues.length || 0;
          const variance = epaValues.reduce((sum, v) => sum + Math.pow(v - meanVal, 2), 0) / epaValues.length || 0;
          const epaStdDev = Math.sqrt(variance);

          return 100 - (breakdownRate + epaStdDev);
        }
      })
    ])).map(d => [d.team, d.consistency])
  );

  // Group by team + match first
  let teamTable = tidy(rows, groupBy(['team', 'match'], [summarizeAll(averageField)]));

  // Group by team
  teamTable = tidy(teamTable, groupBy(['team'], [summarizeAll(averageField)]));

  // STEP 1: Calculate last3epa by match grouping
  const last3EPAMap = {};
  const matchGroupedByTeam = rows.reduce((acc, row) => {
    if (!row.noshow) {
      const team = row.team;
      const match = row.match;
      if (!acc[team]) acc[team] = {};
      if (!acc[team][match]) acc[team][match] = [];
      acc[team][match].push(row);
    }
    return acc;
  }, {});

  for (const team in matchGroupedByTeam) {
    const matches = Object.entries(matchGroupedByTeam[team])
      .map(([matchNum, matchRows]) => {
        const avgEpa = matchRows.reduce((sum, row) => sum + calcEPA(row), 0) / matchRows.length;
        return { match: parseInt(matchNum), avgEpa };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);

    const avgOfLast3 = matches.length > 0
      ? matches.reduce((sum, m) => sum + m.avgEpa, 0) / matches.length
      : 0;

    last3EPAMap[team] = avgOfLast3;
  }

  const calcConsistency = (dr) => {
    // Calculate fuel scoring consistency (fuel points scored)
    const autoFuel = dr.autofuel || 0;
    const teleFuel = dr.telefuel || 0;
    const totalFuel = autoFuel + teleFuel;
    
    // Normalize fuel to 0-100 scale (assume max 30 auto + 50 tele = 80 fuel)
    const fuelNormalized = Math.min((totalFuel / 80) * 100, 100);
    
    // Climb success consistency
    // autoclimb: 0=None, 1=Fail, 2=Success
    const autoClimbSuccess = dr.autoclimb === 2 ? 100 : (dr.autoclimb === 1 ? 50 : 0);
    
    // End climb success (higher levels = better consistency)
    // endclimbposition: 0=LeftL3, 1=LeftL2, 2=LeftL1, 3=CenterL3, 4=CenterL2, 5=CenterL1, 6=RightL3, 7=RightL2, 8=RightL1
    let endClimbSuccess = 0;
    if (dr.endclimbposition != null && dr.endclimbposition !== undefined) {
      // Map integer to level: 0,3,6 = L3; 1,4,7 = L2; 2,5,8 = L1
      const level = dr.endclimbposition % 3; // 0=L3, 1=L2, 2=L1
      switch (level) {
        case 0: endClimbSuccess = 100; break; // L3
        case 1: endClimbSuccess = 67; break;  // L2
        case 2: endClimbSuccess = 33; break;  // L1
        default: endClimbSuccess = 0;
      }
    }
    
    // No-show penalty
    const noShowPenalty = dr.noshow ? 0 : 100;
    
    // Breakdown penalty
    const breakdownPenalty = dr.breakdowncomments && dr.breakdowncomments.trim() !== "" ? 0.8 : 1;
    
    // Combine metrics
    const metrics = [fuelNormalized, autoClimbSuccess, endClimbSuccess, noShowPenalty];
    const validMetrics = metrics.filter(val => val >= 0);
    
    const baseConsistency = validMetrics.length > 0
        ? validMetrics.reduce((sum, value) => sum + value, 0) / validMetrics.length
        : 0;
    
    return baseConsistency * breakdownPenalty;
  };

  // Calculate passing percentage per team (for passing metric)
  const teamPassingMap = {};
  rows.forEach(row => {
    if (!teamPassingMap[row.team]) {
      teamPassingMap[row.team] = { matches: new Set(), totalMatches: 0 };
    }
    teamPassingMap[row.team].totalMatches++;
    if (row.passingbulldozer || row.passingshooter || row.passingdump) {
      teamPassingMap[row.team].matches.add(row.match);
    }
  });

  teamTable = tidy(teamTable, mutate({
    auto: d => calcAuto(d),
    epa: d => calcEPA(d),
    last3epa: d => last3EPAMap[d.team] || 0,
    fuel: d => {
      // Total fuel scored (auto + tele)
      return (d.autofuel || 0) + (d.telefuel || 0);
    },
    tower: d => {
      // Endgame climb points based on EndClimbPosition level
      // endclimbposition: 0=LeftL3, 1=LeftL2, 2=LeftL1, 3=CenterL3, 4=CenterL2, 5=CenterL1, 6=RightL3, 7=RightL2, 8=RightL1
      if (d.endclimbposition == null || d.endclimbposition === undefined) return 0;
      // Map integer to level: 0,3,6 = L3; 1,4,7 = L2; 2,5,8 = L1
      const level = d.endclimbposition % 3; // 0=L3, 1=L2, 2=L1
      switch (level) {
        case 0: return 30; // L3 = 30 points
        case 1: return 20; // L2 = 20 points
        case 2: return 10; // L1 = 10 points
        default: return 0;
      }
    },
    defense: d => {
      // Defense score based on PlayedDefense and Defense type
      // defense: 0=weak, 1=harassment, 2=game changing
      if (!d.playeddefense) return 0;
      
      let score = 10; // Base score for playing defense
      if (d.defense === 1) score += 5; // harassment
      if (d.defense === 2) score += 10; // game changing
      
      return score;
    },
    passing: d => {
      // Combined metric: percentage of matches using any passing + qualitative passing speed rating
      const teamPassing = teamPassingMap[d.team];
      if (!teamPassing || teamPassing.totalMatches === 0) {
        return 0;
      }
      
      // Percentage component: percentage of matches where team used any passing
      const matchesWithPassing = teamPassing.matches.size;
      const passingPercentage = (matchesWithPassing / teamPassing.totalMatches) * 100; // 0-100
      
      // Qualitative component: average passing speed rating (0-5 scale, -1 for not rated)
      const passingSpeed = d.passingspeed;
      let qualitativeScore = 0;
      if (passingSpeed != null && passingSpeed >= 0 && passingSpeed <= 5) {
        qualitativeScore = (passingSpeed / 5) * 100; // Normalize to 0-100
      }
      
      // Combine: average of both normalized values
      return (passingPercentage + qualitativeScore) / 2; // 0-100
    },
    consistency: d => calcConsistency(d),
  }), select(['team', 'epa', 'last3epa', 'fuel', 'auto', 'tower', 'defense', 'passing', 'consistency']));

  const getTBARankings = async () => {
    try {
      const response = await fetch(`https://www.thebluealliance.com/api/v3/event/2025casnd/rankings`, {
        headers: {
          'X-TBA-Auth-Key': process.env.TBA_AUTH_KEY,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.rankings.map(team => ({ teamNumber: team.team_key.replace('frc', ''), rank: team.rank }));
    } catch (error) {
      console.error('Error fetching TBA rankings:', error);
      return [];
    }
  }

  try {
    const tbaRankings = await getTBARankings();
    teamTable = teamTable.map(teamData => {
      const rankedData = tbaRankings.find(rankedTeam => rankedTeam.teamNumber == teamData.team);
      return { ...teamData, tbaRank: rankedData ? rankedData.rank : -1 };
    });
  } catch (error) {
    console.error('Error updating rankings:', error);
  }

  const maxes = tidy(teamTable, summarizeAll(max))[0];
  teamTable = tidy(teamTable, mutate({
    epa: d => maxes.epa ? d.epa / maxes.epa : 0,
    last3epa: d => maxes.last3epa ? d.last3epa / maxes.last3epa : 0,
    fuel: d => maxes.fuel ? d.fuel / maxes.fuel : 0,
    auto: d => maxes.auto ? d.auto / maxes.auto : 0,
    tower: d => maxes.tower ? d.tower / maxes.tower : 0,
    defense: d => maxes.defense ? d.defense / maxes.defense : 0,
    passing: d => maxes.passing ? d.passing / maxes.passing : 0,
    consistency: d => maxes.consistency ? d.consistency / maxes.consistency : 0,
    score: d => requestBody.reduce((sum, [key, weight]) => {
      const value = d[key] ?? 0;
      return sum + (value * parseFloat(weight));
    }, 0),
  }), arrange(desc('score')));

  return NextResponse.json(teamTable, { status: 200 });
}