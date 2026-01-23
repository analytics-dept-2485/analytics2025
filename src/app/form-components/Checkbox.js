"use client";
import styles from "./Checkbox.module.css";
import { useState } from "react";

export default function Checkbox ({ visibleName, internalName, changeListener }) {
    const [checked, setChecked] = useState(false);
    return (
        <div className={styles.boxContainer}>
            <div className={styles.box}>
                    <label>
                        <input
                          type="checkbox"
                          name="staticShooting"
                        />
                    </label>
                <label htmlFor={internalName}>{visibleName}</label>
            </div>
        </div>
    )
}