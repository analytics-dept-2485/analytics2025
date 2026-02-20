"use client";
import { useState, useEffect } from 'react';
import styles from './ThreeOptionRadio.module.css';

export default function ThreeOptionRadio({ onThreeOptionRadioChange, defaultValue, internalName, value1, value2, value3 }) {
    const [selectedOption, setSelectedOption] = useState();

    useEffect(() => {
        if (defaultValue) {
            setSelectedOption(defaultValue);
            onThreeOptionRadioChange(defaultValue)
        }
    }, [setSelectedOption, onThreeOptionRadioChange]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setSelectedOption(newValue);
        onThreeOptionRadioChange(newValue);
    };

    return (
        <div className={styles.Container}>
            <div className={styles.radioGroup}>
                <label>
                    <input
                        type="radio"
                        name={internalName}
                        value="0"
                        checked={selectedOption === "0"}
                        onChange={handleChange}
                    />
                    {value1}
                </label>
                <label>
                    <input
                        type="radio"
                        name={internalName}
                        value="1"
                        checked={selectedOption === "1"}
                        onChange={handleChange}
                    />
                    {value2}
                </label>
                <label>
                    <input
                        type="radio"
                        name={internalName}
                        value="2"
                        checked={selectedOption === "2"}
                        onChange={handleChange}
                    />
                    {value3}
                </label>
            </div>
        </div>
    );
}