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
      _.isNumber(body.autoclimb) && // 0=None, 1=Success, 2=Fail
      (body.autoclimb === 0 || body.autoclimb === 1 || body.autoclimb === 2) &&
      _.isNumber(body.autofuel) &&
      _.isBoolean(body.winauto)
    )
  ) {
    return NextResponse.json({ message: "Invalid Auto Data!" }, { status: 400 });
  }

  // If AutoClimb is Success (1), validate position
  if (body.autoclimb === 1) {
    if (body.autoclimbposition !== null && body.autoclimbposition !== undefined) {
      if (!_.isNumber(body.autoclimbposition) || ![0, 1, 2].includes(body.autoclimbposition)) {
        return NextResponse.json({ message: "Invalid Auto Climb Position! Must be 0 (Left), 1 (Center), or 2 (Right)" }, { status: 400 });
      }
    }
  } else {
    // If not Success, position should be null
    body.autoclimbposition = null;
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
      _.isBoolean(body.defenselocationoutpost) &&
      _.isBoolean(body.defenselocationtower) &&
      _.isBoolean(body.defenselocationhub) &&
      _.isBoolean(body.defenselocationnz) &&
      _.isBoolean(body.defenselocationtrench) &&
      _.isBoolean(body.defenselocationbump)
    )
  ) {
    return NextResponse.json({ message: "Invalid Tele Data!" }, { status: 400 });
  }
  
  // Validate Endgame Data
  // EndClimbPosition: 0=LeftL3, 1=LeftL2, 2=LeftL1, 3=CenterL3, 4=CenterL2, 5=CenterL1, 6=RightL3, 7=RightL2, 8=RightL1 (NULL if None)
  if (body.endclimbposition !== null && body.endclimbposition !== undefined) {
    if (!_.isNumber(body.endclimbposition) || !(body.endclimbposition >= 0 && body.endclimbposition <= 8)) {
      return NextResponse.json({ message: "Invalid End Climb Position! Must be 0-8 (0=LeftL3, 1=LeftL2, 2=LeftL1, 3=CenterL3, 4=CenterL2, 5=CenterL1, 6=RightL3, 7=RightL2, 8=RightL1)" }, { status: 400 });
    }
  }
  
  // ClimbTF: True if climb attempt failed (None checkbox checked)
  if (!_.isBoolean(body.climbtf)) {
    return NextResponse.json({ message: "Invalid ClimbTF! Must be boolean" }, { status: 400 });
  }
  
  // Validate Postmatch Data
  if (
    !(
      _.isNumber(body.shootingmechanism) &&
      (body.shootingmechanism === 0 || body.shootingmechanism === 1) && // 0=Static, 1=Turret
      _.isBoolean(body.bump) &&
      _.isBoolean(body.trench) &&
      _.isBoolean(body.stuckonfuel) &&
      _.isNumber(body.fuelpercent) &&
      (body.fuelpercent >= 0 && body.fuelpercent <= 100) &&
      _.isBoolean(body.playeddefense)
    )
  ) {
    return NextResponse.json({ message: "Invalid Postmatch Data!" }, { status: 400 });
  }
  
  // Validate Defense (only required if playeddefense is true)
  if (body.playeddefense) {
    if (!_.isNumber(body.defense) || ![0, 1, 2].includes(body.defense)) {
      return NextResponse.json({ message: "Invalid Defense! Must be 0 (weak), 1 (harassment), or 2 (game changing)" }, { status: 400 });
    }
  } else {
    // If not playing defense, defense should be null
    body.defense = null;
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
      (_.isString(body.breakdowncomments) || _.isNull(body.breakdowncomments) || body.breakdowncomments === undefined) &&
      (_.isString(body.defensecomments) || _.isNull(body.defensecomments) || body.defensecomments === undefined)
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
      defenselocationoutpost, defenselocationtower, defenselocationhub, defenselocationnz, defenselocationtrench, defenselocationbump,
      endclimbposition, climbtf,
      shootingmechanism, bump, trench, stuckonfuel, fuelpercent, playeddefense, defense,
      aggression, climbhazard, hoppercapacity, maneuverability, durability, defenseevasion,
      climbspeed, fuelspeed, passingspeed, autodeclimbspeed, bumpspeed,
      generalcomments, breakdowncomments, defensecomments
    )
    VALUES (
      ${body.scoutname}, ${body.scoutteam}, ${body.team}, ${adjustedMatch}, ${body.matchType}, ${body.noshow},
      ${body.autoclimb}, ${body.autoclimb === 1 ? body.autoclimbposition : null}, ${body.autofuel}, ${body.winauto},
      ${body.intakeground}, ${body.intakeoutpost}, ${body.passingbulldozer}, ${body.passingshooter}, ${body.passingdump}, ${body.shootwhilemove}, ${body.telefuel},
      ${body.defenselocationoutpost}, ${body.defenselocationtower}, ${body.defenselocationhub}, ${body.defenselocationnz}, ${body.defenselocationtrench}, ${body.defenselocationbump},
      ${body.endclimbposition || null}, ${body.climbtf},
      ${body.shootingmechanism}, ${body.bump}, ${body.trench}, ${body.stuckonfuel}, ${body.fuelpercent}, ${body.playeddefense}, ${body.defense},
      ${body.aggression}, ${body.climbhazard}, ${body.hoppercapacity}, ${body.maneuverability}, ${body.durability}, ${body.defenseevasion},
      ${body.climbspeed}, ${body.fuelspeed}, ${body.passingspeed}, ${body.autodeclimbspeed}, ${body.bumpspeed},
      ${body.generalcomments}, ${body.breakdowncomments || null}, ${body.defensecomments || null}
    )
  `;

  return NextResponse.json({ message: "Success!" }, { status: 201 });
}
