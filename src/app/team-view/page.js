"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import VBox from "./components/VBox";
import HBox from "./components/HBox";
import Comments from "./components/Comments";
import TwoByTwo from "./components/TwoByTwo";
import ThreeByThree from "./components/ThreeByThree";
import FourByTwo from "./components/FourByTwo";
import EPALineChart from './components/EPALineChart';
import PiecePlacement from "./components/PiecePlacement";
import Endgame from "./components/Endgame";
import Qualitative from "./components/Qualitative";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, RadarChart, PolarRadiusAxis, PolarAngleAxis, PolarGrid, Radar, Legend } from 'recharts';
import ClimbTable from "./components/ClimbTable";
import VBoxCheck from "./components/VBoxCheck";






export default function TeamViewPage() {
   return (
       <Suspense>
           <TeamView />
       </Suspense>
   );
}


function filterNegative(value) {
 return typeof value === 'number' && value >= 0 ? value : 0;
}




function TeamView() {


   //for backend
   //const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const searchParams = useSearchParams();
   const team = searchParams.get("team");
   const hasTopBar = searchParams.get('team1') !== null;


   function AllianceButtons({t1, t2, t3, colors}) {
     console.log(searchParams.get('team6'))
     return <div className={styles.allianceBoard}>
       <Link href={`/team-view?team=${t1 || ""}&${searchParams.toString()}`}>
         <button style={team == t1 ? {background: 'black', color: 'yellow'} : {background: colors[0][1]}}>{t1 || 404}</button>
       </Link>
       <Link href={`/team-view?team=${t2 || ""}&${searchParams.toString()}`}>
         <button style={team == t2 ? {background: 'black', color: 'yellow'} : {background: colors[1][1]}}>{t2 || 404}</button>
       </Link>
       <Link href={`/team-view?team=${t3 || ""}&${searchParams.toString()}`}>
         <button style={team == t3 ? {background: 'black', color: 'yellow'} : {background: colors[2][1]}}>{t3 || 404}</button>
       </Link>
     </div>
   }
   function TopBar() {
     const COLORS = [
       ["#B7F7F2", "#A1E7E1", "#75C6BF", "#5EB5AE"],
       ["#8AB8FD", "#7D99FF", "#6184DD", "#306BDD"],
       ["#E1BFFA", "#E1A6FE", "#CA91F2", "#A546DF"],
       ["#FFC6F6", "#ECA6E0", "#ED75D9", "#C342AE"],
       ["#FABFC4", "#FEA6AD", "#F29199", "#E67983"],
       ["#FFE3D3", "#EBB291", "#E19A70", "#D7814F"],
     ];
     if (!hasTopBar) {
       return <></>
     }
     return <div className={styles.matchNav}>
       <AllianceButtons t1={searchParams.get('team1')} t2={searchParams.get('team2')} t3={searchParams.get('team3')} colors={[COLORS[0], COLORS[1], COLORS[2]]}></AllianceButtons>
       <Link href={`/match-view?team1=${searchParams.get('team1') || ""}&team2=${searchParams.get('team2') || ""}&team3=${searchParams.get('team3') || ""}&team4=${searchParams.get('team4') || ""}&team5=${searchParams.get('team5') || ""}&team6=${searchParams.get('team6') || ""}&go=go`}><button style={{background: "#ffff88", color: "black"}}>Match</button></Link>
       <AllianceButtons t1={searchParams.get('team4')} t2={searchParams.get('team5')} t3={searchParams.get('team6')} colors={[COLORS[3], COLORS[4], COLORS[5]]}></AllianceButtons>
     </div>
   }




   let data={
     team: 2485,
     name: "Overclocked",
     avgEpa: 73,
     avgAuto: 20,
     avgTele: 56,
     avgEnd: 12,
     last3Epa: 70,
     last3Auto: 30,
     last3Tele: 53,
     last3End: 2,
     epaOverTime: [{match: 3, epa: 60},{match: 10, epa: 43},{match: 13, epa: 12}],
     epaRegression: [{match: 3, epa: 60}, {match: 13, epa: 12}], //not sure how we should do this one
     consistency: 98,
     stuckOnFuel: 12,
     defense: 11,
     shootingMechanism: "Turret",
     lastBreakdown: 2,
     noShow: 1,
     breakdown: 9,
     matchesScouted: 3,
     scouts: ["Yael", "Ella", "Max",],
     generalComments: ["pretty good", "fragile intake","hooray!"],
     breakdownComments: ["stopped moving"],
     defenseComments: ["defended coral human player station"],
   
     autoOverTime: [{match: 8, auto: 30},{match: 10, auto: 10},{match: 13, auto: 2}],
     leave: 93,
     autoclimb: {
       success: 7,
       fail: 88,
       none: 3,
     },
     autoMedianFuel: 3,
     teleOverTime: [{match: 8, tele: 30}, {match: 10, tele: 78}, {match: 13, tele: 42}],
     teleMedianFuel: 2,
     passing: {
       shooter: 10,
       bulldozer: 2,
       dump: 30,
     },
     defenseQuality: {
       weak: 10,
       harassment: 2,
       gameChanging: 30,
     },
     defenseLocation: {
       allianceZone: 12,
       neutralZone: 8,
       trench: 10,
       bump: 2,
       tower: 5,
       outpost: 3,
       hub: 7,
     },
   
     endPlacement: {
       none: {
         left: 2,
         right: 3,
         center: 2,
       },
       L1: {
         left: 3,
         right: 4,
         center: 1,
       },
       L2: {
         left: 5,
         right: 2,
         center: 3,
       },
       L3: {
         left: 6,
         right: 1,
         center: 1,
       },
     },
     qualitative: [
       {name: "Hopper Capacity", rating: 5},
       {name: "Maneuverability", rating: 4},
       {name: "Durability", rating: 3},
       {name: "Fuel Speed", rating: 5},
       {name: "Passing Speed", rating: 3},
       {name: "Climb Speed", rating: 4},
       {name: "Auto De-Climb Speed", rating: 5},
       {name: "Bump Speed", rating: 0},
       {name: "Defense Evasion", rating: 1},
       {name: "Climb Hazard*", rating: 2},
       {name: "Aggression*"},
     ],
     groundIntake: true,
     outpostIntake: true,
     shootWhileMove: true,
     bumpTrav: true,
     trenchTrav: true,
     wideClimb: true,
   }




   // Fetch team data from backend
 //   function fetchTeamData(team) {
 //     setLoading(true);
 //     setError(null);
  //     fetch(`/api/get-team-data?team=${team}`)
 //         .then(response => {
 //             if (!response.ok) {
 //                 throw new Error("Failed to fetch data");
 //             }
 //             return response.json();
 //         })
 //         .then(data => {
 //             console.log("Fetched Data:", data);  // <-- Log the data received


 //             setData(data);
 //             console.log("Coral Total (Frontend):", data.leave);
 //             const last3Matches = data.matches.slice(-3);


 //             const last3Epa = last3Matches.reduce((sum, match) => sum + match.epa, 0) / last3Matches.length;
 //             const last3Auto = last3Matches.reduce((sum, match) => sum + match.auto, 0) / last3Matches.length;
 //             const last3Tele = last3Matches.reduce((sum, match) => sum + match.tele, 0) / last3Matches.length;
 //             const last3End = last3Matches.reduce((sum, match) => sum + match.end, 0) / last3Matches.length;


 //             // Add the calculated metrics to the data object
 //             data.last3Epa = last3Epa;
 //             data.last3Auto = last3Auto;
 //             data.last3Tele = last3Tele;
 //             data.last3End = last3End;
 //             setLoading(false);
 //         })
 //         .catch(error => {
 //             console.error("Fetch error:", error);
            
 //             setError(error.message);
 //             setLoading(false);
 //         });
 // }




   // useEffect(() => {
   //     if (team) {
   //         fetchTeamData(team);
   //     }
   // }, [team]);


   useEffect(() => {
     setLoading(false);
   }, []);


   if (!team) {
       return (
           <div>
               <form className={styles.teamInputForm}>
                   <span>{error}</span>
                   <label htmlFor="team">Team: </label>
                   <input id="team" name="team" placeholder="Team #" type="number"></input>
                   <br></br>
                   <button>Go!</button>
               </form>
           </div>
       );
   }


   if (loading) {
       return (
           <div>
               <h1>Loading...</h1>
           </div>
       );
   }


   if (!data) {
       return (
           <div>
               <h1>No data found for team {team}</h1>
           </div>
       );
   }


   const Colors = [
       //light to dark
       ["#CCFBF7", "#76E3D3", "#18a9a2", "#117772"], //green
       ["#D7F2FF", "#7dd4ff", "#38b6f4", "#0A6D9F"], //blue
       ["#D7D8FF", "#a0a3fb", "#8488FF", "#2022AA"], //blue-purple
       ["#F3D8FB", "#DBA2ED", "#C37DDB", "#8E639C"], //pink-purple
       ["#FFDDF3", "#EDA2DB", "#DD64C0", "#9C6392"], //pink
   ];


   const epaColors = {
     red1: "#fa8888",
     red2: "#F7AFAF",
     yellow1: "#ffe16b",
     yellow2: "#ffff9e",
     green1: "#7FD689",
     green2: "#c4f19f",
   }


   //overall last3epa
   let overallLast3 = epaColors.yellow1;
   if ((data.avgEpa + 12) < data.last3Epa) overallLast3 = epaColors.green1;
   else if ((data.avgEpa - 12) > data.last3Epa) overallLast3 = epaColors.red1;


   //auto last3epa
   let autoLast3 = epaColors.yellow2;
   if ((data.avgAuto + 6) < data.last3Auto) autoLast3 = epaColors.green2;
   else if ((data.avgAuto - 6) > data.last3Auto) autoLast3 = epaColors.red2;


   //tele last3epa
   let teleLast3 = epaColors.yellow2;
   if ((data.avgTele + 10) < data.last3Tele) teleLast3 = epaColors.green2;
   else if ((data.avgTele - 10) > data.last3Tele) teleLast3 = epaColors.red2;


   //tele last3epa
   let endLast3 = epaColors.yellow2;
   if ((data.avgEnd + 6) < data.last3End) endLast3 = epaColors.green2;
   else if ((data.avgEnd - 6) > data.last3End) endLast3 = epaColors.red2;


   const endgamePieData = [
       { x: 'None', y: (data.endPlacement.none.left+data.endPlacement.none.right+data.endPlacement.none.center)},
       { x: 'L1', y: (data.endPlacement.L1.left+data.endPlacement.L1.right+data.endPlacement.L1.center)},
       { x: 'L2', y: (data.endPlacement.L2.left+data.endPlacement.L2.right+data.endPlacement.L2.center)},
       { x: 'L3', y: (data.endPlacement.L3.left+data.endPlacement.L3.right+data.endPlacement.L3.center)}
   ];
   const autoPieData = [
    { x: 'None', y: (data.autoclimb.none)},
    { x: 'Success', y: (data.autoclimb.success)},
    { x: 'Fail', y: (data.autoclimb.fail)},
];




   return (<div>
         <TopBar></TopBar>
       <div className={styles.MainDiv}>
           <div className={styles.leftColumn}>
               <h1 style={{ color: Colors[0][3] }}>Team {data.team} View</h1>
               <h3>{data.name}</h3>
               <div className={styles.EPAS}>
                   <div className={styles.EPA}>
                       <div className={styles.scoreBreakdownContainer}>
                           <div style={{ background: Colors[0][1] }} className={styles.epaBox}>{Math.round(10*data.avgEpa)/10}</div>
                           <div className={styles.epaBreakdown}>
                               <div style={{ background: Colors[0][0] }}>A: {Math.round(10*data.avgAuto)/10}</div>
                               <div style={{ background: Colors[0][0] }}>T: {Math.round(10*data.avgTele)/10}</div>
                               <div style={{ background: Colors[0][0] }}>E: {Math.round(10*data.avgEnd)/10}</div>
                           </div>
                       </div>
                   </div>
                   <div className={styles.Last3EPA}>
                       <div className={styles.scoreBreakdownContainer}>
                           <div style={{background: overallLast3}} className={styles.Last3EpaBox}>{Math.round(10*data.last3Epa)/10}</div>
                             <div className={styles.epaBreakdown}>
                               <div style={{background: autoLast3}}>A: {Math.round(10*data.last3Auto)/10}</div>
                               <div style={{background: teleLast3}}>T: {Math.round(10*data.last3Tele)/10}</div>
                               <div style={{background: endLast3}}>E: {Math.round(10*data.last3End)/10}</div>
                             </div>
                           </div>
                         </div>
                   </div>
               <div className={styles.graphContainer}>
                   <h4 className={styles.graphTitle}>EPA Over Time</h4>
                   <EPALineChart data={data.epaOverTime} color={Colors[0][3]} label={"epa"}/>
                 </div>
               <div className={styles.valueBoxes}>
                 <div className={styles.leftColumnBoxes}>
                   <div className={styles.leftBoxR1}>
                     <VBox color1={Colors[0][1]} color2={Colors[0][0]} title={"Consistency"} value={data.consistency}/>
                     <VBox color1={Colors[0][1]} color2={Colors[0][0]} title={"Stuck on Fuel Easily"} value={data.stuckOnFuel}/>
                     <VBox color1={Colors[0][1]} color2={Colors[0][0]} title={"Last Breakdown"} value={data.lastBreakdown}/>
                   </div>
                   <div className={styles.leftBoxR2}>
                     <VBox color1={Colors[0][1]} color2={Colors[0][0]} title={"No Show"} value={data.noShow + "%"}/>
                     <VBox color1={Colors[0][1]} color2={Colors[0][0]} title={"Breakdown"} value={data.breakdown + "%"}/>
                     <VBox color1={Colors[0][1]} color2={Colors[0][0]} title={"Matches Scouted"} value={data.matchesScouted}/>
                   </div>
                   <div className={styles.leftBoxR3}>
                     <VBoxCheck color1={Colors[0][1]} color2={Colors[0][0]} title={"Shoot While Move?"} value={data.shootWhileMove}/>
                     <VBox color1={Colors[0][1]} color2={Colors[0][0]} title={"Shooting Mechanism"} value={data.shootingMechanism}/>
                     <table className={styles.horizontalTable2}> 
                     <tbody>
                      <tr>
                        <td style={{backgroundColor: Colors[0][1]}}>Bump</td>
                        <td style={{backgroundColor: Colors[0][1]}}>Trench</td>
                      </tr>
                      <tr>
                        <td className={styles.coloredBoxes} style={{backgroundColor: Colors[0][0], width: "50px", height: "30px"}}><input id="groundcheck" type="checkbox" readOnly checked={data.groundIntake}></input></td>
                        <td className={styles.coloredBoxes} style={{backgroundColor: Colors[0][0], width: "50px", height: "30px"}}><input id="groundcheck" type="checkbox" readOnly checked={data.outpostIntake}></input></td>
                      </tr>
                    </tbody>
                    </table>
                  </div>
      
                   <table className={styles.horizontalTable}> 
                  <tbody>
                    <tr>
                      <td style={{backgroundColor: Colors[0][2]}} rowSpan="2">Intake</td>
                      <td style={{backgroundColor: Colors[0][1]}}>Ground</td>
                      <td style={{backgroundColor: Colors[0][1]}}>Outpost</td>
                    </tr>
                    <tr>
                    <td className={styles.coloredBoxes} style={{backgroundColor: Colors[0][0], width: "50px", height: "30px"}}><input id="groundcheck" type="checkbox" readOnly checked={data.groundIntake}></input></td>
                    <td className={styles.coloredBoxes} style={{backgroundColor: Colors[0][0], width: "50px", height: "30px"}}><input id="groundcheck" type="checkbox" readOnly checked={data.outpostIntake}></input></td>
                    </tr>
                  </tbody>
                  </table>

                 </div>
                 <div className={styles.allComments}>
                   <Comments color1={Colors[0][1]} color2={Colors[0][0]} title={"General Comments"} value={data.generalComments} />
                   <Comments color1={Colors[0][1]} color2={Colors[0][0]} title={"Breakdown Comments"} value={data.breakdownComments} />
                   <Comments color1={Colors[0][1]} color2={Colors[0][0]} title={"Defense Comments"} value={data.defenseComments} />
                 </div>
                 <HBox color1={Colors[0][1]} color2={Colors[0][0]} title={"Scouts"} value={data.scouts} />
               </div>
         </div>




 <div className={styles.rightColumn}>
   <div className={styles.topRow}>
     <div className={styles.auto}>
       <h1 style={{ color: Colors[1][3] }}>Auto</h1>
         <div className={styles.graphContainer}>
             <h4 className={styles.graphTitle}>Auto Over Time</h4>
             <EPALineChart
               data={data.autoOverTime}
               color={Colors[1][3]}
               label={"auto"}
             />
         </div>
      <div className={styles.autoBox}>
        <div className={styles.autoPieBox}>
          <Endgame
            data={autoPieData}
            color={Colors[1]}
          />
        </div>
       <VBox color1={Colors[1][2]} color2={Colors[1][0]} color3={Colors[1][2]} title={"Median Fuel"} value={data.autoMedianFuel}/>
      </div>
     </div>


     <div className={styles.tele}>
       <h1 style={{ color: Colors[2][3] }}>Tele</h1>
         <div className={styles.graphContainer}>
           <h4 className={styles.graphTitle}>Tele Over Time</h4>
             <EPALineChart
               data={data.teleOverTime}
               color={Colors[2][3]}
               label={"tele"}
             />
           </div>
     <div className={styles.teleRightAlignment}>
       <div className={styles.alignElements}>
           <div className={styles.alignElements}>
             <div className={styles.rightColumnBoxesTwo}>
          <div className={styles.teleBox3}>
          <div className={styles.teleBox1}>
           <VBox color1={Colors[2][2]} color2={Colors[2][0]} color3={Colors[2][2]} title={"Median Fuel"} value={Math.round(10*data.teleMedianFuel)/10} />
           <div className={styles.teleBox2}>
            <table className={styles.horizontalTable}> 
              <tbody>
                <tr>
                  <td style={{backgroundColor: Colors[2][2]}} rowSpan="2">Passing</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Shooter</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Bulldozer</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Dump</td>
                </tr>
                <tr>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.passing.shooter}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.passing.bulldozer}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.passing.dump}%</td>
                </tr>
              </tbody>
            </table>
            <table className={styles.horizontalTable1}> 
              <tbody>
                <tr>
                  <td style={{backgroundColor: Colors[2][2]}} rowSpan="2">Defense Quality</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Weak</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Harassment</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Game Changing</td>
                </tr>
                <tr>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseQuality.weak}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseQuality.harassment}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseQuality.gameChanging}%</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

            <table className={styles.horizontalTable}> 
              <tbody>
                <tr>
                  <td style={{backgroundColor: Colors[2][2]}} rowSpan="2">Defense</td>
                  <td style={{backgroundColor: Colors[2][1]}}>AZ</td>
                  <td style={{backgroundColor: Colors[2][1]}}>NZ</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Trench</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Bump</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Tower</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Outpost</td>
                  <td style={{backgroundColor: Colors[2][1]}}>Hub</td>
                </tr>
                <tr>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseLocation.allianceZone}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseLocation.neutralZone}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseLocation.trench}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseLocation.bump}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseLocation.tower}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseLocation.outpost}%</td>
                  <td style={{backgroundColor: Colors[2][0]}}>{data.defenseLocation.hub}%</td>
                </tr>
              </tbody>
            </table>
            </div>
            </div>
         </div>
       </div>
     </div>
   </div>
   </div>
       <div className={styles.bottomRow}>
         <div className={styles.endgame}>
           <h1 className={styles.header} style={{ color: Colors[3][3] }}>Endgame</h1>
             <div className={styles.chartContainer}>
               <h4 className={styles.graphTitle}>Endgame Placement</h4>
               </div>
            <div className={styles.endPieBox}>
              <Endgame
                data={endgamePieData}
                color={Colors[3]}
              />
             </div>
             <div className={styles.endBoxes}>
             <VBoxCheck color1={Colors[3][1]} color2={Colors[3][0]} title={"Wide Climb?"} value={data.wideClimb}/>
              {/* <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Left</th>
                    <th>Center</th>
                    <th>Right</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>L3</td>
                    <td>#</td>
                    <td>#</td>
                    <td>#</td>
                  </tr>
                  <tr>
                    <td>L2</td>
                    <td>#</td>
                    <td>#</td>
                    <td>#</td>
                  </tr>
                  <tr>
                    <td>L1</td>
                    <td>#</td>
                    <td>#</td>
                    <td>#</td>
                  </tr>
                </tbody>
              </table> */}
              <ClimbTable
                R1C1 = {data.endPlacement.L1.left}
                R1C2 = {data.endPlacement.L1.center}
                R1C3 = {data.endPlacement.L1.right}
                R2C1 = {data.endPlacement.L2.left}
                R2C2 = {data.endPlacement.L2.center}
                R2C3 = {data.endPlacement.L2.right}
                R3C1 = {data.endPlacement.L3.left}
                R3C2 = {data.endPlacement.L3.center}
                R3C3 = {data.endPlacement.L1.right}
                color1={Colors[3][2]} 
                color2={Colors[3][1]}
                color3={Colors[3][0]}
              ></ClimbTable>
             </div>
         </div>


         <div className={styles.qualitative}>
         <h1 className={styles.header} style={{ color: Colors[4][3] }}>Qualitative</h1>
           <div className={styles.radarContainer}>
           <h4 className={styles.graphTitle} >Qualitative Ratings</h4>
           <Qualitative
               data={data.qualitative.map(q => ({
                 ...q,
                 rating: filterNegative(q.rating)
               }))}
               color1={Colors[4][2]}
               color2={Colors[4][2]}
             />
           <p>*Inverted so outside is good</p>
         </div>
        
       </div>
       </div>
   </div>
   </div>
   </div>
   )


 }
