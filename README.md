## Getting Started

First, install the dependencies:

```bash
npm install
```

Next, set up the database on Vercel with test data.
```sql

CREATE TABLE scc2025 (
   ID serial PRIMARY KEY,
   -- Match Info
   ScoutName VARCHAR(255),
   ScoutTeam INT,
   Team INT,
   Match INT,
   MatchType INT,
   NoShow BOOLEAN,
   
   -- Auto
   AutoClimb VARCHAR(50), -- None, Success, Fail
   AutoClimbPosition VARCHAR(50), -- Left, Center, Right (only set if AutoClimb is Success)
   AutoFuel INT,
   WinAuto BOOLEAN,
   
   -- Tele
   IntakeGround BOOLEAN,
   IntakeOutpost BOOLEAN,
   PassingBulldozer BOOLEAN,
   PassingShooter BOOLEAN,
   PassingDump BOOLEAN,
   ShootWhileMove BOOLEAN,
   TeleFuel INT,
   DefenseLocationAZOutpost BOOLEAN,
   DefenseLocationAZTower BOOLEAN,
   DefenseLocationNZ BOOLEAN,
   DefenseLocationTrench BOOLEAN,
   DefenseLocationBump BOOLEAN,
   
   -- End
   EndClimb VARCHAR(50), -- L1, L2, L3, or NULL if None
   EndClimbPosition VARCHAR(50), -- Left, Center, Right (only set if EndClimb is set)
   
   -- Postmatch
   ShootingMechanism VARCHAR(50), -- Static or Turret
   Bump BOOLEAN,
   Trench BOOLEAN,
   StuckOnFuel BOOLEAN,
   FuelPercent VARCHAR(50), -- Percentage as string (e.g., "50%") or number
   PlayedDefense BOOLEAN,
   Defense VARCHAR(50), -- weak, harassment, game changing
   
   -- Qualitative Ratings (0-5 scale, -1 for not rated)
   Aggression INT DEFAULT -1,
   ClimbHazard INT DEFAULT -1,
   HopperCapacity INT DEFAULT -1,
   Maneuverability INT DEFAULT -1,
   Durability INT DEFAULT -1,
   DefenseEvasion INT DEFAULT -1,
   ClimbSpeed INT DEFAULT -1,
   FuelSpeed INT DEFAULT -1,
   PassingSpeed INT DEFAULT -1,
   AutoDeclimbSpeed INT DEFAULT -1,
   BumpSpeed INT DEFAULT -1,
   
   -- Comments
   GeneralComments TEXT,
   BreakdownComments TEXT
);

-- Example INSERT statement
INSERT INTO scc2025 (
   ScoutName, ScoutTeam, Team, Match, MatchType, NoShow,
   AutoClimb, AutoClimbPosition, AutoFuel, WinAuto,
   IntakeGround, IntakeOutpost, PassingBulldozer, PassingShooter, PassingDump, ShootWhileMove, TeleFuel,
   DefenseLocationAZOutpost, DefenseLocationAZTower, DefenseLocationNZ, DefenseLocationTrench, DefenseLocationBump,
   EndClimb, EndClimbPosition,
   ShootingMechanism, Bump, Trench, StuckOnFuel, FuelPercent, PlayedDefense, Defense,
   Aggression, ClimbHazard, HopperCapacity, Maneuverability, Durability, DefenseEvasion,
   ClimbSpeed, FuelSpeed, PassingSpeed, AutoDeclimbSpeed, BumpSpeed,
   GeneralComments, BreakdownComments
)
VALUES (
   'John Doe', 2485, 4909, 12, 2, FALSE,
   'Success', 'Left', 15, TRUE,
   TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, 42,
   FALSE, FALSE, TRUE, FALSE, FALSE,
   'L2', 'Center',
   'Turret', FALSE, TRUE, FALSE, '75%', TRUE, 'harassment',
   4, 2, 5, 4, 5, 3,
   4, 5, 3, 2, 3,
   'Performed well overall with strong fuel scoring.', 'did not break down'
);

```