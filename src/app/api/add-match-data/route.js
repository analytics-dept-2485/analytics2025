import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import _ from "lodash";

export const dynamic = 'force-dynamic'; // Prevent static generation during build

export async function POST(req) {
  let body = await req.json();
  console.log(body);

  // Adjust match number based on match type
  let adjustedMatch = body.match;
  switch (parseInt(body.matchType)) {
    case 0: // pre-comp
      adjustedMatch = body.match - 100;
      break;
    case 1: // practice
      adjustedMatch = body.match - 50;
      break;
    case 2: // qual (no change)
      adjustedMatch = body.match;
      break;
    case 3: // elim
      adjustedMatch = body.match + 150;
      break;
  }

  if (!(_.isString(body.scoutname) && _.isNumber(body.scoutteam) && _.isNumber(body.team) && _.isNumber(adjustedMatch) && _.isNumber(body.matchType))) {
    return NextResponse.json({ message: "Invalid Pre-Match Data!" }, { status: 400 });
  }
  
  // If no-show, add a basic row
  if (body.noshow) {
    console.log("no show!");
    let resp = await sql`
      INSERT INTO scc2025 (ScoutName, ScoutTeam, Team, Match, MatchType, NoShow)
      VALUES (${body.scoutname}, ${body.scoutteam}, ${body.team}, ${adjustedMatch}, ${body.matchType}, ${body.noshow})
    `;
    return NextResponse.json({ message: "Success!" }, { status: 201 });
  }
  
  // Check Auto Data
  if (
    !(
      _.isNumber(body.autol1success) &&
      _.isNumber(body.autol1fail) &&
      _.isNumber(body.autol2success) &&
      _.isNumber(body.autol2fail) &&
      _.isNumber(body.autol3success) &&
      _.isNumber(body.autol3fail) &&
      _.isNumber(body.autol4success) &&
      _.isNumber(body.autol4fail) &&
      _.isNumber(body.autoprocessorsuccess) &&
      _.isNumber(body.autoprocessorfail) &&
      _.isNumber(body.autonetsuccess) &&
      _.isNumber(body.autonetfail)
    )
  ) {
    return NextResponse.json({ message: "Invalid Auto Data!" }, { status: 400 });
  }
  
  // Check Tele Data
  if (
    !(
      _.isNumber(body.telel1success) &&
      _.isNumber(body.telel1fail) &&
      _.isNumber(body.telel2success) &&
      _.isNumber(body.telel2fail) &&
      _.isNumber(body.telel3success) &&
      _.isNumber(body.telel3fail) &&
      _.isNumber(body.telel4success) &&
      _.isNumber(body.telel4fail) &&
      _.isNumber(body.telealgaeremoved) &&
      _.isNumber(body.teleprocessorsuccess) &&
      _.isNumber(body.teleprocessorfail) &&
      _.isNumber(body.telenetsuccess) &&
      _.isNumber(body.telenetfail)
    )
  ) {
    return NextResponse.json({ message: "Invalid Tele Data!" }, { status: 400 });
  }
  
  // Check Endgame Data
  if (
    !(_.isNumber(body.endlocation))
  ) {
    return NextResponse.json({ message: "Invalid Endgame Data!" }, { status: 400 });
  }
  
  // Check Qualitative Data
  if (
    !(
      _.isNumber(body.coralspeed) &&
      _.isNumber(body.processorspeed) &&
      _.isNumber(body.netspeed) &&
      _.isNumber(body.algaeremovalspeed) &&
      _.isNumber(body.climbspeed)  &&
      _.isNumber(body.maneuverability)  &&
      _.isNumber(body.defenseplayed)  &&
      _.isNumber(body.defenseevasion)  &&
      _.isNumber(body.aggression)  &&
      _.isNumber(body.cagehazard)
      )
  ) {
    return NextResponse.json({ message: "Invalid Qualitative Data!" }, { status: 400 });
  }
  // Check Comments
  if (
    !(
      _.isString(body.generalcomments) &&
      (_.isString(body.breakdowncomments) || _.isNull(body.breakdowncomments)) &&
      (_.isString(body.defensecomments) || _.isNull(body.defensecomments))
    )
  ) {
    return NextResponse.json({ message: "Invalid Comments!" }, { status: 400 });
  }
  
  console.log(body.defensecomments);
  
  // Insert Data into Database**
  let resp = await sql`

    INSERT INTO scc2025 (
      scoutname, scoutteam, team, match, matchtype, breakdown, noshow, leave, autol1success, autol1fail, autol2success, autol2fail, autol3success, autol3fail, autol4success, autol4fail, autoalgaeremoved, autoprocessorsuccess, autoprocessorfail, autonetsuccess, autonetfail, telel1success, telel1fail, telel2success, telel2fail, telel3success, telel3fail, telel4success, telel4fail, telealgaeremoved, teleprocessorsuccess, teleprocessorfail, telenetsuccess, telenetfail, endlocation, coralspeed, processorspeed, netspeed, algaeremovalspeed, climbspeed, maneuverability, defenseplayed, defenseevasion, aggression, cagehazard, coralgrndintake, coralstationintake, algaegrndintake, algaehighreefintake, algaelowreefintake, generalcomments, breakdowncomments, defensecomments

    )
    VALUES (
      ${body.scoutname}, ${body.scoutteam}, ${body.team}, ${adjustedMatch}, ${body.matchType}, ${body.breakdown}, ${body.noshow}, ${body.leave}, 
      ${body.autol1success}, ${body.autol1fail}, ${body.autol2success}, ${body.autol2fail}, ${body.autol3success}, ${body.autol3fail}, ${body.autol4success}, ${body.autol4fail}, 
      ${body.autoalgaeremoved}, ${body.autoprocessorsuccess}, ${body.autoprocessorfail}, ${body.autonetsuccess}, ${body.autonetfail}, 
      ${body.telel1success}, ${body.telel1fail}, ${body.telel2success}, ${body.telel2fail}, ${body.telel3success}, ${body.telel3fail}, ${body.telel4success}, ${body.telel4fail}, 
      ${body.telealgaeremoved}, ${body.teleprocessorsuccess}, ${body.teleprocessorfail}, ${body.telenetsuccess}, ${body.telenetfail}, 
      ${body.endlocation}, ${body.coralspeed}, ${body.processorspeed}, ${body.netspeed}, ${body.algaeremovalspeed}, 
      ${body.climbspeed}, ${body.maneuverability}, ${body.defenseplayed}, ${body.defenseevasion}, ${body.aggression}, ${body.cagehazard}, 
      ${body.coralgrndintake}, ${body.coralstationintake}, ${body.algaegrndintake}, ${body.algaehighreefintake}, ${body.algaelowreefintake}, 
      ${body.generalcomments}, ${body.breakdowncomments}, ${body.defensecomments}
      )`;      

  return NextResponse.json({ message: "Success!" }, { status: 201 });
}

