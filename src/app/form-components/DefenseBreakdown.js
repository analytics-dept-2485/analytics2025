"use client";
import { useState, useEffect } from 'react';
import CommentBox from './CommentBox';
import Checkbox from './Checkbox';
import SubHeader from './SubHeader';
import ThreeOptionRadio from './ThreeOptionRadio';
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

    const handleDefenseTypeChange = (value) => {
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
                                <ThreeOptionRadio
                                    onThreeOptionRadioChange={handleDefenseTypeChange}
                                    internalName="defenseType"
                                    defaultValue={defenseType}
                                    value1="Weak"
                                    value2="Harassment"
                                    value3="Game Changing"
                                  />
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