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
      <div className={styles.subHeader}>
        <span>{subHeaderName}</span>
        <hr></hr>
      </div>
    );
  }