import React, { useState } from "react";

import classNames from "classnames";

import styles from './styles.module.scss'
import DownloadFiles from "./download-files";
import WebpageToPDF from "./webpage-pdf";

const tabsData = [
    {
        name: "Download Files",
        ref: "download-files"
    },
    {
        name: "Webpage -> PDF",
        ref: "webpage-pdf"
    },
]

const FileLinks = () => {
    const [tab, setTab] = useState(tabsData[1]?.ref)

    return (
        <div className={styles['files-page']}>
            <h1>File Links</h1>
            <div className={styles['tabs-section']}>
                {tabsData.map(tabItem => (
                    <div key={tabItem.name} className={classNames(styles["tab-item"], tab === tabItem.ref ? styles["active"] : "")} onClick={() => setTab(tabItem.ref)}>{tabItem.name}</div>
                ))}
            </div>
            <br />
            {tab === "download-files" && (
                <DownloadFiles />
            )}
            {tab === "webpage-pdf" && (
                <WebpageToPDF />
            )}

        </div>
    )
}

export default FileLinks