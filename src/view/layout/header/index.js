import React from "react";
import LogoMain from "../../../view/widgets/logo";
import uris from "../../../config/uris/uris";
import styles from "./styles.module.scss";

const navItems = [
    { href: uris.home, label: "Home", isActive: true },
    { href: uris.fileLinks, label: "File - Links", isActive: true },
    { href: uris.excel, label: "Excel - Helper", isActive: true },
    { href: uris.permid, label: "PermId API", isActive: true },
    { href: uris.multiExcel, label: "Multi - Excel", isActive: false },
    { href: uris.metaData, label: "Meta Data", isActive: false },
    { href: uris.language, label: "MetaData & Language", isActive: true },
    { href: uris.fieldMapper, label: "Client Mapping", isActive: false },
    { href: uris.fieldCalculations, label: "%-Calculations", isActive: false },
    { href: uris.colorExcel, label: "Color-Validate", isActive: false },
    { href: uris.validateLinks, label: "Validate Links", isActive: true },
    { href: uris.npxExcel, label: "NPX-EXCEL", isActive: false },
    { href: uris.npxToJson, label: "NPX-JSON", isActive: false },
    { href: uris.products, label: "Products", isActive: false },
    { href: uris.charts, label: "Charts", isActive: false },
];


const Header = () => {
    return (
        <div className={`${styles['header-container']} ${styles['dark-theme']}`}>
            <div className={styles['logo-container']}>
                <LogoMain />
            </div>
            <div className={styles["nav-container"]}>
                {navItems?.map((item) => {
                    if (item?.isActive) {
                        return (
                            <a key={item?.href} href={item?.href} className={styles["header-nav"]}>
                                {item?.label}
                            </a>
                        )
                    }
                })}
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
