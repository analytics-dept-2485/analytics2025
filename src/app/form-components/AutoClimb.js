"use client";
import { useState, useEffect } from 'react';
import styles from './AutoClimb.module.css';

export default function AutoClimb({ onClimbChange, defaultValue }) {
    const [selectedType, setSelectedType] = useState(defaultValue);

    useEffect(() => {
        if (defaultValue) {
            setSelectedType(defaultValue);
            onClimbChange(defaultValue)
        }
    }, [setSelectedType, onClimbChange]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setSelectedType(newValue);
        onClimbChange(newValue);
    };
    console.log("climbYesNo",selectedType);
    console.log("default value",defaultValue)

    return (
        <div className={styles.ClimbYesNo}>
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
                    Fail
                </label>
                <label>
                    <input
                        type="radio"
                        name="climbYesNo"
                        value="2"
                        checked={selectedType === "2"}
                        onChange={handleChange}
                    />
                    Success
                </label>
            </div>
        </div>
    );
}