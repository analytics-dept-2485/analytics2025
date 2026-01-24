"use client";
import { useEffect, useRef, useState } from "react";
import Header from "./form-components/Header";
import TextInput from "./form-components/TextInput";
import styles from "./page.module.css";
import Checkbox from "./form-components/Checkbox";
import CommentBox from "./form-components/CommentBox";
import EndPlacement from "./form-components/EndPlacement";
import Qualitative from "./form-components/Qualitative";
import SubHeader from "./form-components/SubHeader";
import MatchType from "./form-components/MatchType";
import JSConfetti from 'js-confetti';
import FuelCounter from "./form-components/FuelCounter";
import AutoClimb from "./form-components/AutoClimb";
import autoClimbStyles from "./form-components/AutoClimb.module.css";
import ClimbCheckbox from "./form-components/ClimbCheckbox";
import DefenseBreakdown from "./form-components/DefenseBreakdown";

export default function Home() {
  const [noShow, setNoShow] = useState(false);
  const [breakdown, setBreakdown] = useState(false);
  const [defense, setDefense] = useState(false);
  const [matchType, setMatchType] = useState("2");
  const [scoutProfile, setScoutProfile] = useState(null);
  const [climbYesNo, setClimbYesNo] = useState("0");
  const [climbPosition, setClimbPosition] = useState("0");
  const [defenseType, setDefenseType] = useState("");

  const form = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem("ScoutProfile");
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)
        setScoutProfile(profileData);
        setMatchType(profileData.matchType || "2")
      }
    }
  }, []);
  
  function onNoShowChange(e) {
    let checked = e.target.checked;
    setNoShow(checked);
  }

  function onBreakdownChange(e) {
    let checked = e.target.checked;
    setBreakdown(checked);
  }
  function onDefenseChange(e) {
    let checked = e.target.checked;
    setDefense(checked);
    if (!checked) {
      setDefenseType(""); // Clear defense type when unchecked
    }
  }

  function onDefenseTypeChange(value) {
    setDefenseType(value);
  }
  
  function handleMatchTypeChange(value){
    setMatchType(value);
    console.log("Selected match type:", value);
};

  function handleClimbYesNo (value) {
    setClimbYesNo(value);
    console.log("Selected climb type:", value);
};

  function handleClimbPosition (value) {
    setClimbPosition(value);
    console.log("Selected climb position:", value);
};

  // added from last years code (still review)
  async function submit(e) {
    e.preventDefault();
    //disable submit
    let submitButton = document.querySelector("#submit");//todo: get changed to a useRef
    submitButton.disabled = true;
    //import values from form to data variable

    let data = {noshow: false, leave: false, algaelowreefintake: false, algaehighreefintake: false, algaegrndintake: false, coralgrndintake: false, coralstationintake: false, srcintake: false, breakdown: false, defense: false, stageplacement: -1, breakdowncomments: null, defensecomments: null, generalcomments: null, defensetype: null };
    [...new FormData(form.current).entries()].forEach(([name, value]) => {
      if (value == 'on') {
        data[name] = true;
      } else {
        if (!isNaN(value) && value != "") {
          data[name] = +value;
        } else {
          data[name] = value;
        }
      }
    });
     
    //clear unneeded checkbox values
    data.breakdown = undefined;
    data.defense = undefined;
    data.defensetype = defenseType;

    //check pre-match data
    let preMatchInputs = document.querySelectorAll(".preMatchInput"); //todo: use the data object
    for (let preMatchInput of preMatchInputs) {
      if(preMatchInput.value == "" || preMatchInput.value <= "0") {
        alert("Invalid Pre-Match Data!");
        submitButton.disabled = false;
        return;
      } 
    }
    if (matchType == 2) {
      try {
        const response = await fetch(`/api/get-valid-team?team=${data.team}&match=${data.match}`)
        const validationData = await response.json();
        
        if (!validationData.valid) {
          alert("Invalid Team and Match Combination!");
          submitButton.disabled = false;
          return;
        }
      } catch (error) {
        console.error("Validation error:", error);
        alert("Error validating team and match. Please try again.");
        submitButton.disabled = false;
        return;
      } 
    } else {
      try {
        const response = await fetch(`/api/get-valid-match-teams?team=${data.team}`)
        const validationData = await response.json();
        
        if (!validationData.valid) {
          alert("Invalid Team!");
          submitButton.disabled = false;
          return;
        }
      } catch (error) {
        console.error("Validation error:", error);
        alert("Error validating team. Please try again.");
        submitButton.disabled = false;
        return;
      } 
    }
    //confirm and submit
    if (confirm("Are you sure you want to submit?") == true) {
      fetch('/api/add-match-data', {
        method: "POST",
        body: JSON.stringify(data)
      }).then((response)=> {
        if(response.status === 201) {
          return response.json();
        } else {
          return response.json().then(err => Promise.reject(err.message));
        }
      }) 
      .then(data => {
        alert("Thank you!");
        const jsConfetti = new JSConfetti();
        jsConfetti.addConfetti({
        emojis: ['🐠', '🐡', '🦀', '🪸'],
        emojiSize: 100,
        confettiRadius: 3,
        confettiNumber: 100,
       })
       
        if (typeof document !== 'undefined')  {
          let ScoutName = document.querySelector("input[name='scoutname']").value;
          let ScoutTeam = document.querySelector("input[name='scoutteam']").value;
          let Match = document.querySelector("input[name='match']").value;
          let newProfile = { 
            scoutname: ScoutName, 
            scoutteam: ScoutTeam, 
            match: Number(Match)+1,
            matchType: matchType 
          };
          setScoutProfile(newProfile);
          localStorage.setItem("ScoutProfile", JSON.stringify(newProfile));
          console.log(scoutProfile)
        }

        globalThis.scrollTo({ top: 0, left: 0, behavior: "smooth" });

        setTimeout(() => {
          location.reload()
        }, 2000);
      })
      .catch(error => {
        alert(error);
        submitButton.disabled = false;
      });

    } else {
      //user didn't want to submit
      submitButton.disabled = false;
    };
  }
