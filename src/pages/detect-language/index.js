import React, { useState } from "react";
import PDFLanguageFromLinks from "./excel-link";
import styles from "./styles.module.scss"
// import LanguageDetectorModel2 from "./excel-link-model-2";
import DetectLanguagesModel2 from "./auto-lang-detect";
import MetaDataOfLinks from "./pdf-metadata";
import MetaDataAutomated from "../meta-data";
import ExcelRequestViewer from "./curl-v";

const tabsData = [
    {
        name: "Metadata - Automated",
        ref: "metadata-automated"
    },
    {
        name: "Metadata",
        ref: "metadata"
    },
    {
        name: "Detect Language",
        ref: "model-1"
    },
    {
        name: "Language Detection - 2.0",
        ref: "model-2"
    },
    {
        name: "Last Modified Url",
        ref: "curl-v"
    },
]

const DetectLanguages = () => {
    const [tab, setTab] = useState(tabsData[4]?.ref)


    return (
        <div className={styles["language-detect-page"]}>
            <h2>Metadata & Language Detection</h2>

            <div className={styles['tabs-section']}>
                {tabsData.map(tabItem => (
                    <div key={tabItem.name} className={tab === tabItem.ref ? styles["active"] : ""} onClick={() => setTab(tabItem.ref)}>{tabItem.name}</div>
                ))}
            </div>

            <br />

            {tab === "metadata-automated" && (
                <MetaDataAutomated />
            )}

            {tab === "metadata" && (
                <MetaDataOfLinks />
            )}

            {tab === "model-1" && (
                <PDFLanguageFromLinks />
            )}

            {/* {tab === "model-2" && (
                <LanguageDetectorModel2 />
            )} */}

            {tab === "model-2" && (
                <DetectLanguagesModel2 />
            )}

            {tab === "curl-v" && (
                <ExcelRequestViewer />
            )}
        </div>
    )
}

export default DetectLanguages