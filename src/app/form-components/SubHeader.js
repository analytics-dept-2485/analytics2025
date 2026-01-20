import styles from './SubHeader.module.css'

/*export default function SubHeader ({ subHeaderName }) {
    return (
        <div className={styles.subHeader}>
            <span>{subHeaderName}</span>
            <hr></hr>
        </div>
    )
}*/

export default function SubHeader({ subHeaderName }) {
    return (
    <div>
      <div className={styles.centered}>
        <span className={styles.subHeader}>{subHeaderName}</span>
    </div>
      <div>
      <hr className={styles.line}></hr>
      </div>
    </div>
    );
  }