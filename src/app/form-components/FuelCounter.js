"use client";
import { useState } from 'react';
import styles from './FuelCounter.module.css';

export default function FuelCounter({ visibleName, internalName, pieceType, min, max }) {
    min = min || 0;
    max = max || 99999;

    const [value, setValue] = useState(0);

    function incrementOne() {
        if (value + 1 <= max) {
            setValue(value + 1);
        }
    }

    function incrementThree() {
        if (value + 3 <= max) {
            setValue(value + 3);
        }
    }

    function incrementTen() {
        if (value + 10 <= max) {
            setValue(value + 10);
        }
    }

    function decrementOne() {
        if (value - 1 >= min) {
            setValue(value - 1);
        }
    }

    function decrementThree() {
        if (value - 3 >= min) {
            setValue(value - 3);
        }
    }

    function decrementTen() {
        if (value - 10 >= min) {
            setValue(value - 10);
        }
    }

    return (
        <div className={styles.FuelCounter}>
            <label className={styles.label} htmlFor={internalName}>{visibleName}</label>
            <div className={styles.Container}>
                <div className={styles.decrementBox}>
                    <button type="button" className={styles.DecButton} onClick={decrementOne}><h1><strong>-1</strong></h1></button>
                    <button type="button" className={styles.DecButton} onClick={decrementThree}><h1><strong>-3</strong></h1></button>
                    <button type="button" className={styles.DecButton} onClick={decrementTen}><h1><strong>-10</strong></h1></button>
                </div>

                <div className={styles.inputBox}>
                    
                    <h1>Fuel</h1>
                    <div className={styles.inputBox2}>
                        <hr className={styles.line}></hr>
                        <input 
                            className={styles.input}
                            type="number"
                            id={internalName}
                            name={internalName}
                            value={value}
                            readOnly
                        />
                    </div>
                </div>

                <div className={styles.incrementBox}>
                    <button type="button" className={styles.IncButton} onClick={incrementOne}><h1><strong>+1</strong></h1></button>
                    <button type="button" className={styles.IncButton} onClick={incrementThree}><h1><strong>+3</strong></h1></button>
                    <button type="button" className={styles.IncButton} onClick={incrementTen}><h1><strong>+10</strong></h1></button>
                </div>
            </div>
            <br/>
        </div>
    )
}