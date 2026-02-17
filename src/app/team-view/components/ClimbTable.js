'use client';
import styles from "./ClimbTable.module.css"

export default function ClimbTable({R1C1, R1C2, R1C3, R2C1, R2C2, R2C3, R3C1, R3C2, R3C3, color1, color2, color3}) {
    return (
      <table className={styles.climbTable}>
        <thead>
          <tr>
            <th></th>
            <th>Left</th>
            <th>Center</th>
            <th>Right</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{backgroundColor: color1}}>L3</td>
            <td style={{backgroundColor: color2}}>{R1C1 || 0}</td>
            <td style={{backgroundColor: color2}}>{R1C2 || 0}</td>
            <td style={{backgroundColor: color2}}>{R1C3 || 0}</td>
          </tr>
          <tr>
            <td style={{backgroundColor: color1}}>L2</td>
            <td style={{backgroundColor: color3}}>{R2C1 || 0}</td>
            <td style={{backgroundColor: color3}}>{R2C2 || 0}</td>
            <td style={{backgroundColor: color3}}>{R2C3 || 0}</td>
          </tr>
          <tr>
            <td style={{backgroundColor: color1}}>L1</td>
            <td style={{backgroundColor: color3}}>{R3C1 || 0}</td>
            <td style={{backgroundColor: color3}}>{R3C2 || 0}</td>
            <td style={{backgroundColor: color3}}>{R3C3 || 0}</td>
          </tr>
        </tbody>
      </table>
    )
}
