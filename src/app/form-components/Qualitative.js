"use client";
import { useEffect, useState } from 'react'
import styles from './Qualitative.module.css'

export default function Qualitative ({ visibleName, internalName, description, symbol="★"}) {
    const [rating, setRating] = useState(-1);

    const ratingDescriptions = [
        "Low ",
        "Relatively Low ",
        "Just Below Average ",
        "Just Above Average ",
        "Relatively High ",
        "High "
    ];

    return (
        <div className={styles.qual}>
            <br></br>
            <label htmlFor={internalName}>{visibleName}</label>
            <input type="hidden" name={internalName} value={rating}/>
            <hr></hr>
            <div className={styles.ratings}>
                {[0,1,2,3,4,5].map(ratingValue => {
                    return <div className={styles.symbol + (ratingValue <= rating ? " " + styles.selected : "")} key={ratingValue} onClick={() => setRating(ratingValue)}>{symbol}</div>
                })}
            </div>
            
            {rating === -1 && (description == "Fuel Speed" || description == "Passing Speed" || description == "Net Speed") && (
                <div>
                    Not Applicable
                </div>
            )}

            {rating === -1 && description == "Algae Removal Speed" && (
                <div>
                    Did Not Try to Remove Algae
                </div>
            )}

            {rating === -1 && description == "Climb Speed" && (
                <div>
                    Did Not Try to Climb
                </div>
            )}

            {rating === -1 && description == "Maneuverability" && (
                <div>
                    Did Not Move
                </div>
            )}

            {rating === -1 && description == "Ability to Play Defense" && (
                <div>
                    Did Not Defend
                </div>
            )}

            {rating === -1 && description == "Defense Evasion Ability" && (
                <div>
                    Was Not Defended Against
                </div>
            )}

            {rating === -1 && description == "Aggression" && (
                <div>
                    Did Not Move
                </div>
            )}

            {rating === -1 && description == "Cage Hazard" && (
                <div>
                    Did Not Interact With Teammates in the Barge
                </div>
            )}

            {rating >= 0 && (

                <div>
                    {ratingDescriptions[rating]} {description}
                </div>
            )}

           


            <button type="button" className="Clear" onClick={() => setRating(-1)}>Clear</button>
        </div>
    )
}



