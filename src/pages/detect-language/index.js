import React, { useState } from "react";
import PDFLanguageFromLinks from "./excel-link";
import styles from "./styles.module.scss"
import LanguageDetectorModel2 from "./excel-link-model-2";
import MetaDataOfLinks from "./pdf-metadata";
import MetaDataAutomated from "../meta-data";

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
        name: "Model - Franc",
        ref: "model-1"
    },
    {
        name: "Model - Language Detect",
        ref: "model-2"
    },
]

const DetectLanguages = () => {
    const [tab, setTab] = useState(tabsData[2]?.ref)


    return (
        <div className={styles["language-detect-page"]}>
            <h2>Language Detection</h2>

            <div className={styles['tabs-section']}>
                {tabsData.map(tabItem => (
                    <div key={tabItem.name} className={tab === tabItem.ref && styles["active"]} onClick={() => setTab(tabItem.ref)}>{tabItem.name}</div>
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

            {tab === "model-2" && (
                <LanguageDetectorModel2 />
            )}
        </div>
    )
}

export default DetectLanguages