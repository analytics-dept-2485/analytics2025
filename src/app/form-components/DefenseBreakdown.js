"use client";
import { useState, useEffect } from 'react';
import CommentBox from './CommentBox';
import Checkbox from './Checkbox';
import SubHeader from './SubHeader';
import styles from './DefenseBreakdown.module.css';

export default function DefenseBreakdown({ 
  onBreakdownChange, 
  onDefenseChange, 
  onDefenseTypeChange,
  breakdownValue = false,
  defenseValue = false,
  defenseTypeValue = ""
}) {
    const [breakdown, setBreakdown] = useState(breakdownValue);
    const [defense, setDefense] = useState(defenseValue);
    const [defenseType, setDefenseType] = useState(defenseTypeValue);

    useEffect(() => {
        setBreakdown(breakdownValue);
    }, [breakdownValue]);

    useEffect(() => {
        setDefense(defenseValue);
        if (!defenseValue) {
            setDefenseType("");
        }
    }, [defenseValue]);

    useEffect(() => {
        setDefenseType(defenseTypeValue);
    }, [defenseTypeValue]);

    const handleBreakdownChange = (e) => {
        const checked = e.target.checked;
        setBreakdown(checked);
        if (onBreakdownChange) onBreakdownChange(e);
    };

    const handleDefenseChange = (e) => {
        const checked = e.target.checked;
        setDefense(checked);
        if (!checked) setDefenseType("");
        if (onDefenseChange) onDefenseChange(e);
    };

    const handleDefenseTypeChange = (e) => {
        const value = e.target.value;
        setDefenseType(value);
        if (onDefenseTypeChange) onDefenseTypeChange(value);
    };

    return (
        <div className={styles.container}>
            {/* Broke Down Section */}
            <div className={styles.section}>
                <Checkbox 
                    visibleName={"Broke down?"}
                    internalName={"breakdown"}
                    changeListener={handleBreakdownChange}
                />
                
                {breakdown && (
                    <div className={styles.commentContainer}>
                        <CommentBox 
                            visibleName={"Breakdown Elaboration"}
                            internalName={"breakdowncomments"}
                        />
                    </div>
                )}
            </div>

            {/* Played Defense Section */}
            <div className={styles.section}>
                <Checkbox 
                    visibleName={"Played Defense?"}
                    internalName={"defense"}
                    changeListener={handleDefenseChange}
                />
                
                {defense && (
                    <>
                        <div className={styles.defenseTypeContainer}>
                            <SubHeader subHeaderName={"Defense Type"} />
                            <div className={styles.defenseTypeBox}>
                                <div className={styles.radioGroup}>
                                    <label>
                                        <input
                                            type="radio"
                                            id="weak"
                                            name="defenseType"
                                            value="weak"
                                            checked={defenseType === "weak"}
                                            onChange={handleDefenseTypeChange}
                                        />
                                        Weak
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            id="harassment"
                                            name="defenseType"
                                            value="harassment"
                                            checked={defenseType === "harassment"}
                                            onChange={handleDefenseTypeChange}
                                        />
                                        Harassment
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            id="gameChanging"
                                            name="defenseType"
                                            value="game-changing"
                                            checked={defenseType === "game-changing"}
                                            onChange={handleDefenseTypeChange}
                                        />
                                        Game Changing
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.commentContainer}>
                            <CommentBox 
                                visibleName={"Defense Elaboration"}
                                internalName={"defensecomments"}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}