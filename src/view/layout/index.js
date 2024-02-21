import React from "react";
import Header from "./header";
import styles from "./styles.module.scss"

const LayoutMain = ({ children }) => {
    return (
        <div className={styles['layout-main']}>
            <div className={styles.header}>
                <Header />
            </div>
            <div className={styles['layout-body-wrapper']}>
                {children}
            </div>
            <div className="footer">Footer Goes Here</div>
        </div>
    )
}

export default LayoutMain