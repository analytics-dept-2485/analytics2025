"use client";
import styles from "./Checkbox.module.css";
import { useState } from "react";

export default function Checkbox ({ visibleName, internalName, changeListener }) {
    const [checked, setChecked] = useState(false);
    
    const handleChange = (e) => {
        console.log("Checkbox.handleChange:", internalName, "checked =", e.target.checked);
        setChecked(e.target.checked);
        if (changeListener) {
            console.log("Calling changeListener for", internalName);
            changeListener(e);
        } else {
            console.log("WARNING: No changeListener provided for", internalName);
        }
    };
    
    return (
        <div className={styles.boxContainer}>
            <div className={styles.box}>
                <label>
                    <input
                        type="checkbox"
                        name={internalName}
                        checked={checked}
                        onChange={handleChange}
                    />
                    {visibleName}
                </label>
            </div>
        </div>
    );
}