import { NextResponse } from "next/server";
import { sql } from '@vercel/postgres';
import _ from 'lodash';
import { tidy, mutate, mean, select, summarizeAll, groupBy, summarize, first, n, median, total, arrange, asc, slice } from '@tidyjs/tidy';
import { calcEPA, calcAuto, calcTele, calcEnd } from "../../../util/calculations.js";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');

  if (!_.isNumber(+team)) {
    return NextResponse.json({ message: "ERROR: Invalid team number" }, { status: 400 });
  }

  // Fetch team data from database
  let data = await sql`SELECT * FROM scc2025 WHERE team = ${team};`;
  const rows = data.rows;

  if (rows.length === 0) {
    return NextResponse.json({ message: `ERROR: No data for team ${team}` }, { status: 404 });
  }

  function byAveragingNumbers(index) {
    // Boolean fields - return true if any row has it as true
    if (['noshow', 'intakeground', 'intakeoutpost', 'passingbulldozer', 'passingshooter', 'passingdump', 'shootwhilemove', 'bump', 'trench', 'stuckonfuel', 'playeddefense', 'winauto'].includes(index)) {
      return arr => arr.some(row => row[index] === true);
    }
    // String/Text fields - join with " - "
    if (['scoutname', 'generalcomments', 'breakdowncomments', 'autoclimb', 'autoclimbposition', 'endclimb', 'endclimbposition', 'shootingmechanism', 'defense', 'fuelpercent'].includes(index)) {
      return arr => arr.map(row => row[index]).filter(a => a != null).join(" - ") || null;
    }
    // Qualitative ratings (0-5 scale, -1 for not rated)
    if (['aggression', 'climbhazard', 'hoppercapacity', 'maneuverability', 'durability', 'defenseevasion', 'climbspeed', 'fuelspeed', 'passingspeed', 'autodeclimbspeed', 'bumpspeed'].includes(index)) {
      return arr => {
        let filtered = arr.filter(row => row[index] != -1 && row[index] != null).map(row => row[index]);
        return filtered.length === 0 ? -1 : mean(filtered);
      };
    }
    // Numeric fields - calculate mean
    return mean(index);
  }

  let teamTable = tidy(rows, mutate({
    auto: rec => calcAuto(rec),
    tele: rec => calcTele(rec),
    end: rec => calcEnd(rec),
    epa: rec => calcEPA(rec) // Ensure EPA is using the correct calculation
}));


  function rowsToArray(x, index) {
    return x.map(row => row[index]).filter(val => val != null);
  }

  function percentValue(arr, index, value) {
    return arr.filter(e => e[index] === value).length / arr.length;
  }

  // fetch team name from blue alliance api, commented our for now while testing getting from the backend
  const teamName = await fetch(`https://www.thebluealliance.com/api/v3/team/frc${team}/simple`, {
    headers: {
      "X-TBA-Auth-Key": process.env.TBA_AUTH_KEY,
      "Accept": "application/json"
    },
  })
  .then(resp => {
    if (resp.status !== 200) {
      console.error(`TBA API Error: Received status ${resp.status}`);
      return null;  // Return null if the request fails
    }
    return resp.json();
  })
  .then(data => {
    if (!data || !data.nickname) { 
      console.warn(`TBA API Warning: No nickname found for team ${team}`);
      return "";  // Provide a default fallback
    }
    return data.nickname;
  });
    const matchesScouted = new Set(teamTable.map(row => row.match)).size;

    function standardDeviation(arr, key) {
      const values = arr.map(row => row[key]).filter(v => typeof v === 'number' && !isNaN(v));
    
      if (values.length === 0) return 0;
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
    
      console.log(`📏 Manual StdDev Debug → values: [${values.join(', ')}] | Mean: ${avg} | Variance: ${variance} | StdDev: ${stdDev}`);
    
      return stdDev;
    }
    
    let returnObject = tidy(teamTable, 
      summarize({
        team: first('team'),
        name: () => teamName,
        
        // Fixed avgEpa calculation that averages by match first
        avgEpa: arr => {
          // Get unique matches and their average EPA
          const matchGroups = {};
          arr.forEach(row => {
            if (!matchGroups[row.match]) {
              matchGroups[row.match] = { sum: 0, count: 0 };
            }
            matchGroups[row.match].sum += row.epa;
            matchGroups[row.match].count += 1;
          });
          
          // Convert to array of match averages
          const matchAverages = Object.entries(matchGroups).map(([match, data]) => ({
            match: parseInt(match),
            avgEpa: data.sum / data.count
          }));
          
          if (matchAverages.length === 0) return 0;
          return matchAverages.reduce((sum, m) => sum + m.avgEpa, 0) / matchAverages.length;
        },
        
        // Fixed avgAuto calculation that averages by match first
        avgAuto: arr => {
          // Get unique matches and their average Auto
          const matchGroups = {};
          arr.forEach(row => {
            if (!matchGroups[row.match]) {
              matchGroups[row.match] = { sum: 0, count: 0 };
            }
            matchGroups[row.match].sum += row.auto;
            matchGroups[row.match].count += 1;
          });
          
          // Convert to array of match averages
          const matchAverages = Object.entries(matchGroups).map(([match, data]) => ({
            match: parseInt(match),
            avgAuto: data.sum / data.count
          }));
          
          if (matchAverages.length === 0) return 0;
          return matchAverages.reduce((sum, m) => sum + m.avgAuto, 0) / matchAverages.length;
        },
        
        // Fixed avgTele calculation that averages by match first
        avgTele: arr => {
          // Get unique matches and their average Tele
          const matchGroups = {};
          arr.forEach(row => {
            if (!matchGroups[row.match]) {
              matchGroups[row.match] = { sum: 0, count: 0 };
            }
            matchGroups[row.match].sum += row.tele;
            matchGroups[row.match].count += 1;
          });
          
          // Convert to array of match averages
          const matchAverages = Object.entries(matchGroups).map(([match, data]) => ({
            match: parseInt(match),
            avgTele: data.sum / data.count
          }));
          
          if (matchAverages.length === 0) return 0;
          return matchAverages.reduce((sum, m) => sum + m.avgTele, 0) / matchAverages.length;
        },
        
        // Fixed avgEnd calculation that averages by match first
        avgEnd: arr => {
          // Get unique matches and their average End
          const matchGroups = {};
          arr.forEach(row => {
            if (!matchGroups[row.match]) {
              matchGroups[row.match] = { sum: 0, count: 0 };
            }
            matchGroups[row.match].sum += row.end;
            matchGroups[row.match].count += 1;
          });
          
          // Convert to array of match averages
          const matchAverages = Object.entries(matchGroups).map(([match, data]) => ({
            match: parseInt(match),
            avgEnd: data.sum / data.count
          }));
          
          if (matchAverages.length === 0) return 0;
          return matchAverages.reduce((sum, m) => sum + m.avgEnd, 0) / matchAverages.length;
        },
    
        // Last 3 averages - keeping your existing functions
        last3Epa: arr => {
          // Get unique matches and their average EPA
          const matchGroups = {};
          arr.forEach(row => {
            if (!matchGroups[row.match]) {
              matchGroups[row.match] = { sum: 0, count: 0 };
            }
            matchGroups[row.match].sum += row.epa;
            matchGroups[row.match].count += 1;
          });
          
          // Convert to array of match averages
          const matchAverages = Object.entries(matchGroups).map(([match, data]) => ({
            match: parseInt(match),
            avgEpa: data.sum / data.count
          }));
          
          // Sort by match number (descending) and take last 3
          const latest3Matches = matchAverages.sort((a, b) => b.match - a.match).slice(0, 3);
          
          if (latest3Matches.length === 0) return 0;
          return latest3Matches.reduce((sum, m) => sum + m.avgEpa, 0) / latest3Matches.length;
        },
    
        last3Auto: arr => {
          // Get unique matches and their average Auto
          const matchGroups = {};
          arr.forEach(row => {
            if (!matchGroups[row.match]) {
              matchGroups[row.match] = { sum: 0, count: 0 };
            }
            matchGroups[row.match].sum += row.auto;
            matchGroups[row.match].count += 1;
          });
          
          // Convert to array of match averages
          const matchAverages = Object.entries(matchGroups).map(([match, data]) => ({
            match: parseInt(match),
            avgAuto: data.sum / data.count
          }));
          
          // Sort by match number (descending) and take last 3
          const latest3Matches = matchAverages.sort((a, b) => b.match - a.match).slice(0, 3);
          
          if (latest3Matches.length === 0) return 0;
          return latest3Matches.reduce((sum, m) => sum + m.avgAuto, 0) / latest3Matches.length;
        },
    
        last3Tele: arr => {
          // Get unique matches and their average Tele
          const matchGroups = {};
          arr.forEach(row => {
            if (!matchGroups[row.match]) {
              matchGroups[row.match] = { sum: 0, count: 0 };
            }
            matchGroups[row.match].sum += row.tele;
            matchGroups[row.match].count += 1;
          });
          
          // Convert to array of match averages
          const matchAverages = Object.entries(matchGroups).map(([match, data]) => ({
            match: parseInt(match),
            avgTele: data.sum / data.count
          }));
          
          // Sort by match number (descending) and take last 3
          const latest3Matches = matchAverages.sort((a, b) => b.match - a.match).slice(0, 3);
          
          if (latest3Matches.length === 0) return 0;
          return latest3Matches.reduce((sum, m) => sum + m.avgTele, 0) / latest3Matches.length;
        },
    
        last3End: arr => {
          // Get unique matches and their average End
          const matchGroups = {};
          arr.forEach(row => {
            if (!matchGroups[row.match]) {
              matchGroups[row.match] = { sum: 0, count: 0 };
            }
            matchGroups[row.match].sum += row.end;
            matchGroups[row.match].count += 1;
          });
          
          // Convert to array of match averages
          const matchAverages = Object.entries(matchGroups).map(([match, data]) => ({
            match: parseInt(match),
            avgEnd: data.sum / data.count
          }));
          
          // Sort by match number (descending) and take last 3
          const latest3Matches = matchAverages.sort((a, b) => b.match - a.match).slice(0, 3);
          
          if (latest3Matches.length === 0) return 0;
          return latest3Matches.reduce((sum, m) => sum + m.avgEnd, 0) / latest3Matches.length;
        },
        
        // Extract match and performance metrics
        epaOverTime: arr => tidy(arr, select(['epa', 'match'])),
        autoOverTime: arr => tidy(arr, select(['match', 'auto'])),
        teleOverTime: arr => tidy(arr, select(['match', 'tele'])),
      
        // Consistency calculation
        consistency: arr => {
          const uniqueMatches = new Set(arr.map(row => row.match));
          const uniqueBreakdownCount = Array.from(uniqueMatches).filter(match =>
            arr.some(row => row.match === match && row.breakdowncomments !== null)
          ).length;
          const breakdownRate = (uniqueBreakdownCount / uniqueMatches.size) * 100;
        
          const epaStdDev = standardDeviation(arr, 'epa');
          return 100 - (breakdownRate + epaStdDev);
        },
    
        lastBreakdown: arr => arr.filter(e => e.breakdowncomments !== null).reduce((a, b) => b.match, "N/A"),
        noShow: arr => percentValue(arr, 'noshow', true),
    
        breakdown: arr => {
          const uniqueMatches = new Set(arr.map(row => row.match));
          const uniqueBreakdownCount = Array.from(uniqueMatches).filter(match =>
            arr.some(row => row.match === match && row.breakdowncomments !== null)
          ).length;
          return (uniqueBreakdownCount / uniqueMatches.size) * 100;
        },
    
        defense: arr => {
          const uniqueMatches = new Set(arr.map(row => row.match));
          const uniqueDefenseCount = Array.from(uniqueMatches).filter(match =>
            arr.some(row => row.match === match && row.playeddefense === true)
          ).length;
          return (uniqueDefenseCount / uniqueMatches.size) * 100;
        },
    
        matchesScouted: () => matchesScouted,
        scouts: arr => {
          const scoutsByMatch = {};
          arr.forEach(row => {
            if (row.scoutname && row.scoutname.trim()) {
              if (!scoutsByMatch[row.match]) {
                scoutsByMatch[row.match] = [];
              }
              if (!scoutsByMatch[row.match].includes(row.scoutname)) {
                scoutsByMatch[row.match].push(row.scoutname);
              }
            }
          });
          
          const result = Object.entries(scoutsByMatch).map(([match, scouts]) => 
            ` *Match ${match}: ${scouts.join(', ')}*`
          );
          
          return result.length > 0 ? result : [];
        },
        generalComments: arr => {
          const commentsByMatch = {};
          arr.forEach(row => {
            if (row.generalcomments && row.generalcomments.trim()) {
              if (!commentsByMatch[row.match]) {
                commentsByMatch[row.match] = [];
              }
              commentsByMatch[row.match].push(row.generalcomments);
            }
          });
          
          const result = Object.entries(commentsByMatch).map(([match, comments]) => 
            ` *Match ${match}: ${comments.join(' -- ')}*`
          );
          
          return result.length > 0 ? result : [];
        },
        
        breakdownComments: arr => {
          const commentsByMatch = {};
          arr.forEach(row => {
            if (row.breakdowncomments && row.breakdowncomments.trim()) {
              if (!commentsByMatch[row.match]) {
                commentsByMatch[row.match] = [];
              }
              commentsByMatch[row.match].push(row.breakdowncomments);
            }
          });
          
          const result = Object.entries(commentsByMatch).map(([match, comments]) => 
            ` *Match ${match}: ${comments.join(' -- ')}*`
          );
          
          return result.length > 0 ? result : [];
        },
      
    // Defense comments removed - not in 2026 schema
    // Defense information is now in Defense field (weak/harassment/game changing) and PlayedDefense boolean
    autoOverTime: arr => tidy(arr, select(['match', 'auto'])),
    teleOverTime: arr => tidy(arr, select(['match', 'tele'])),
    // Leave field removed - not in 2026 schema

    auto: arr => ({
      fuel: {
        avgFuel: (() => {
          const validRows = rows.filter(row => row.autofuel != null && row.autofuel >= 0);
          return validRows.length > 0 
            ? validRows.reduce((sum, row) => sum + (row.autofuel || 0), 0) / validRows.length 
            : 0;
        })(),
        totalFuel: (() => rows.reduce((sum, row) => sum + (row.autofuel || 0), 0))(),
      },
      climb: {
        // autoclimb: 0=None, 1=Success, 2=Fail (numeric in DB)
        successRate: (() => {
          const totalMatches = rows.length;
          const successfulClimbs = rows.filter(row => row.autoclimb === 1 || row.autoclimb === '1' || row.autoclimb === 'Success').length;
          return totalMatches > 0 ? (successfulClimbs / totalMatches) * 100 : 0;
        })(),
        failRate: (() => {
          const totalMatches = rows.length;
          const failedClimbs = rows.filter(row => row.autoclimb === 2 || row.autoclimb === '2' || row.autoclimb === 'Fail').length;
          return totalMatches > 0 ? (failedClimbs / totalMatches) * 100 : 0;
        })(),
        noneRate: (() => {
          const totalMatches = rows.length;
          const noClimbs = rows.filter(row => row.autoclimb == null || row.autoclimb === 0 || row.autoclimb === '0' || row.autoclimb === 'None').length;
          return totalMatches > 0 ? (noClimbs / totalMatches) * 100 : 0;
        })(),
        positionLeft: (() => {
          const successfulClimbs = rows.filter(row => row.autoclimb === 1 || row.autoclimb === '1' || row.autoclimb === 'Success').length;
          const leftPosition = rows.filter(row => (row.autoclimb === 1 || row.autoclimb === '1' || row.autoclimb === 'Success') && (row.autoclimbposition === 0 || row.autoclimbposition === 'Left' || row.autoclimbposition === '0')).length;
          return successfulClimbs > 0 ? (leftPosition / successfulClimbs) * 100 : 0;
        })(),
        positionCenter: (() => {
          const successfulClimbs = rows.filter(row => row.autoclimb === 1 || row.autoclimb === '1' || row.autoclimb === 'Success').length;
          const centerPosition = rows.filter(row => (row.autoclimb === 1 || row.autoclimb === '1' || row.autoclimb === 'Success') && (row.autoclimbposition === 1 || row.autoclimbposition === 'Center' || row.autoclimbposition === '1')).length;
          return successfulClimbs > 0 ? (centerPosition / successfulClimbs) * 100 : 0;
        })(),
        positionRight: (() => {
          const successfulClimbs = rows.filter(row => row.autoclimb === 1 || row.autoclimb === '1' || row.autoclimb === 'Success').length;
          const rightPosition = rows.filter(row => (row.autoclimb === 1 || row.autoclimb === '1' || row.autoclimb === 'Success') && (row.autoclimbposition === 2 || row.autoclimbposition === 'Right' || row.autoclimbposition === '2')).length;
          return successfulClimbs > 0 ? (rightPosition / successfulClimbs) * 100 : 0;
        })(),
      },
      winAuto: (() => {
        const totalMatches = rows.length;
        const wonAuto = rows.filter(row => row.winauto === true).length;
        return totalMatches > 0 ? (wonAuto / totalMatches) * 100 : 0;
      })(),
    }),

    tele: arr => ({
      fuel: {
        avgFuel: (() => {
          const validRows = rows.filter(row => row.telefuel != null && row.telefuel >= 0);
          return validRows.length > 0 
            ? validRows.reduce((sum, row) => sum + (row.telefuel || 0), 0) / validRows.length 
            : 0;
        })(),
        totalFuel: (() => rows.reduce((sum, row) => sum + (row.telefuel || 0), 0))(),
      },
      passing: {
        bulldozer: (() => {
          const totalMatches = rows.length;
          const usedBulldozer = rows.filter(row => row.passingbulldozer === true).length;
          return totalMatches > 0 ? (usedBulldozer / totalMatches) * 100 : 0;
        })(),
        shooter: (() => {
          const totalMatches = rows.length;
          const usedShooter = rows.filter(row => row.passingshooter === true).length;
          return totalMatches > 0 ? (usedShooter / totalMatches) * 100 : 0;
        })(),
        dump: (() => {
          const totalMatches = rows.length;
          const usedDump = rows.filter(row => row.passingdump === true).length;
          return totalMatches > 0 ? (usedDump / totalMatches) * 100 : 0;
        })(),
      },
      shootWhileMove: (() => {
        const totalMatches = rows.length;
        const shootWhileMoving = rows.filter(row => row.shootwhilemove === true).length;
        return totalMatches > 0 ? (shootWhileMoving / totalMatches) * 100 : 0;
      })(),
      defenseLocations: {
        azOutpost: (() => {
          const totalMatches = rows.length;
          const defended = rows.filter(row => row.defenselocationoutpost === true).length;
          return totalMatches > 0 ? (defended / totalMatches) * 100 : 0;
        })(),
        azTower: (() => {
          const totalMatches = rows.length;
          const defended = rows.filter(row => row.defenselocationtower === true).length;
          return totalMatches > 0 ? (defended / totalMatches) * 100 : 0;
        })(),
        hub: (() => {
          const totalMatches = rows.length;
          const defended = rows.filter(row => row.defenselocationhub === true).length;
          return totalMatches > 0 ? (defended / totalMatches) * 100 : 0;
        })(),
        nz: (() => {
          const totalMatches = rows.length;
          const defended = rows.filter(row => row.defenselocationnz === true).length;
          return totalMatches > 0 ? (defended / totalMatches) * 100 : 0;
        })(),
        trench: (() => {
          const totalMatches = rows.length;
          const defended = rows.filter(row => row.defenselocationtrench === true).length;
          return totalMatches > 0 ? (defended / totalMatches) * 100 : 0;
        })(),
        bump: (() => {
          const totalMatches = rows.length;
          const defended = rows.filter(row => row.defenselocationbump === true).length;
          return totalMatches > 0 ? (defended / totalMatches) * 100 : 0;
        })(),
      },
    }),

// This appears to be inside a function that returns something via NextResponse
  // I'm providing the fixed version of the code snippet you shared
  
  // Assuming this is inside a function where 'rows' is defined

  // The endPlacement, attemptCage, successCage functions are likely inside a map or some object construction
  // which appears to be closed with "))" and then the result is assigned to returnObject[0]
  
  // First part of your object definition with fixed endPlacement
  endPlacement: (rows) => {
    console.log("Total number of rows:", rows.length);
    
    // Group data by match number
    const matchGroups = {};
    rows.forEach(row => {
      const matchId = row.match;
      if (matchId === undefined || matchId === null) {
        console.log("Row missing match number:", row);
        return;
      }
      
      const matchKey = row.matchtype ? `${matchId}-${row.matchtype}` : `${matchId}`;
      
      if (!matchGroups[matchKey]) {
        matchGroups[matchKey] = [];
      }
      matchGroups[matchKey].push(row);
    });
    
    console.log("Match groups created:", Object.keys(matchGroups).length);
    
    // Count matches by their most common EndClimb level
    const endClimbCounts = {
      'L1': 0,
      'L2': 0,
      'L3': 0,
      'none': 0
    };
    
    // For each match, find the most common EndClimb level
    Object.entries(matchGroups).forEach(([matchKey, matchRows]) => {
      // Count occurrences of each EndClimb level in this match
      const climbFrequency = {};
      
      matchRows.forEach(row => {
        let level = null;
        if (row.endclimb != null && row.endclimb !== '') {
          const endClimb = String(row.endclimb).toUpperCase();
          if (['L1', 'L2', 'L3'].includes(endClimb)) level = endClimb;
        }
        if (level == null && row.endclimbposition != null && row.endclimbposition !== '') {
          const pos = Number(row.endclimbposition);
          if (!Number.isNaN(pos) && pos >= 0 && pos <= 8) {
            const mod = pos % 3; // 0=L3, 1=L2, 2=L1
            level = mod === 0 ? 'L3' : mod === 1 ? 'L2' : 'L1';
          }
        }
        if (level) {
          climbFrequency[level] = (climbFrequency[level] || 0) + 1;
        } else {
          climbFrequency['none'] = (climbFrequency['none'] || 0) + 1;
        }
      });
      
      console.log(`Match ${matchKey} climb frequencies:`, climbFrequency);
      
      // Find the most frequent EndClimb level for this match
      let mostFrequentClimb = null;
      let highestCount = 0;
      
      Object.entries(climbFrequency).forEach(([level, count]) => {
        if (count > highestCount) {
          highestCount = count;
          mostFrequentClimb = level;
        }
      });
      
      console.log(`Match ${matchKey} most frequent climb:`, mostFrequentClimb);
      
      // Increment the count for this EndClimb level if valid
      if (mostFrequentClimb !== null && mostFrequentClimb in endClimbCounts) {
        endClimbCounts[mostFrequentClimb]++;
      } else if (mostFrequentClimb !== null) {
        endClimbCounts['none']++;
      }
    });
    
    console.log("Final EndClimb counts:", endClimbCounts);
    
    // Calculate total matches with valid EndClimb data
    const totalMatches = Object.values(endClimbCounts).reduce((sum, count) => sum + count, 0);
    console.log("Total matches with valid EndClimb:", totalMatches);
    
    // If no matches, return zeros
    if (totalMatches === 0) {
      console.log("No valid matches found, returning zeros");
      return { none: 0, L1: 0, L2: 0, L3: 0 };
    }
    
    // Calculate percentages
    const percentages = {
      none: (endClimbCounts['none'] / totalMatches) * 100,
      L1: (endClimbCounts['L1'] / totalMatches) * 100,
      L2: (endClimbCounts['L2'] / totalMatches) * 100,
      L3: (endClimbCounts['L3'] / totalMatches) * 100
    };
    
    console.log("Final percentages:", percentages);
    return percentages;
  
  },

  attemptCage: (rows) => {
    // Group data by match
    const matchGroups = {};
    rows.forEach(row => {
      const match = row.match;
      if (!matchGroups[match]) {
        matchGroups[match] = [];
      }
      matchGroups[match].push(row);
    });
    
    // Count matches where the modal EndClimb value indicates a climb attempt (L1, L2, or L3)
    const matchesWithAttempt = Object.values(matchGroups).filter(matchRows => {
      // Find the most common EndClimb level for this match
      const counts = {};
      matchRows.forEach(row => {
        const endClimb = row.endclimb ? String(row.endclimb).toUpperCase() : 'none';
        counts[endClimb] = (counts[endClimb] || 0) + 1;
      });
      
      let mode = null;
      let maxCount = 0;
      Object.entries(counts).forEach(([value, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mode = value;
        }
      });
      
      // Return true if the modal value indicates a climb attempt (L1, L2, or L3)
      return ['L1', 'L2', 'L3'].includes(mode);
    }).length;
    
    const totalMatches = Object.keys(matchGroups).length;
    return totalMatches > 0 ? (matchesWithAttempt / totalMatches) * 100 : 0;
  },
  
  successCage: (rows) => {
    // Group data by match
    const matchGroups = {};
    rows.forEach(row => {
      const match = row.match;
      if (!matchGroups[match]) {
        matchGroups[match] = [];
      }
      matchGroups[match].push(row);
    });
    
    // Process each match to find its modal EndClimb level
    const matchesWithModalEndClimb = Object.values(matchGroups).map(matchRows => {
      // Find the most common EndClimb level for this match
      const counts = {};
      matchRows.forEach(row => {
        const endClimb = row.endclimb ? String(row.endclimb).toUpperCase() : 'none';
        counts[endClimb] = (counts[endClimb] || 0) + 1;
      });
      
      let mode = null;
      let maxCount = 0;
      Object.entries(counts).forEach(([value, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mode = value;
        }
      });
      
      return mode;
    });
    
    // Count matches where an attempt was made (L1, L2, or L3)
    const attemptedMatches = matchesWithModalEndClimb.filter(level => 
      ['L1', 'L2', 'L3'].includes(level)
    ).length;
    
    // Count successful matches (L2 or L3 - higher level climbs)
    const successfulMatches = matchesWithModalEndClimb.filter(level => 
      ['L2', 'L3'].includes(level)
    ).length;
    
    // Calculate success rate among attempted matches only
    return attemptedMatches > 0 ? (successfulMatches / attemptedMatches) * 100 : 0;
  },
  
  qualitative: arr => {
    function safeAverage(key, invert = false) {
      const values = rows.map(row => row[key]).filter(v => typeof v === 'number' && v >= 0);
      if (values.length === 0) return -1;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return invert ? 5 - avg : avg;
    }
  
    return [
      { name: "Aggression*", rating: safeAverage('aggression', true) },
      { name: "Climb Hazard*", rating: safeAverage('climbhazard', true) },
      { name: "Hopper Capacity", rating: safeAverage('hoppercapacity') },
      { name: "Maneuverability", rating: safeAverage('maneuverability') },
      { name: "Durability", rating: safeAverage('durability') },
      { name: "Defense Evasion", rating: safeAverage('defenseevasion') },
      { name: "Climb Speed", rating: safeAverage('climbspeed') },
      { name: "Fuel Speed", rating: safeAverage('fuelspeed') },
      { name: "Passing Speed", rating: safeAverage('passingspeed') },
      { name: "Auto Declimb Speed", rating: safeAverage('autodeclimbspeed') },
      { name: "Bump Speed", rating: safeAverage('bumpspeed') },
    ];
  }
  
}));  // This appears to close the object and function call that contains these properties