console.log("page",matchType)

  return (
    <div className={styles.MainDiv}>
      <form ref={form} name="Scouting Form" onSubmit={submit}>
        <Header headerName={"Match Info"} />
        <div className={styles.allMatchInfo}>
        <div className={styles.MatchInfo}>
        <TextInput 
            visibleName={"Scout Name:"} 
            internalName={"scoutname"} 
            defaultValue={scoutProfile?.scoutname || ""}
          />
          <TextInput 
            visibleName={"Team #:"} 
            internalName={"scoutteam"} 
            defaultValue={scoutProfile?.scoutteam || ""}
            type={"number"}
          />
          <TextInput
            visibleName={"Team Scouted:"}
            internalName={"team"}
            defaultValue={""}
            type={"number"}
          />
          <TextInput 
            visibleName={"Match #:"} 
            internalName={"match"} 
            defaultValue={scoutProfile?.match || ""}
            type={"number"}
          />
        </div>
        <MatchType onMatchTypeChange={handleMatchTypeChange} defaultValue={matchType}/>
        <Checkbox
          visibleName={"No Show"}
          internalName={"noshow"}
          changeListener={onNoShowChange}
        />
        </div>
        {!noShow && (
          <>
          <br></br>
            <div className={styles.Auto}>
              <Header headerName={"Auto"}/>

              <FuelCounter internalName={"auto fuel"}/>
            <div className={styles.AutoClimb}>
              <SubHeader subHeaderName={"Climb"}></SubHeader>

              <AutoClimb 
                onClimbChange={handleClimbYesNo} 
                defaultValue={climbYesNo}
              />
            
              
              {climbYesNo === "1" && (
                <div className={autoClimbStyles.ClimbYesNo}>
                  <div className={autoClimbStyles.radioGroup}>
                    <label>
                      <input
                        type="radio"
                        name="climbPosition"
                        value="1"
                        checked={climbPosition === "1"}
                        onChange={(e) => handleClimbPosition(e.target.value)}
                      />
                      Left
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="climbPosition"
                        value="2"
                        checked={climbPosition === "2"}
                        onChange={(e) => handleClimbPosition(e.target.value)}
                      />
                      Center
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="climbPosition"
                        value="3"
                        checked={climbPosition === "3"}
                        onChange={(e) => handleClimbPosition(e.target.value)}
                      />
                      Right
                    </label>
                  </div>
                </div>
              )}
          </div>
              <Checkbox visibleName={"Win Auto?"} internalName={"win auto"}/>
            </div>
              
              <br></br>
              <br></br>
            <div className={styles.Tele}>
             <Header headerName={"Tele"}/>


             <br></br>


             <SubHeader subHeaderName={"Intake"}></SubHeader>
             <br></br>
             <div className={styles.intakeBox}>
               <Checkbox visibleName={"Ground"}></Checkbox>
               <Checkbox visibleName={"Outpost"}></Checkbox>
             </div>


             <br></br>
             <br></br>


             <FuelCounter internalName={"tele fuel"}/>


             <Checkbox visibleName={"Shoot while move?"}></Checkbox>


             <br></br>
             <br></br>


             <SubHeader subHeaderName={"Passing?"}></SubHeader>
             <div className={styles.passingBox}>
               <Checkbox visibleName={"Bulldozer"}></Checkbox>
               <Checkbox visibleName={"Dumper"}></Checkbox>
               <Checkbox visibleName={"Shooter"}></Checkbox>
             </div>


             <br></br>



             <SubHeader subHeaderName={"Defense Location"}></SubHeader>
             <br></br>
             <div className={styles.defenseBox}>
               <Checkbox visibleName={"Alliance Zone"}></Checkbox>
               <Checkbox visibleName={"Neutral Zone"}></Checkbox>
               <Checkbox visibleName={"Trench"}></Checkbox>
               <Checkbox visibleName={"Bump"}></Checkbox>
               <Checkbox visibleName={"Outpost"}></Checkbox>
               <Checkbox visibleName={"Tower"}></Checkbox>
               <Checkbox visibleName={"Hub"}></Checkbox>
             </div>
            
           </div>

           <div className={styles.PostMatch}>
            <Header headerName={"Endgame"}/>
            <br></br>
            <SubHeader subHeaderName={"Climb"}></SubHeader>
            <div>
              <ClimbCheckbox></ClimbCheckbox>
            </div>

            <Checkbox visibleName={"None"} internalName={"noClimb"} />

           </div>


            <div className={styles.PostMatch}>       
              <Header headerName={"Post-Match"}/>
              <br></br>
                <div className={styles.percentFuel}>
                  <TextInput 
                    visibleName={"% of Alliance Fuel Scored by Robot:"} 
                    internalName={"percentfuel"} 
                    defaultValue={""}
                    type={"text"}
                  />
                </div>

                <br></br>

                <SubHeader subHeaderName={"Shooting Mechanism"}></SubHeader>
                <div className= {styles.shootingBox}>
                  <div className={autoClimbStyles.radioGroup}>
                    <label>
                        <input
                          type="radio"
                          name="staticShooting"
                        />
                        Static
                    </label>

                    <label>
                        <input
                          type="radio"
                          name="staticShooting"
                        />
                        Turret
                    </label>
                  </div>
                </div>
                <br></br>

                <SubHeader subHeaderName={"Terrain Capability"}></SubHeader>
                <br></br>
                <div className={styles.terrainBox}>
                  <Checkbox visibleName={"Bump"}></Checkbox>
                  <Checkbox visibleName={"Trench"}></Checkbox>
                </div>

                <br></br>
                <Checkbox visibleName={"Stuck on Fuel Easily?"} internalName={"stuckOnFuel"} />
              
                <div className={styles.Qual}>
                  <Qualitative                   
                    visibleName={"Hopper Capacity"}
                    internalName={"Hopper Capacity"}
                    description={"Hopper Capacity"}/>
                  <Qualitative                   
                    visibleName={"Maneuverability"}
                    internalName={"maneuverability"}
                    description={"Maneuverability"}/>
                  <Qualitative                   
                    visibleName={"Durability"}
                    internalName={"durability"}
                    description={"Durability"}/>
                  <Qualitative                   
                    visibleName={"Fuel Speed"}
                    internalName={"fuelspeed"}
                    description={"Fuel Speed"}/>
                  <Qualitative                   
                    visibleName={"Passing Speed"}
                    internalName={"passingspeed"}
                    description={"Passing Speed"}/>
                  <Qualitative                   
                    visibleName={"Climb Speed"}
                    internalName={"climbspeed"}
                    description={"Climb Speed"}/>
                  <Qualitative                   
                    visibleName={"Auto Declimb Speed"}
                    internalName={"autodeclimbspeed"}
                    description={"Auto Declimb Speed"}/>
                  <Qualitative                   
                    visibleName={"Bump Speed"}
                    internalName={"bumpspeed"}
                    description={"Bump Speed"}/>
                  <Qualitative                   
                    visibleName={"Defense Evasion"}
                    internalName={"defenseevasion"}
                    description={"Defense Evasion Ability"}/>
                  <Qualitative
                    visibleName={"Aggression"}
                    internalName={"aggression"}
                    description={"Aggression"}
                    symbol={"ⵔ"}/>
                  <Qualitative
                    visibleName={"Climb Hazard"}
                    internalName={"climbhazard"}
                    description={"Climb Hazard"}
                    symbol={"ⵔ"}/>
                </div>
              <br></br>

              <DefenseBreakdown 
                onBreakdownChange={onBreakdownChange}
                onDefenseChange={onDefenseChange}
                onDefenseTypeChange={onDefenseTypeChange}
                breakdownValue={breakdown}
                defenseValue={defense}
                defenseTypeValue={defenseType}
              />
              <CommentBox
                visibleName={"General Comments"}
                internalName={"generalcomments"}
              />
            </div>
          </>
        )}
        <br></br>
        <button id="submit" type="submit">SUBMIT</button>
      </form>
    </div>
  );
}