function calcAuto(record) {
    return (
      record.autol1success * 3 + // Level 1 Coral
      record.autol2success * 4 + // Level 2 Coral
      record.autol3success * 6 + // Level 3 Coral
      record.autol4success * 7 + // Level 4 Coral
      record.autoprocessorsuccess * 6 + // Processor success
      record.autonetsuccess * 4 + // Net success
      (record.leave ? 2 : 0) // Leaving starting zone bonus
    );
  }
  
  function calcTele(record) {
    return (
      record.telel1success * 2 + // Level 1 Coral
      record.telel2success * 3 + // Level 2 Coral
      record.telel3success * 4 + // Level 3 Coral
      record.telel4success * 5 + // Level 4 Coral
      record.teleprocessorsuccess * 6 + // Processor success in teleop
      record.telenetsuccess * 4 + // Net success in teleop
      record.hpsuccess * 1 // Human player success bonus
    );
  }
  
  function calcEnd(record) {
    let endgamePoints = 0;
  
    switch (record.endlocation) {
      case 1:
        endgamePoints = 2; // Parked
        break;
      case 2:
        endgamePoints = 6; // Shallow Dock
        break;
      case 3:
        endgamePoints = 12; // Deep Dock
        break;
      case 4:
        endgamePoints = 0; // Failed Attempt
        break;
      default:
        endgamePoints = 0; // No endgame placement or invalid value
    }
    
    return endgamePoints;
  }
  
  function calcEPA(record) {
    return calcAuto(record) + calcTele(record) + calcEnd(record);
  }
  
  export { calcAuto, calcTele, calcEnd, calcEPA };