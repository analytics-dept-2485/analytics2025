'use client';
import { Suspense, useState, useEffect } from "react";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, ResponsiveContainer, Cell, LineChart, Line, RadarChart, PolarRadiusAxis, PolarAngleAxis, PolarGrid, Radar, Legend } from 'recharts';
import { VictoryPie } from "victory";
import Link from "next/link";
import styles from "./page.module.css"
import { useSearchParams } from "next/navigation";
import PiecePlacement from "./components/PiecePlacement";
import dynamic from 'next/dynamic';
import Endgame from "./components/Endgame";
import Qualitative from "./components/Qualitative";
import EPALineChart from "./components/EPALineChart";


export default function MatchViewPage() {
  return <Suspense>
    <MatchView></MatchView>
  </Suspense>
}

function filterNegative(value) {
  return typeof value === 'number' && value >= 0 ? value : 0;
}

function MatchView() {
  const [allData, setAllData] = useState(null);
  const [data, setData] = useState(false);
  const searchParams = useSearchParams();
  //light to dark
  const COLORS = [
    ["#A6DDD9", "#79CDC6", "#51BEB5", "#3DA49B", "#32867F"], //green
    ["#C8DCF9", "#91B8F3", "#6CA0EF", "#387ee8", "#1f67d2"], //blue
    ["#D2B9DF", "#BF9DD2", "#AD81C5", "#9257B2", "#71408C"], //purple
    ["#F1D0E0", "#E7B1CC", "#DD92B6", "#CE6497", "#C44582"], //pink
    ["#FFD1D0", "#F7B7B7", "#DC8683", "#BE5151", "#A43D3D"], //red
    ["#FFC999", "#FFB370", "#FF9D47", "#FF7C0A", "#ed5e07"], //orange
    
  ];
  

  useEffect(() => {
    fetch("/api/get-alliance-data")
      .then(resp => resp.json())
      .then(data => {
          console.log("Fetched Data from API:", data);  // <-- Check what the API returns
          setAllData(data);
      });
}, []);



  useEffect(() => {
    if (searchParams && allData) {
      if (searchParams.get('match') == null || searchParams.get('match') == "") {
        //search by teams
        let [team1, team2, team3, team4, team5, team6] = [searchParams.get("team1"), searchParams.get("team2"), searchParams.get("team3"), searchParams.get("team4"), searchParams.get("team5"), searchParams.get("team6")];
        setData({team1: allData[team1], team2: allData[team2], team3: allData[team3], team4: allData[team4], team5: allData[team5], team6: allData[team6]});
      } else {
        //search by match
        fetch('/api/get-teams-of-match?match=' + searchParams.get('match')).then(resp => resp.json()).then(data => {
          if (data.message) {
            console.log(data.message);
          } else {
            //update url with teams
            const newParams = new URLSearchParams(searchParams);
            newParams.set('team1', data.team1);
            newParams.set('team2', data.team2);
            newParams.set('team3', data.team3);
            newParams.set('team4', data.team4);
            newParams.set('team5', data.team5);
            newParams.set('team6', data.team6);
            newParams.delete('match');

            const newUrl = `${window.location.pathname}?${newParams.toString()}`;
            window.history.replaceState(null, 'Picklist', newUrl);
            
            setData({team1: allData[data.team1], team2: allData[data.team2], team3: allData[data.team3], team4: allData[data.team4], team5: allData[data.team5], team6: allData[data.team6]});
          }
        })

      }
    }
  }, [searchParams, allData]);

  //until url loads show loading
  if (!data || searchParams == null) {
    return <div>
      <h1>Loading...</h1>
    </div>
  }

  const defaultTeam = {
    team: 404,
    teamName: "Invisibotics 👻",
    last3Auto: 0,
    last3Tele: 0,
    last3End: 0,
    last3EPA: 0,
    avgFuel: 0,
    leave: false,
    autoClimb: 0,
    endgame: { none: 100, L1: 0, L2: 0, L3: 0, fail: 0},
    qualitative: { fuelspeed: 0, maneuverability: 0, durability: 0, collectioncapacity: 0, passingspeed: 0, climbingspeed: 0, autodeclimbspeed: 0, bumpspeed: 0, defenseevasion: 0, aggression: 0, climbhazard: 0 }
  };

  //show form if systems are not a go
  if (searchParams.get("go") != "go") {
    return (
      <div>
        <form className={styles.teamForm}>
          <span>View by Teams...</span>
          <div className={styles.horizontalBox}>
          <div className={styles.RedInputs}>
            <div>
              <label htmlFor="team1">Red 1:</label>
              <br />
              <input id="team1" name="team1" defaultValue={searchParams.get("team1")}></input>
            </div>
            <div>
              <label htmlFor="team2">Red 2:</label>
              <br />
              <input id="team2" name="team2" defaultValue={searchParams.get("team2")}></input>
            </div>
            <div>
              <label htmlFor="team3">Red 3:</label>
              <br />
              <input id="team3" name="team3" defaultValue={searchParams.get("team3")}></input>
            </div>
          </div>
          <div className={styles.BlueInputs}>
            <div>
              <label htmlFor="team4">Blue 1:</label>
              <br />
              <input id="team4" name="team4" defaultValue={searchParams.get("team4")}></input>
            </div>
            <div>
              <label htmlFor="team5">Blue 2:</label>
              <br />
              <input id="team5" name="team5" defaultValue={searchParams.get("team5")}></input>
            </div>
            <div>
              <label htmlFor="team6">Blue 3:</label>
              <br />
              <input id="team6" name="team6" defaultValue={searchParams.get("team6")}></input>
            </div>
            </div>
            <input type="hidden" name="go" value="go"></input>
          </div>
          <span>Or by Match...</span>
          <label htmlFor="match">Match #</label>
          <input id="match" name="match" type="number"></input>
          <button>Go!</button>
        </form>
      </div>
    );
  }


  function AllianceButtons({t1, t2, t3, colors}) {
    return <div className={styles.allianceBoard}>
      <Link href={`/team-view?team=${t1.team}&team1=${data.team1?.team || ""}&team2=${data.team2?.team || ""}&team3=${data.team3?.team || ""}&team4=${data.team4?.team || ""}&team5=${data.team5?.team || ""}&team6=${data.team6?.team || ""}`}>
        <button style={{background: colors[0][1]}}>{t1.team}</button>
      </Link>
      <Link href={`/team-view?team=${t2.team}&team1=${data.team1?.team || ""}&team2=${data.team2?.team || ""}&team3=${data.team3?.team || ""}&team4=${data.team4?.team || ""}&team5=${data.team5?.team || ""}&team6=${data.team6?.team || ""}`}>
        <button style={{background: colors[1][1]}}>{t2.team}</button>
      </Link>
      <Link href={`/team-view?team=${t3.team}&team1=${data.team1?.team || ""}&team2=${data.team2?.team || ""}&team3=${data.team3?.team || ""}&team4=${data.team4?.team || ""}&team5=${data.team5?.team || ""}&team6=${data.team6?.team || ""}`}>
        <button style={{background: colors[2][1]}}>{t3.team}</button>
      </Link>
    </div>
  }

  function AllianceDisplay({teams, opponents, colors}) {
    //calc alliance espm breakdown
    const auto = (teams[0]?.last3Auto || 0) + (teams[1]?.last3Auto || 0) + (teams[2]?.last3Auto || 0);
    const tele = (teams[0]?.last3Tele || 0) + (teams[1]?.last3Tele || 0) + (teams[2]?.last3Tele || 0);
    const end = (teams[0]?.last3End || 0) + (teams[1]?.last3End || 0) + (teams[2]?.last3End || 0);
    const totalEPA = auto + tele + end;

    // Calculate total fuel scored (auto + tele)
    const totalFuel = auto + tele;
    
    // Calculate climb points
    const climbPoints = end;

    //calc ranking points
    const RGBColors = {
      red: "#FF9393",
      green: "#BFFEC1",
      yellow: "#FFDD9A"
    }
    
    // RP 1: Win RP (higher EPA than opponents)
    const teamEPA = (team) => team ? team.last3Auto + team.last3Tele + team.last3End : 0;
    const opponentsEPA = teamEPA(opponents[0]) + teamEPA(opponents[1]) + teamEPA(opponents[2]);
    let RP_WIN = RGBColors.red;
    if (totalEPA > opponentsEPA) RP_WIN = RGBColors.green;
    else if (totalEPA == opponentsEPA) RP_WIN = RGBColors.yellow;

    // RP 2: Energized - 100+ fuel scored
    let RP_ENERGIZED = RGBColors.red;
    if (totalFuel >= 100) RP_ENERGIZED = RGBColors.green;

    // RP 3: Supercharged - 360+ fuel scored
    let RP_SUPERCHARGED = RGBColors.red;
    if (totalFuel >= 360) RP_SUPERCHARGED = RGBColors.green;

    // RP 4: Traversal - 50+ climb points
    let RP_TRAVERSAL = RGBColors.red;
    if (climbPoints >= 50) RP_TRAVERSAL = RGBColors.green;

    return <div className={styles.lightBorderBox}>
      <div className={styles.scoreBreakdownContainer}>
        <div style={{background: colors[0]}} className={styles.EPABox}>{Math.round(totalEPA)}</div>
        <div className={styles.EPABreakdown}>
          <div style={{background: colors[1]}}>A: {Math.round(auto)}</div>
          <div style={{background: colors[1]}}>T: {Math.round(tele)}</div>
          <div style={{background: colors[1]}}>E: {Math.round(end)}</div>
        </div>
      </div>
      <div className={styles.RPs}>
        <div style={{background: colors[1]}}>RPs</div>
        <div style={{background: RP_WIN}}>Victory</div>
        <div style={{background: RP_ENERGIZED}}>Energized</div>
        <div style={{background: RP_SUPERCHARGED}}>Supercharged</div>
        <div style={{background: RP_TRAVERSAL}}>Traversal</div>
      </div>
    </div>
  
  }

  function TeamDisplay({teamData, colors, matchMax}) {

    const PiecePlacement = dynamic(() => import('./components/PiecePlacement'), { ssr: false });
    const endgameData = [
      { x: 'None', y: teamData.endgame.none },
      { x: 'Fail', y: teamData.endgame.fail},
      { x: 'L1', y: teamData.endgame.L1 },
      { x: 'L2', y: teamData.endgame.L2 },
      { x: 'L3', y: teamData.endgame.L3 },
    ];

    return <div className={styles.lightBorderBox}>
      <h1 style={{color: colors[3]}}>{teamData.team}</h1>
      <h2 style={{color: colors[3]}}>{teamData.teamName}</h2>
      <div className={styles.scoreBreakdownContainer}>
      <div style={{background: colors[0]}} className={styles.EPABox}>
        {Math.round(teamData.last3EPA)}
      </div>
      <div className={styles.EPABreakdown}>
        <div style={{background: colors[2]}}>A: {Math.round(teamData.last3Auto)}</div>
        <div style={{background: colors[2]}}>T: {Math.round(teamData.last3Tele)}</div>
        <div style={{background: colors[2]}}>E: {Math.round(teamData.last3End)}</div>
      </div>
      </div>
      <div className={styles.barchartContainer}>
        <h2>Average Fuel Scored</h2>
        <PiecePlacement 
          colors={colors}
          matchMax={matchMax} 
          fuel={teamData.avgFuel || 0}
        />
      </div>
      <div className={styles.chartContainer}>
        <h2 style={{marginBottom: "-40px"}}>Climb Distribution %</h2>
        <Endgame 
          colors={colors}
          endgameData={endgameData}
        />
      </div>
    </div>
  }
  
  let get = (alliance, thing) => {
    let sum = 0;
    if (alliance[0] && alliance[0][thing]) sum += alliance[0][thing];
    if (alliance[1] && alliance[1][thing]) sum += alliance[1][thing];
    if (alliance[2] && alliance[2][thing]) sum += alliance[2][thing];
    return sum;
  }
  
  const redAlliance = [data.team1 || defaultTeam, data.team2 || defaultTeam, data.team3 || defaultTeam];
  const blueAlliance = [data.team4 || defaultTeam, data.team5 || defaultTeam, data.team6 || defaultTeam];
  let blueScores = [0, get(blueAlliance, "last3Auto")]
  blueScores.push(blueScores[1] + get(blueAlliance, "last3Tele"))
  blueScores.push(blueScores[2] + get(blueAlliance, "last3End"))
  let redScores = [0, get(redAlliance, "last3Auto")]
  redScores.push(redScores[1] + get(redAlliance, "last3Tele"))
  redScores.push(redScores[2] + get(redAlliance, "last3End"));
  let epaData = [
    {name: "Start", blue: 0, red: 0},
    {name: "Auto", blue: blueScores[1], red: redScores[1]},
    {name: "Tele", blue: blueScores[2], red: redScores[2]},
    {name: "End", blue: blueScores[3], red: redScores[3]},
  ];

  // Create two different radar datasets like in the screenshot
  // First radar: Climbing/Defense focus
  const climbingRadarData = [
    { qual: 'climbhazard', team1: filterNegative(data?.team1?.qualitative?.climbhazard) || 0, team2: filterNegative(data?.team2?.qualitative?.climbhazard) || 0, team3: filterNegative(data?.team3?.qualitative?.climbhazard) || 0, team4: filterNegative(data?.team4?.qualitative?.climbhazard) || 0, team5: filterNegative(data?.team5?.qualitative?.climbhazard) || 0, team6: filterNegative(data?.team6?.qualitative?.climbhazard) || 0 },
    { qual: 'maneuverability', team1: filterNegative(data?.team1?.qualitative?.maneuverability) || 0, team2: filterNegative(data?.team2?.qualitative?.maneuverability) || 0, team3: filterNegative(data?.team3?.qualitative?.maneuverability) || 0, team4: filterNegative(data?.team4?.qualitative?.maneuverability) || 0, team5: filterNegative(data?.team5?.qualitative?.maneuverability) || 0, team6: filterNegative(data?.team6?.qualitative?.maneuverability) || 0 },
    { qual: 'autodeclimbspeed', team1: filterNegative(data?.team1?.qualitative?.autodeclimbspeed) || 0, team2: filterNegative(data?.team2?.qualitative?.autodeclimbspeed) || 0, team3: filterNegative(data?.team3?.qualitative?.autodeclimbspeed) || 0, team4: filterNegative(data?.team4?.qualitative?.autodeclimbspeed) || 0, team5: filterNegative(data?.team5?.qualitative?.autodeclimbspeed) || 0, team6: filterNegative(data?.team6?.qualitative?.autodeclimbspeed) || 0 },
    { qual: 'passingspeed', team1: filterNegative(data?.team1?.qualitative?.passingspeed) || 0, team2: filterNegative(data?.team2?.qualitative?.passingspeed) || 0, team3: filterNegative(data?.team3?.qualitative?.passingspeed) || 0, team4: filterNegative(data?.team4?.qualitative?.passingspeed) || 0, team5: filterNegative(data?.team5?.qualitative?.passingspeed) || 0, team6: filterNegative(data?.team6?.qualitative?.passingspeed) || 0 },
    { qual: 'defenseevasion', team1: filterNegative(data?.team1?.qualitative?.defenseevasion) || 0, team2: filterNegative(data?.team2?.qualitative?.defenseevasion) || 0, team3: filterNegative(data?.team3?.qualitative?.defenseevasion) || 0, team4: filterNegative(data?.team4?.qualitative?.defenseevasion) || 0, team5: filterNegative(data?.team5?.qualitative?.defenseevasion) || 0, team6: filterNegative(data?.team6?.qualitative?.defenseevasion) || 0 },
    { qual: 'bumpspeed', team1: filterNegative(data?.team1?.qualitative?.bumpspeed) || 0, team2: filterNegative(data?.team2?.qualitative?.bumpspeed) || 0, team3: filterNegative(data?.team3?.qualitative?.bumpspeed) || 0, team4: filterNegative(data?.team4?.qualitative?.bumpspeed) || 0, team5: filterNegative(data?.team5?.qualitative?.bumpspeed) || 0, team6: filterNegative(data?.team6?.qualitative?.bumpspeed) || 0 },
  ];

  // Second radar: Fuel/Collection focus  
  const fuelRadarData = [
    { qual: 'collectioncapacity', team1: filterNegative(data?.team1?.qualitative?.collectioncapacity) || 0, team2: filterNegative(data?.team2?.qualitative?.collectioncapacity) || 0, team3: filterNegative(data?.team3?.qualitative?.collectioncapacity) || 0, team4: filterNegative(data?.team4?.qualitative?.collectioncapacity) || 0, team5: filterNegative(data?.team5?.qualitative?.collectioncapacity) || 0, team6: filterNegative(data?.team6?.qualitative?.collectioncapacity) || 0 },
    { qual: 'maneuverability', team1: filterNegative(data?.team1?.qualitative?.maneuverability) || 0, team2: filterNegative(data?.team2?.qualitative?.maneuverability) || 0, team3: filterNegative(data?.team3?.qualitative?.maneuverability) || 0, team4: filterNegative(data?.team4?.qualitative?.maneuverability) || 0, team5: filterNegative(data?.team5?.qualitative?.maneuverability) || 0, team6: filterNegative(data?.team6?.qualitative?.maneuverability) || 0 },
    { qual: 'durability', team1: filterNegative(data?.team1?.qualitative?.durability) || 0, team2: filterNegative(data?.team2?.qualitative?.durability) || 0, team3: filterNegative(data?.team3?.qualitative?.durability) || 0, team4: filterNegative(data?.team4?.qualitative?.durability) || 0, team5: filterNegative(data?.team5?.qualitative?.durability) || 0, team6: filterNegative(data?.team6?.qualitative?.durability) || 0 },
    { qual: 'fuelspeed', team1: filterNegative(data?.team1?.qualitative?.fuelspeed) || 0, team2: filterNegative(data?.team2?.qualitative?.fuelspeed) || 0, team3: filterNegative(data?.team3?.qualitative?.fuelspeed) || 0, team4: filterNegative(data?.team4?.qualitative?.fuelspeed) || 0, team5: filterNegative(data?.team5?.qualitative?.fuelspeed) || 0, team6: filterNegative(data?.team6?.qualitative?.fuelspeed) || 0 },
    { qual: 'passingspeed', team1: filterNegative(data?.team1?.qualitative?.passingspeed) || 0, team2: filterNegative(data?.team2?.qualitative?.passingspeed) || 0, team3: filterNegative(data?.team3?.qualitative?.passingspeed) || 0, team4: filterNegative(data?.team4?.qualitative?.passingspeed) || 0, team5: filterNegative(data?.team5?.qualitative?.passingspeed) || 0, team6: filterNegative(data?.team6?.qualitative?.passingspeed) || 0 },
    { qual: 'defenseevasion', team1: filterNegative(data?.team1?.qualitative?.defenseevasion) || 0, team2: filterNegative(data?.team2?.qualitative?.defenseevasion) || 0, team3: filterNegative(data?.team3?.qualitative?.defenseevasion) || 0, team4: filterNegative(data?.team4?.qualitative?.defenseevasion) || 0, team5: filterNegative(data?.team5?.qualitative?.defenseevasion) || 0, team6: filterNegative(data?.team6?.qualitative?.defenseevasion) || 0 },
    { qual: 'bumpspeed', team1: filterNegative(data?.team1?.qualitative?.bumpspeed) || 0, team2: filterNegative(data?.team2?.qualitative?.bumpspeed) || 0, team3: filterNegative(data?.team3?.qualitative?.bumpspeed) || 0, team4: filterNegative(data?.team4?.qualitative?.bumpspeed) || 0, team5: filterNegative(data?.team5?.qualitative?.bumpspeed) || 0, team6: filterNegative(data?.team6?.qualitative?.bumpspeed) || 0 },
  ];

  let matchMax = 0;
  for (let teamData of [data.team1, data.team2, data.team3, data.team4, data.team5, data.team6]) {
   if (teamData) {
    matchMax = Math.max(teamData.avgFuel || 0, matchMax);
  }
   }
  matchMax = Math.floor(matchMax) + 2; 

  return (
    <div>
      <div className={styles.matchNav}>
        <AllianceButtons t1={data.team1 || defaultTeam} t2={data.team2 || defaultTeam} t3={data.team3 || defaultTeam} colors={[COLORS[3], COLORS[4], COLORS[5]]}></AllianceButtons>
        <Link href={`/match-view?team1=${data.team1?.team || ""}&team2=${data.team2?.team || ""}&team3=${data.team3?.team || ""}&team4=${data.team4?.team || ""}&team5=${data.team5?.team || ""}&team6=${data.team6?.team || ""}`}>
          <button style={{background: "#ffff88", color: "black"}}>EDIT</button>
        </Link>
        <AllianceButtons t1={data.team4 || defaultTeam} t2={data.team5 || defaultTeam} t3={data.team6 || defaultTeam} colors={[COLORS[0], COLORS[1], COLORS[2]]}></AllianceButtons>
      </div>
      <div className={styles.allianceEPAs}>
        <AllianceDisplay teams={redAlliance} opponents={blueAlliance} colors={["#FFD5E1", "#F29FA6"]}></AllianceDisplay>
        <AllianceDisplay teams={blueAlliance} opponents={redAlliance} colors={["#D3DFFF", "#8FA5F5"]}></AllianceDisplay>
      </div>
      <div className={styles.allianceGraphs}>
        <div className={styles.graphContainer}>
          <h2>Fuel Distribution</h2>
          <Qualitative 
            radarData={fuelRadarData} 
            teamIndices={[1, 2, 3]} 
            colors={[COLORS[3][2], COLORS[4][1], COLORS[5][2]]}
            teamNumbers={[
              (data.team1 || defaultTeam).team,
              (data.team2 || defaultTeam).team,
              (data.team3 || defaultTeam).team
            ]}
          />
        </div>
        <div className={styles.lineGraphContainer}>
          <h2>EPA Over Time</h2>
          <br></br>
          <EPALineChart data={epaData}/>
        </div>
        <div className={styles.graphContainer}>
          <h2>Fuel Distribution</h2>
          <Qualitative 
            radarData={climbingRadarData} 
            teamIndices={[4, 5, 6]} 
            colors={[COLORS[0][2], COLORS[1][1], COLORS[2][2]]} 
            teamNumbers={[
              (data.team4 || defaultTeam).team,
              (data.team5 || defaultTeam).team,
              (data.team6 || defaultTeam).team
            ]}
          />
        </div>
      </div>
      <div className={styles.matches}>
        <TeamDisplay teamData={data.team1 || defaultTeam} colors={COLORS[3]} matchMax={matchMax}></TeamDisplay>
        <TeamDisplay teamData={data.team2 || defaultTeam} colors={COLORS[4]} matchMax={matchMax}></TeamDisplay>
        <TeamDisplay teamData={data.team3 || defaultTeam} colors={COLORS[5]} matchMax={matchMax}></TeamDisplay>
      </div>
      <div className={styles.matches}>
        <TeamDisplay teamData={data.team4 || defaultTeam} colors={COLORS[0]} matchMax={matchMax}></TeamDisplay>
        <TeamDisplay teamData={data.team5 || defaultTeam} colors={COLORS[1]} matchMax={matchMax}></TeamDisplay>
        <TeamDisplay teamData={data.team6 || defaultTeam} colors={COLORS[2]} matchMax={matchMax}></TeamDisplay>
      </div>
    </div>
  )
}