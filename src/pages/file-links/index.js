import React, { useEffect, useState } from "react";

import * as XLSX from 'xlsx';

import styles from './styles.module.scss'
import { ExcelFileUploader } from "../validate-links";

const tabsData = [
    {
        name: "Download Files",
        ref: "download-files"
    },
]

const FileLinks = () => {
    const [tab, setTab] = useState(tabsData[0]?.ref)
    const [jsonFile, setJsonFile] = useState(null);
    const [downloadStats, setDownloadStats] = useState([]);
    const [status, setStatus] = useState("");

    const downloadExcel = () => {
        if (downloadStats?.length > 0) {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(downloadStats);
            XLSX.utils.book_append_sheet(wb, ws, 'Download Stats');

            // Generate buffer and download
            XLSX.writeFile(wb, 'download_stats.xlsx');
        }
    }

    useEffect(() => {
        if (jsonFile) {
            const downloadFiles = async () => {
                setStatus("loading")
                const updatedData = [];

                for (const item of jsonFile) {
                    try {
                        // Fetch the file
                        const response = await fetch(item?.URL, {
                            method: 'GET',
                        });

                        if (response.ok) {
                            // Convert response to a blob
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = item.File; // Use item.File for the filename
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);

                            updatedData.push({ ...item, status: 'Success' });
                        } else {
                            updatedData.push({ ...item, status: 'Fail' });
                        }
                    } catch (error) {
                        // Update status to "Fail" if there's an error
                        updatedData.push({ ...item, status: 'Fail' });
                    }
                }

                // Update the state with the new data
                setDownloadStats(updatedData);
                setStatus("completed")
            };

            downloadFiles();
        }
    }, [jsonFile]);

    return (
        <div className={styles['files-page']}>
            <h1>File Links</h1>
            <div className={styles['tabs-section']}>
                {tabsData.map(tabItem => (
                    <div key={tabItem.name} className={tab === tabItem.ref ? styles["active"] : ""} onClick={() => setTab(tabItem.ref)}>{tabItem.name}</div>
                ))}
            </div>
            <br />
            {tab === "download-files" && (
                <div className={styles['page-contents']}>
                    <h3>Convert Excel to JSON</h3>
                    <ExcelFileUploader onFileUpload={setJsonFile} sheetKey={1} />
                </div>
            )}
            <br />
            {status === "loading" && <h4 style={{ color: "red" }}>Loading ...</h4>}
            {status === "completed" && <button onClick={downloadExcel}>Download Stats</button>}
        </div>
    )
}

export default FileLinks