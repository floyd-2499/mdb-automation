import React, { useState } from "react";
import styles from "./styles.module.scss"
import ISSFormatMain from "./iss-format-main";
import Format1 from "./format1";

const tabsData = [
    {
        name: "ISS Format",
        ref: "metadata-automated"
    },
    {
        name: "Format 1",
        ref: "format-1"
    },
]

const NPXExcelMain = () => {
    const [tab, setTab] = useState(tabsData[1]?.ref)

    return (
        <div className="page-main">
            <h1>ISS & EXCEL Formats</h1>

            <div className={styles['tabs-section']}>
                {tabsData.map(tabItem => (
                    <div key={tabItem.name} className={tab === tabItem.ref && styles["active"]} onClick={() => setTab(tabItem.ref)}>{tabItem.name}</div>
                ))}
            </div>
            <br />

            {tab === "metadata-automated" && (
                <ISSFormatMain />
            )}

            {tab === "format-1" && (
                <Format1 />
            )}
        </div>
    )
}

export default NPXExcelMain