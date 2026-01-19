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
    if (['breakdown', 'leave', 'noshow'].includes(index)) return arr => arr.some(row => row[index] === true);
    if (['scoutname', 'generalcomments', 'breakdowncomments', 'defensecomments'].includes(index)) return arr => arr.map(row => row[index]).join(', ');
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
    const autoSuccess = (dr.autol1success || 0) + (dr.autol2success || 0) + (dr.autol3success || 0) + (dr.autol4success || 0);
    const autoAttempts = autoSuccess + (dr.autol1fail || 0) + (dr.autol2fail || 0) + (dr.autol3fail || 0) + (dr.autol4fail || 0);
    const teleSuccess = (dr.telel1success || 0) + (dr.telel2success || 0) + (dr.telel3success || 0) + (dr.telel4success || 0);
    const teleAttempts = teleSuccess + (dr.telel1fail || 0) + (dr.telel2fail || 0) + (dr.telel3fail || 0) + (dr.telel4fail || 0);
    const successRate = (autoAttempts + teleAttempts) > 0 
        ? ((autoSuccess + teleSuccess) / (autoAttempts + teleAttempts)) * 100 
        : 0;
    const endgameSuccess = (dr.endlocation === 2 || dr.endlocation === 3) ? 1 : 0;
    const noShowPenalty = dr.noshow ? 0 : 1;
    const breakdownPenalty = dr.breakdowncomments && dr.breakdowncomments.trim() !== "" ? 0.8 : 1;
    const metrics = [successRate, endgameSuccess * 100, noShowPenalty * 100];
    const validMetrics = metrics.filter(val => val >= 0);
    const baseConsistency = validMetrics.length > 0
        ? validMetrics.reduce((sum, value) => sum + value, 0) / validMetrics.length
        : 0;
    return baseConsistency * breakdownPenalty;
  };

  teamTable = tidy(teamTable, mutate({

    auto: d => calcAuto(d),
    tele: d => calcTele(d),
    end: d => calcEnd(d),
    epa: d => calcEPA(d),
    last3epa: d => last3EPAMap[d.team] || 0,

    cage: d => {
      const roundedEndLocation = Math.round(d.endlocation ?? 0);
      if (roundedEndLocation === 2) return 6;
      if (roundedEndLocation === 3) return 12;
      return 0;
    },
    consistency: d => calcConsistency(d),
    coral: d => {
      const success = (d.autol1success || 0) + (d.autol2success || 0) + (d.autol3success || 0) + (d.autol4success || 0) +
                     (d.telel1success || 0) + (d.telel2success || 0) + (d.telel3success || 0) + (d.telel4success || 0);
      const fail = (d.autol1fail || 0) + (d.autol2fail || 0) + (d.autol3fail || 0) + (d.autol4fail || 0) +
                   (d.telel1fail || 0) + (d.telel2fail || 0) + (d.telel3fail || 0) + (d.telel4fail || 0);
      const totalAttempts = success + fail;
      return totalAttempts > 0 ? (success / totalAttempts) * 100 : 0;
    },
    algae: d => {
      const success = (d.autoprocessorsuccess || 0) + (d.teleprocessorsuccess || 0) +
                      (d.autonetsuccess || 0) + (d.telenetsuccess || 0);
      const fail = (d.autoprocessorfail || 0) + (d.teleprocessorfail || 0) +
                   (d.autonetfail || 0) + (d.telenetfail || 0);
      const totalAttempts = success + fail;
      return totalAttempts > 0 ? (success / totalAttempts) * 100 : 0;
    },
    defense: d => {
      const defensePlayed = d.defenseplayed || 0;
      return defensePlayed > 0 ? defensePlayed * 10 : 0;
    },
  }), select(['team', 'auto', 'tele', 'end', 'epa', 'last3epa', 'cage', 'consistency', 'coral', 'algae', 'defense']));

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
    auto: d => maxes.auto ? d.auto / maxes.auto : 0,
    tele: d => maxes.tele ? d.tele / maxes.tele : 0,
    end: d => maxes.end ? d.end / maxes.end : 0,
    epa: d => maxes.epa ? d.epa / maxes.epa : 0,
    last3epa: d => maxes.last3epa ? d.last3epa / maxes.last3epa : 0,
    cage: d => maxes.cage ? d.cage / maxes.cage : 0,
    consistency: d => maxes.consistency ? d.consistency / maxes.consistency : 0,
    coral: d => maxes.coral ? d.coral / maxes.coral : 0,
    algae: d => maxes.algae ? d.algae / maxes.algae : 0,
    defense: d => maxes.defense ? d.defense / maxes.defense : 0,
    score: d => requestBody.reduce((sum, [key, weight]) => {
      const value = d[key] ?? 0;
      return sum + (value * parseFloat(weight));
    }, 0),
  }), arrange(desc('score')));

  return NextResponse.json(teamTable, { status: 200 });
}