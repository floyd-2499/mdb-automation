import React, { useState } from "react";
import styles from "./styles.module.scss"
import ISSFormatMain from "./iss-format-main";
import Format1 from "./format1";
import DynamicFormat from "./dynamic-format";
import Format2 from "./format2";
import ISSFormat2 from "./iss-format-2";

const tabsData = [
    {
        name: "ISS Format",
        ref: "iss-format-1"
    },
    {
        name: "ISS Format 2",
        ref: "iss-format-2"
    },
    {
        name: "Format 1",
        ref: "format-1"
    },
    {
        name: "Format 2",
        ref: "format-2"
    },
    {
        name: "Dynamic Format",
        ref: "dynamic"
    },
]

const NPXExcelMain = () => {
    const [tab, setTab] = useState(tabsData[1]?.ref)

    return (
        <div className="page-main">
            <h1>ISS & EXCEL Formats</h1>

            <div className={styles['tabs-section']}>
                {tabsData.map(tabItem => (
                    <div key={tabItem.name} className={tab === tabItem.ref ? styles["active"] : ""} onClick={() => setTab(tabItem.ref)}>{tabItem.name}</div>
                ))}
            </div>
            <br />

            {tab === "iss-format-1" && (
                <ISSFormatMain />
            )}

            {tab === "iss-format-2" && (
                <ISSFormat2 />
            )}

            {tab === "format-1" && (
                <Format1 />
            )}

            {tab === "format-2" && (
                <Format2 />
            )}

            {tab === "dynamic" && (
                <DynamicFormat />
            )}
        </div>
    )
}

export default NPXExcelMain