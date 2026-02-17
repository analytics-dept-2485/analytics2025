"use client";
import styles from "./ClimbTable.module.css"

export default function ClimbTable({R1C1, R1C2, R1C3, R2C1, R2C2, R2C3, R3C1, R3C2, R3C3, color1, color2, color3}) {
    return (
      <table className={styles.ClimbTable}>
        <colgroup>
          <col span="1" style={{backgroundColor: color1}}></col>
          <col span="2" style={{backgroundColor: color3}}></col>
          <col span="3" style={{backgroundColor: color3}}></col>
        </colgroup>
        <thead style={{backgroundColor: color2}}>
            <tr className={styles.yes}>
              <th className={styles.white}></th>
              <th className={styles.cell}>Left</th>
              <th className={styles.cell}>Center</th>
              <th className={styles.cell}>Right</th>
            </tr>
        </thead>
        <tbody>
        <tr style={{height: "20px"}} className={styles.cell}>
          <td className={styles.cell}>L3</td>
          <td className={styles.cell}>{typeof R1C1 === 'number' ? `${R1C1}%` : R1C1}</td>
          <td className={styles.cell}>{typeof R1C2 === 'number' ? `${R1C2}%` : R1C2}</td>
          <td className={styles.cell}>{typeof R1C3 === 'number' ? `${R1C3}%` : R1C3}</td>
        </tr>
        <tr style={{height: "20px"}} className={styles.cell}>
          <td className={styles.cell}>L2</td>
          <td className={styles.cell}>{typeof R2C1 === 'number' ? `${R2C1}%` : R2C1}</td>
          <td className={styles.cell}>{typeof R2C2 === 'number' ? `${R2C2}%` : R2C2}</td>
          <td className={styles.cell}>{typeof R2C3 === 'number' ? `${R2C3}%` : R2C3}</td>
        </tr>
        <tr style={{height: "20px"}}>
          <td className={styles.cell}>L1</td>
          <td className={styles.cell}>{typeof R3C1 === 'number' ? `${R3C1}%` : R3C1}</td>
          <td className={styles.cell}>{typeof R3C2 === 'number' ? `${R3C2}%` : R3C2}</td>
          <td className={styles.cell}>{typeof R3C3 === 'number' ? `${R3C3}%` : R3C3}</td>
        </tr>
        </tbody>
      </table>
    )
  }