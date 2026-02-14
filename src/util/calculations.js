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
  // autoclimb: 0=None, 1=Success, 2=Fail (or legacy 2=Success on some branches)
  if (record.autoclimb === 1 || record.autoclimb === 2) {
    points += 15; // L1 climb in auto
  }
  
  // Win Auto is just an indicator, no points awarded
  
  return points;
}

function calcTele(record) {
  // Teleop Fuel: 1 point per fuel scored in active HUB (endgame climb is in calcEnd)
  let points = 0;
  if (record.telefuel && record.telefuel > 0) {
    points += record.telefuel * 1;
  }
  return points;
}

function calcEnd(record) {
  // Endgame Climb: L1 = 10 points, L2 = 20 points, L3 = 30 points
  // endclimbposition: 0-8 (0=LeftL3, 1=LeftL2, 2=LeftL1, 3=CenterL3, ...); level = position % 3 → 0=L3, 1=L2, 2=L1
  if (record.endclimbposition != null && record.endclimbposition !== undefined) {
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