"use client";
import { useState, useEffect } from 'react';
import styles from './TwoOptionRadio.module.css';

export default function TwoOptionRadio({ onTwoOptionRadioChange, defaultValue, internalName, value1, value2}) {
    const [selectedOption, setSelectedOption] = useState();

    useEffect(() => {
        if (defaultValue) {
            setSelectedOption(defaultValue);
            onTwoOptionRadioChange(defaultValue)
        }
    }, [setSelectedOption, onTwoOptionRadioChange]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setSelectedOption(newValue);
        onTwoOptionRadioChange(newValue);
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
            </div>
        </div>
    );
}