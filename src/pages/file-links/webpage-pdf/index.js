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

    // HTML
    useEffect(() => {
        if (jsonFile && jsonFile.length > 0) {
            const downloadFiles = async () => {
                setStatus("loading");
                const stats = [];

                for (const file of jsonFile) {
                    if (file.URL) {
                        try {
                            const response = await fetch(file.URL);
                            if (!response.ok) throw new Error(`Failed to fetch ${file.URL}`);

                            const htmlContent = await response.text();

                            // Create a blob from the HTML content and download it as a .html file
                            const blob = new Blob([htmlContent], { type: 'text/html' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${file.URL.split('/').pop()}.html`; // Save as .html file
                            a.click();
                            window.URL.revokeObjectURL(url); // Free up memory by revoking the object URL

                            stats.push({ url: file.URL, status: 'success' });
                        } catch (error) {
                            console.error(`Error downloading ${file.URL}:`, error);
                            stats.push({ url: file.URL, status: 'failed' });
                        }
                    }
                }

                setDownloadStats(stats);
                setStatus("completed");
            };

            downloadFiles();
        }
    }, [jsonFile]);


    // PDF
    // useEffect(() => {
    //     if (jsonFile && jsonFile.length > 0) {
    //         const downloadFiles = async () => {
    //             setStatus("loading");
    //             const stats = [];

    //             for (const file of jsonFile) {
    //                 if (file.URL) {
    //                     try {
    //                         const response = await fetch(file.URL);
    //                         if (!response.ok) throw new Error(`Failed to fetch ${file.URL}`);

    //                         const htmlContent = await response.text();
    //                         const parser = new DOMParser();
    //                         const doc = parser.parseFromString(htmlContent, 'text/html');
    //                         const content = doc.body;

    //                         // Generate the PDF using html2pdf
    //                         await html2pdf().from(content).set({
    //                             margin: 1,
    //                             filename: `${file.URL.split('/').pop()}.pdf`,
    //                             html2canvas: { scale: 2 },
    //                             jsPDF: { orientation: 'portrait' },
    //                             wait: 5000, // Optional: Add delay to wait for full page load
    //                         }).save();

    //                         stats.push({ url: file.URL, status: 'success' });
    //                     } catch (error) {
    //                         console.error(`Error downloading ${file.URL}:`, error);
    //                         stats.push({ url: file.URL, status: 'failed' });
    //                     }
    //                 }
    //             }

    //             setDownloadStats(stats);
    //             setStatus("completed");
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