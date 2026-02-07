// 2026 REBUILT Game Scoring Rules
// Auto: Fuel = 1 point per fuel, Climb L1 = 15 points (max 2 robots)
// Teleop: Fuel = 1 point per fuel, Climb L1 = 10 points, L2 = 20 points, L3 = 30 points
// Win Auto = indicator only (no points)

function calcAuto(record) {
  let points = 0;
  
  // Auto Fuel: 1 point per fuel scored in active HUB
  if (record.autofuel && record.autofuel > 0) {
    points += record.autofuel * 1;
  }
  
  // Auto Climb: L1 = 15 points (only if successfully climbed)
  // Note: In auto, only L1 is possible and only max 2 robots can climb
  // autoclimb: 0=None, 1=Fail, 2=Success
  if (record.autoclimb === 2) {
    points += 15; // L1 climb in auto
  }
  
  // Win Auto is just an indicator, no points awarded
  
  return points;
}

function calcTele(record) {
  let points = 0;
  
  // Teleop Fuel: 1 point per fuel scored in active HUB
  if (record.telefuel && record.telefuel > 0) {
    points += record.telefuel * 1;
  }
  
  // Endgame Climb points (scored during teleop period):
  // L1 = 10 points, L2 = 20 points, L3 = 30 points
  if (record.endclimb) {
    switch (record.endclimb.toUpperCase()) {
      case 'L1':
        points += 10;
        break;
      case 'L2':
        points += 20;
        break;
      case 'L3':
        points += 30;
        break;
      default:
        // No points for invalid or None
        break;
    }
  }
  
  return points;
}

function calcEnd(record) {
  // Endgame points are already calculated in calcTele
  // This function is kept for compatibility but returns 0
  // The climb points are part of teleop scoring
  return 0;
}

function calcEPA(record) {
  return calcAuto(record) + calcTele(record) + calcEnd(record);
}

export { calcAuto, calcTele, calcEnd, calcEPA };