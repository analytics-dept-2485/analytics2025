"use client";
import { useState } from 'react';
import styles from './NumericInput.module.css';

export default function NumericInput({ visibleName, internalName, pieceType, min, max }) {
    min = min || 0;
    max = max || 99999;

    const [value, setValue] = useState(0);

    function increment() {
        if (value + 1 <= max) {
            setValue(value + 1);
        }
    }

    function decrement() {
        if (value - 1 >= min) {
            setValue(value - 1);
        }
    }

    return (
        <div className={styles.NumericInput}>
            <label className={styles.label} htmlFor={internalName}>{visibleName}</label>
            <div className={styles.Container}>
                <button type="button" className={styles[pieceType + 'ButtonLeft']} onClick={decrement}><h1><strong>-</strong></h1></button>
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