// The rest of your code seems fine and doesn't need modification for your current issue
// Defense quality from "defense" column: 0=weak, 1=harassment, 2=game changing (percent of rows; coerce string from CSV)
const defenseCounts = { 0: 0, 1: 0, 2: 0 };
rows.forEach(row => {
  const d = Number(row.defense);
  if (d === 0 || d === 1 || d === 2) defenseCounts[d]++;
});
const totalRows = rows.length;
const defenseQuality = totalRows > 0
  ? {
      weak: (defenseCounts[0] / totalRows) * 100,
      harassment: (defenseCounts[1] / totalRows) * 100,
      gameChanging: (defenseCounts[2] / totalRows) * 100,
    }
  : { weak: 0, harassment: 0, gameChanging: 0 };

const loc = returnObject[0].tele?.defenseLocations || {};
returnObject[0] = {
  ...returnObject[0],
  intakeGround: rows.some(row => row.intakeground === true),
  intakeOutpost: rows.some(row => row.intakeoutpost === true),
  passingBulldozer: rows.some(row => row.passingbulldozer === true),
  passingShooter: rows.some(row => row.passingshooter === true),
  passingDump: rows.some(row => row.passingdump === true),
  shootWhileMove: rows.some(row => row.shootwhilemove === true),
  defenseQuality,
  defenseLocation: {
    allianceZone: ((Number(loc.azOutpost) || 0) + (Number(loc.azTower) || 0)) / 2,
    neutralZone: Number(loc.nz) || 0,
    trench: Number(loc.trench) || 0,
    bump: Number(loc.bump) || 0,
    tower: Number(loc.azTower) || 0,
    outpost: Number(loc.azOutpost) || 0,
    hub: Number(loc.hub) || 0,
  },
};


// Aggregate function definition
function aggregateByMatch(dataArray) {
  return tidy(
    dataArray,
    groupBy("match", [
      summarize({
        epa: mean("epa"),
        auto: mean("auto"),
        tele: mean("tele"),
      }),
    ]),
    mutate({
      epa: d => Math.round(d.epa * 100) / 100,
      auto: d => Math.round(d.auto * 100) / 100,
      tele: d => Math.round(d.tele * 100) / 100,
    }),
    arrange([asc("match")])
  );
}

// Apply the aggregation and sorting
let processedEPAOverTime = aggregateByMatch(returnObject[0].epaOverTime);
let processedAutoOverTime = aggregateByMatch(returnObject[0].autoOverTime);
let processedTeleOverTime = aggregateByMatch(returnObject[0].teleOverTime);

returnObject[0].epaOverTime = processedEPAOverTime;
returnObject[0].autoOverTime = processedAutoOverTime;
returnObject[0].teleOverTime = processedTeleOverTime;

// Add debugging logs
console.log("Backend End Placement:", returnObject[0].endPlacement);

// Just one return statement
return NextResponse.json(returnObject[0], { status: 200 });

}
