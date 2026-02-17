'use client';
import styles from "./VBox.module.css"

export default function VBoxCheck({title, value, color1, color2}) {
    return (
      <div style={{backgroundColor: color2}} className={styles.VBox}>
        <div className={styles.VBoxTitle} style={{backgroundColor: color1}}>{title}</div>
        <div className={styles.VBoxValue} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5px'}}>
          <input type="checkbox" readOnly checked={value || false} />
        </div>
      </div>
    )
}
