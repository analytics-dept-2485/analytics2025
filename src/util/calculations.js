// 2026 REBUILT Game Scoring Rules
// Auto: Only autoclimb is worth points — L1 success = 15 points. No auto fuel points.
// Teleop: Fuel = 1 point per fuel. End climb is in calcEnd (L1=10, L2=20, L3=30).
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
  // Teleop Fuel: 1 point per fuel scored in active HUB (endgame climb is in calcEnd)
  // Teleop: fuel only (1 point per fuel). End climb is in calcEnd, not here.
  let points = 0;
  if (record.telefuel && record.telefuel > 0) {
    points += record.telefuel * 1;
  }
  return points;
}

function calcEnd(record) {
  // Endgame Climb: L1 = 10 points, L2 = 20 points, L3 = 30 points
  // endclimbposition: 0-8 only; 9 or higher = none (no points)
  if (record.endclimbposition != null && record.endclimbposition !== undefined) {
    if (record.endclimbposition > 8) return 0; // 9 = none
    const level = record.endclimbposition % 3;
    if (level === 0) return 30; // L3
    if (level === 1) return 20; // L2
    if (level === 2) return 10; // L1
  }
  if (record.endclimb && (record.endclimbposition == null || record.endclimbposition === undefined)) {
    switch (String(record.endclimb).toUpperCase()) {
      case 'L1': return 10;
      case 'L2': return 20;
      case 'L3': return 30;
      default: break;
    }
  }
  return 0;
}

function calcEPA(record) {
  return calcAuto(record) + calcTele(record) + calcEnd(record);
}

export { calcAuto, calcTele, calcEnd, calcEPA };