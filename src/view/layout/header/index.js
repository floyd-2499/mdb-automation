import React from "react";
import LogoMain from "../../../view/widgets/logo";
import uris from "../../../config/uris/uris";
import styles from "./styles.module.scss";

const Header = () => {
    return (
        <div className={`${styles['header-container']} ${styles['dark-theme']}`}>
            <div className={styles['logo-container']}>
                <LogoMain />
            </div>
            <div className={styles["nav-container"]}>
                {/* <a href={uris.home} className={styles["header-nav"]}>
                    Home
                </a> */}
                <a href={uris.pdfTable} className={styles["header-nav"]}>
                    PDF-Table
                </a>
                <a href={uris.excel} className={styles["header-nav"]}>
                    Excel
                </a>
                <a href={uris.multiExcel} className={styles["header-nav"]}>
                    Multi -Excel
                </a>
                {/* <a href={uris.metaData} className={styles["header-nav"]}>
                    Meta Data
                </a> */}
                <a href={uris.language} className={styles["header-nav"]}>
                    Language
                </a>
                <a href={uris.fieldMapper} className={styles["header-nav"]}>
                    Client Map
                </a>
                <a href={uris.fieldCalculations} className={styles["header-nav"]}>
                    %-Calculations
                </a>
                <a href={uris.colorExcel} className={styles["header-nav"]}>
                    Color-Validate
                </a>
                <a href={uris.validateas} className={styles["header-nav"]}>
                    Validate as
                </a>
                <a href={uris.npxExcel} className={styles["header-nav"]}>
                    NPX - EXCEL
                </a>
                <a href={uris.npxToJson} className={styles["header-nav"]}>
                    NPX-JSON
                </a>


                {/* <a href={uris.products} className={styles["header-nav"]}>
                    Products
                </a> */}
                {/* <a href={uris.charts} className={styles["header-nav"]}>
                    Charts
                </a> */}
                {/* <div className={cn(styles["nav-icons-section"], styles["nav-container"])}>
                    <a href={uris.cart} className={cn(styles['header-nav'], styles.cart)}>
                        Cart
                    </a>
                    <a href={uris.profile} className={cn(styles['header-nav'], styles.profile)}>
                        Profile
                    </a>
                </div> */}
            </div>
        </div>
    );
};

export default Header;
