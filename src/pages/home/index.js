import React from "react"
import styles from "./styles.module.scss"

export default function Home() {

  return (
    <div className={styles["home-page"]}>
      <div className={styles["hero-section"]}>
        <div className={styles["hero-section-text"]}>
          <div className={styles["title-top"]}>Hello...!</div>
          <div className={styles["main-text"]}>
            <div className={styles["line-1"]}>HOW MAY I</div>
            <div className={styles["line-2"]}><span className={styles["highlight-text"]}>HELP</span> YOU?</div>
          </div>

        </div>
      </div>
    </div>
  )
}