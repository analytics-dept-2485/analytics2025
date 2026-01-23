"use client";
import styles from "./ClimbCheckbox.module.css";
import { useState } from "react";

export default function ClimbCheckbox ({ internalName, changeListener }) {
    const [checked, setChecked] = useState(false);
    return (
        <div className={styles.boxContainer}>
    
            <div className={styles.box}>
                <div className={styles.row}>
                    <div className={styles.checkbox}>
                        <input type="radio" id={1} name={1} checked={checked} onChange={(e) => {
                            setChecked(e.target.checked);
                            if (changeListener) changeListener(e);
                        }}>
                        </input>
                    </div>
                    <div className={styles.checkbox}>
                        <input type="radio" id={2} name={1} checked={checked} onChange={(e) => {
                            setChecked(e.target.checked);
                            if (changeListener) changeListener(e);
                        }}>
                        </input>
                    </div>
                    <div className={styles.checkbox}>
                        <input type="radio" id={3} name={1} checked={checked} onChange={(e) => {
                            setChecked(e.target.checked);
                            if (changeListener) changeListener(e);
                        }}>
                        </input>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.checkbox}>
                        <input type="radio" id={4} name={1} checked={checked} onChange={(e) => {
                            setChecked(e.target.checked);
                            if (changeListener) changeListener(e);
                        }}>
                        </input>
                    </div>
                    <div className={styles.checkbox}>
                        <input type="radio" id={5} name={1} checked={checked} onChange={(e) => {
                            setChecked(e.target.checked);
                            if (changeListener) changeListener(e);
                        }}>
                        </input>
                    </div>
                    <div className={styles.checkbox}>
                        <input type="radio" id={6} name={1} checked={checked} onChange={(e) => {
                            setChecked(e.target.checked);
                            if (changeListener) changeListener(e);
                        }}>
                        </input>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.checkbox}>
                        <input type="radio" id={7} name={1} checked={checked} onChange={(e) => {
                            setChecked(e.target.checked);
                            if (changeListener) changeListener(e);
                        }}>
                        </input>
                    </div>
                    <div className={styles.checkbox}>
                        <input type="radio" id={8} name={1} checked={checked} onChange={(e) => {
                            setChecked(e.target.checked);
                            if (changeListener) changeListener(e);
                        }}>
                        </input>
                    </div>
                    <div className={styles.checkbox}>
                        <input type="radio" id={9} name={1} checked={checked} onChange={(e) => {
                            setChecked(e.target.checked);
                            if (changeListener) changeListener(e);
                        }}>
                        </input>
                    </div>
                </div>
 
            </div>
           
            {/*
            <div className={styles.radioGroup}>
                <label>
                    <input
                        type="radio"
                        name="climbYesNo"
                        value="0"
                        checked={selectedType === "0"}
                        onChange={handleChange}
                    />
                    None
                </label>
                <label>
                    <input
                        type="radio"
                        name="climbYesNo"
                        value="1"
                        checked={selectedType === "1"}
                        onChange={handleChange}
                    />
                    Success
                </label>
                <label>
                    <input
                        type="radio"
                        name="climbYesNo"
                        value="2"
                        checked={selectedType === "2"}
                        onChange={handleChange}
                    />
                    Fail
                </label>
            </div>
        </div>
         */}
    </div>
    )
}