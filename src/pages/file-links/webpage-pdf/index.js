import React, { useEffect, useState } from "react";

import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

import styles from '../styles.module.scss'
import { ExcelFileUploader } from "../../validate-links";

const WebpageToPDF = () => {
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
        if (jsonFile && jsonFile.length > 0) {
            const downloadFiles = async () => {
                setStatus("loading");
                const stats = [];

                // Loop through the jsonFile array and download each URL as PDF
                for (const file of jsonFile) {
                    if (file.URL) {
                        try {
                            const iframe = document.createElement('iframe');
                            iframe.style.display = 'none';
                            iframe.src = file.URL;
                            document.body.appendChild(iframe);

                            await new Promise((resolve, reject) => {
                                iframe.onload = () => {
                                    const content = iframe.contentWindow.document.body;

                                    // Generate and download the PDF
                                    html2pdf().from(content).set({
                                        margin: 1,
                                        filename: `${file.URL.split('/').pop()}.pdf`,
                                        html2canvas: { scale: 2 },
                                        jsPDF: { orientation: 'portrait' },
                                    }).save().then(() => {
                                        // If successful, add to stats and resolve
                                        stats.push({ url: file.URL, status: 'success' });
                                        document.body.removeChild(iframe);
                                        resolve();
                                    }).catch(() => {
                                        stats.push({ url: file.URL, status: 'failed' });
                                        reject();
                                    });
                                };

                                iframe.onerror = () => {
                                    stats.push({ url: file.URL, status: 'failed' });
                                    reject();
                                };
                            });
                        } catch (error) {
                            console.error(`Error downloading ${file.URL}: `, error);
                            stats.push({ url: file.URL, status: 'failed' });
                        }
                    }
                }

                // Update the download statistics
                setDownloadStats(stats);
                setStatus("completed");
            };

            downloadFiles();
        }
    }, [jsonFile]);

    // useEffect(() => {
    //     if (jsonFile) {
    //         const downloadFiles = async () => {
    //             setStatus("loading")
    //             console.log(jsonFile);

    //             setStatus("completed")
    //         };

    //         downloadFiles();
    //     }
    // }, [jsonFile]);

    return (
        <div className={styles['tab-contents']}>
            <h3 className="section-header">Convert Webpages to PDF</h3>
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

export default WebpageToPDF