import React, { useEffect, useState } from "react";

import * as XLSX from 'xlsx';

import styles from '../styles.module.scss'
import { ExcelFileUploader } from "../../validate-links";

const DownloadFiles = () => {
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
        <div className={styles['tab-contents']}>
            <h3 className="section-header">Download Files via Links</h3>
            <div className={styles['upload-section']}>
                <ExcelFileUploader onFileUpload={setJsonFile} />
                <small className={styles["upload-warning"]}>** column header to be named as URL & Remove Hyperlinks</small>
            </div>
            <div className={styles['download-section']}>
                {status === "loading" && <h4 style={{ color: "red" }}>Loading ...</h4>}
                {status === "completed" && <button onClick={downloadExcel}>Download Stats</button>}
            </div>
        </div>
    )
}

export default DownloadFiles