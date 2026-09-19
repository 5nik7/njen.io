import styles from './TechnicalBackdrop.module.css'

export function TechnicalBackdrop() {
  return <div className={styles.backdrop} aria-hidden="true">
    <div className={styles.grid} />
    <div className={styles.frame}><i /><i /><i /><i /></div>
  </div>
}
