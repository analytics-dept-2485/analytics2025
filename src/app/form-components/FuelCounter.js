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
                <button type="button" className={styles[pieceType + 'ButtonLeft']} onClick={decrementOne}><h1><strong>-</strong></h1></button>
                <button type="button" className={styles[pieceType + 'ButtonLeft']} onClick={decrementThree}><h1><strong>-</strong></h1></button>
                
            
                <input
                    className={styles[pieceType]}
                    type="number"
                    id={internalName}
                    name={internalName}
                    value={value}
                    readOnly
                />
                <button type="button" className={styles[pieceType + 'ButtonRight']} onClick={increment}><h1><strong>+</strong></h1></button>
            </div>
            <br/>
        </div>
    )
}