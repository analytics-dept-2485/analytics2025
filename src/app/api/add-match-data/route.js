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

  // Validate Pre-Match Data
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
  
  // Validate Auto Data
  if (
    !(
      _.isString(body.autoclimb) && // None, Success, Fail
      (body.autoclimb === 'None' || body.autoclimb === 'Success' || body.autoclimb === 'Fail') &&
      _.isNumber(body.autofuel) &&
      _.isBoolean(body.winauto)
    )
  ) {
    return NextResponse.json({ message: "Invalid Auto Data!" }, { status: 400 });
  }

  // If AutoClimb is Success, validate position
  if (body.autoclimb === 'Success' && body.autoclimbposition) {
    if (!['Left', 'Center', 'Right'].includes(body.autoclimbposition)) {
      return NextResponse.json({ message: "Invalid Auto Climb Position!" }, { status: 400 });
    }
  }
  
  // Validate Tele Data
  if (
    !(
      _.isBoolean(body.intakeground) &&
      _.isBoolean(body.intakeoutpost) &&
      _.isBoolean(body.passingbulldozer) &&
      _.isBoolean(body.passingshooter) &&
      _.isBoolean(body.passingdump) &&
      _.isBoolean(body.shootwhilemove) &&
      _.isNumber(body.telefuel) &&
      _.isBoolean(body.defenselocationazoutpost) &&
      _.isBoolean(body.defenselocationaztower) &&
      _.isBoolean(body.defenselocationnz) &&
      _.isBoolean(body.defenselocationtrench) &&
      _.isBoolean(body.defenselocationbump)
    )
  ) {
    return NextResponse.json({ message: "Invalid Tele Data!" }, { status: 400 });
  }
  
  // Validate Endgame Data
  if (body.endclimb !== null && body.endclimb !== undefined) {
    if (!_.isString(body.endclimb) || !['L1', 'L2', 'L3'].includes(body.endclimb.toUpperCase())) {
      return NextResponse.json({ message: "Invalid Endgame Data! EndClimb must be L1, L2, L3, or null" }, { status: 400 });
    }
    
    // If EndClimb is set, validate position
    if (body.endclimbposition && !['Left', 'Center', 'Right'].includes(body.endclimbposition)) {
      return NextResponse.json({ message: "Invalid End Climb Position!" }, { status: 400 });
    }
  }
  
  // Validate Postmatch Data
  if (
    !(
      _.isString(body.shootingmechanism) &&
      (body.shootingmechanism === 'Static' || body.shootingmechanism === 'Turret') &&
      _.isBoolean(body.bump) &&
      _.isBoolean(body.trench) &&
      _.isBoolean(body.stuckonfuel) &&
      (_.isString(body.fuelpercent) || _.isNumber(body.fuelpercent)) &&
      _.isBoolean(body.playeddefense) &&
      _.isString(body.defense) &&
      (body.defense === 'weak' || body.defense === 'harassment' || body.defense === 'game changing')
    )
  ) {
    return NextResponse.json({ message: "Invalid Postmatch Data!" }, { status: 400 });
  }

  // Validate Qualitative Ratings (0-5 scale, -1 for not rated)
  const qualitativeFields = [
    'aggression', 'climbhazard', 'hoppercapacity', 'maneuverability', 
    'durability', 'defenseevasion', 'climbspeed', 'fuelspeed', 
    'passingspeed', 'autodeclimbspeed', 'bumpspeed'
  ];

  for (let field of qualitativeFields) {
    if (!(_.isNumber(body[field]) && (body[field] >= -1 && body[field] <= 5))) {
      return NextResponse.json({ message: `Invalid Qualitative Data! ${field} must be between -1 and 5` }, { status: 400 });
    }
  }

  // Validate Comments
  if (
    !(
      _.isString(body.generalcomments) &&
      (_.isString(body.breakdowncomments) || _.isNull(body.breakdowncomments) || body.breakdowncomments === undefined)
    )
  ) {
    return NextResponse.json({ message: "Invalid Comments!" }, { status: 400 });
  }
  
  // Insert Data into Database
  let resp = await sql`
    INSERT INTO scc2025 (
      scoutname, scoutteam, team, match, matchtype, noshow,
      autoclimb, autoclimbposition, autofuel, winauto,
      intakeground, intakeoutpost, passingbulldozer, passingshooter, passingdump, shootwhilemove, telefuel,
      defenselocationazoutpost, defenselocationaztower, defenselocationnz, defenselocationtrench, defenselocationbump,
      endclimb, endclimbposition,
      shootingmechanism, bump, trench, stuckonfuel, fuelpercent, playeddefense, defense,
      aggression, climbhazard, hoppercapacity, maneuverability, durability, defenseevasion,
      climbspeed, fuelspeed, passingspeed, autodeclimbspeed, bumpspeed,
      generalcomments, breakdowncomments
    )
    VALUES (
      ${body.scoutname}, ${body.scoutteam}, ${body.team}, ${adjustedMatch}, ${body.matchType}, ${body.noshow},
      ${body.autoclimb}, ${body.autoclimb === 'Success' ? body.autoclimbposition : null}, ${body.autofuel}, ${body.winauto},
      ${body.intakeground}, ${body.intakeoutpost}, ${body.passingbulldozer}, ${body.passingshooter}, ${body.passingdump}, ${body.shootwhilemove}, ${body.telefuel},
      ${body.defenselocationazoutpost}, ${body.defenselocationaztower}, ${body.defenselocationnz}, ${body.defenselocationtrench}, ${body.defenselocationbump},
      ${body.endclimb || null}, ${body.endclimb && body.endclimbposition ? body.endclimbposition : null},
      ${body.shootingmechanism}, ${body.bump}, ${body.trench}, ${body.stuckonfuel}, ${body.fuelpercent}, ${body.playeddefense}, ${body.defense},
      ${body.aggression}, ${body.climbhazard}, ${body.hoppercapacity}, ${body.maneuverability}, ${body.durability}, ${body.defenseevasion},
      ${body.climbspeed}, ${body.fuelspeed}, ${body.passingspeed}, ${body.autodeclimbspeed}, ${body.bumpspeed},
      ${body.generalcomments}, ${body.breakdowncomments || null}
    )
  `;

  return NextResponse.json({ message: "Success!" }, { status: 201 });
}
