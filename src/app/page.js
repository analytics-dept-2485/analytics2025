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


export default function Home() {
  const [noShow, setNoShow] = useState(false);
  const [breakdown, setBreakdown] = useState(false);
  const [defense, setDefense] = useState(false);
  const [matchType, setMatchType] = useState("2");
  const [scoutProfile, setScoutProfile] = useState(null);

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
  }

  
  function handleMatchTypeChange(value){
    setMatchType(value);
    console.log("Selected match type:", value);
};


  // added from last years code (still review)
  async function submit(e) {
    e.preventDefault();
    //disable submit
    let submitButton = document.querySelector("#submit");//todo: get changed to a useRef
    submitButton.disabled = true;
    //import values from form to data variable

    let data = {noshow: false, leave: false, algaelowreefintake: false, algaehighreefintake: false, algaegrndintake: false, coralgrndintake: false, coralstationintake: false, srcintake: false, breakdown: false, defense: false, stageplacement: -1, breakdowncomments: null, defensecomments: null, generalcomments: null };
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
            <div className={styles.Auto}>
              <Header headerName={"Auto"}/>

              <FuelCounter internalName={"auto fuel"}/>

              <SubHeader subHeaderName={"Climb"}></SubHeader>

              <Checkbox visibleName={"Win Auto?"} internalName={"win auto"}/>
            </div>
              
              
            <div className={styles.Tele}>
              <Header headerName={"Tele"}/>

              <p>fuel</p>

              <p>intake</p>

              <p>passing</p>

              <p>shoot while move?</p>
            </div>


            <div className={styles.PostMatch}>
              <br></br>
              <Header headerName={"Post-Match"}/>
                <p>shooting mechanism</p>
                <p>hopper capacity</p>
                <p>bump or trench?</p>
                <p>defense quality</p>
                <p>defense location</p>
                <p>breakdown</p>
                <p>stuck on fuel</p>
              
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

              <Checkbox visibleName={"Broke down?"} internalName={"breakdown"} changeListener={onBreakdownChange} />
              { breakdown &&
                <CommentBox
                  visibleName={"Breakdown Elaboration"}
                  internalName={"breakdowncomments"}
                />
              }
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