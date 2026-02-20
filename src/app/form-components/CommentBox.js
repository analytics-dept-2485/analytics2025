import styles from './CommentBox.module.css'

export default function CommentBox ({ visibleName, internalName}) {
    return (
        <div className={styles.container}>
            <label htmlFor={internalName}>{visibleName}:</label>
            <br></br>
            <textarea className={styles.textarea} id={internalName} name={internalName}></textarea>
        </div>
    )
}