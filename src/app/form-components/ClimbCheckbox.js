"use client";
import styles from "./ClimbCheckbox.module.css";
import { useState } from "react";

export default function ClimbCheckbox({ internalName, changeListener }) {
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedType, setSelectedType] = useState("0");

    const handleCellClick = (id) => {
        setSelectedCell(id);
        if (changeListener) changeListener({ type: "position", value: id });
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        if (changeListener) changeListener({ type: "climbType", value: e.target.value });
    };

    return (
        <div className={styles.container}>
            
            <div className={styles.layout}>
                {/* Left/Center/Right Headers */}
                <div className={styles.positionHeaders}>
                    <div className={styles.spacer}></div>
                    <div className={styles.positionHeader}>Left</div>
                    <div className={styles.positionHeader}>Center</div>
                    <div className={styles.positionHeader}>Right</div>
                    <div className={styles.spacer}></div>
                </div>
                
                <div className={styles.mainArea}>
                    {/* Left L3/L2/L1 Labels */}
                    <div className={styles.levelLabels}>
                        <div className={styles.levelLabel}>L3</div>
                        <div className={styles.levelLabel}>L2</div>
                        <div className={styles.levelLabel}>L1</div>
                    </div>
                    
                    {/* The 3x3 Grid */}
                    <div className={styles.gridContainer}>
                        {/* Row 1 - L3 */}
                        <div className={styles.gridRow}>
                            <div className={`${styles.checkbox} ${styles.l3Cell}`}>
                                <input 
                                    type="radio" 
                                    id="L3-left" 
                                    name="climbPosition"
                                    checked={selectedCell === "L3-left"}
                                    onChange={() => handleCellClick("L3-left")}
                                />
                            </div>
                            <div className={`${styles.checkbox} ${styles.l3Cell}`}>
                                <input 
                                    type="radio" 
                                    id="L3-center" 
                                    name="climbPosition"
                                    checked={selectedCell === "L3-center"}
                                    onChange={() => handleCellClick("L3-center")}
                                />
                            </div>
                            <div className={`${styles.checkbox} ${styles.l3Cell}`}>
                                <input 
                                    type="radio" 
                                    id="L3-right" 
                                    name="climbPosition"
                                    checked={selectedCell === "L3-right"}
                                    onChange={() => handleCellClick("L3-right")}
                                />
                            </div>
                        </div>
                        
                        {/* Row 2 - L2 */}
                        <div className={styles.gridRow}>
                            <div className={`${styles.checkbox} ${styles.l2Cell}`}>
                                <input 
                                    type="radio" 
                                    id="L2-left" 
                                    name="climbPosition"
                                    checked={selectedCell === "L2-left"}
                                    onChange={() => handleCellClick("L2-left")}
                                />
                            </div>
                            <div className={`${styles.checkbox} ${styles.l2Cell}`}>
                                <input 
                                    type="radio" 
                                    id="L2-center" 
                                    name="climbPosition"
                                    checked={selectedCell === "L2-center"}
                                    onChange={() => handleCellClick("L2-center")}
                                />
                            </div>
                            <div className={`${styles.checkbox} ${styles.l2Cell}`}>
                                <input 
                                    type="radio" 
                                    id="L2-right" 
                                    name="climbPosition"
                                    checked={selectedCell === "L2-right"}
                                    onChange={() => handleCellClick("L2-right")}
                                />
                            </div>
                        </div>
                        
                        {/* Row 3 - L1 */}
                        <div className={styles.gridRow}>
                            <div className={`${styles.checkbox} ${styles.l1Cell}`}>
                                <input 
                                    type="radio" 
                                    id="L1-left" 
                                    name="climbPosition"
                                    checked={selectedCell === "L1-left"}
                                    onChange={() => handleCellClick("L1-left")}
                                />
                            </div>
                            <div className={`${styles.checkbox} ${styles.l1Cell}`}>
                                <input 
                                    type="radio" 
                                    id="L1-center" 
                                    name="climbPosition"
                                    checked={selectedCell === "L1-center"}
                                    onChange={() => handleCellClick("L1-center")}
                                />
                            </div>
                            <div className={`${styles.checkbox} ${styles.l1Cell}`}>
                                <input 
                                    type="radio" 
                                    id="L1-right" 
                                    name="climbPosition"
                                    checked={selectedCell === "L1-right"}
                                    onChange={() => handleCellClick("L1-right")}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}