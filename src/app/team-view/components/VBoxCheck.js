'use client';
import styles from "./VBoxCheck.module.css"

export default function VBoxCheck({title, value, color1, color2}) {
    return (
      <div style={{backgroundColor: color2}} className={styles.VBox}>
        <div className={styles.VBoxTitle} style={{backgroundColor: color1}}>{title}</div>
        {/* <div className={styles.VBoxValue}>{value}</div> */}
        <div className={styles.VBoxValue} style={{backgroundColor: color2}}><input id="groundcheck" type="checkbox" readOnly checked={value}></input></div>
      </div>
    )
} 
