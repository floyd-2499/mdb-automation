import React, { useState } from "react";
import axios from 'axios';
import { franc } from "franc";
import { iso6393 } from "iso-639-3";
import ExcelJS from 'exceljs';

import { getDocument } from 'pdfjs-dist/webpack.mjs';
import { ExcelFileUploader } from "../validate-links";
import styles from "./styles.module.scss";

const DetectLanguagesModel2 = () => {
    const [inputJson, setInputJson] = useState([]);
    const [loadSuccess, setLoadSuccess] = useState(false);
    const [detectionLoading, setDetectionLoading] = useState(false);
    const [detectionSuccess, setDetectionSuccess] = useState(false);
    const [detectedLanguages, setDetectedLanguages] = useState([]);
    const [validationTime, setValidationTime] = useState(null);
    const [runCount, setRunCount] = useState(0)

    const handleUploadFile = (data) => {
        if (data?.length > 0) {
            setInputJson(data);
            setLoadSuccess(true);
        }
    };

    const detectLanguages = async () => {
        const batchSize = 100;
        const startTime = new Date();
        const totalItems = inputJson.length;
        let processedItems = 0;
        let batchStart = 0;

        const processBatch = async (start, end) => {
            const detectedLanguagesBatch = await Promise.all(
                inputJson.slice(start, end).map(async (item) => {
                    const result = await detectLanguageFromPDF(item["link"]);
                    return {
                        "Provider ID": item["provider_id"] || "-",
                        "Company Name": item["Company Name"] || "-",
                        "Country": item["Country"] || "-",
                        "Link": result.pdfLink || '-',
                        "Language Code": result?.detectedLanguageCode || "-",
                        "Language Name": result?.detectedLanguageName || " ",
                        "English/Non-English": result?.detectedLanguageCode && (result?.detectedLanguageName === "English" ? "English" : "Non-English"),
                        "Error": result?.error?.message,
                    };
                })
            );

            setDetectedLanguages((prev) => [...prev, ...detectedLanguagesBatch]);
            processedItems += end - start;
            setRunCount(processedItems)

            if (processedItems < totalItems) {
                await processBatch(processedItems, Math.min(processedItems + batchSize, totalItems));
            } else {
                const endTime = new Date();
                const totalTime = endTime - startTime; // Calculate total validation time in milliseconds
                setValidationTime(totalTime / 60000);
                setDetectionLoading(false);
                setDetectionSuccess(true);
            }
        };

        await processBatch(batchStart, Math.min(batchStart + batchSize, totalItems));
        setDetectionLoading(true);
    };

    const getLanguageName = (languageCode) => {
        const languageInfo = iso6393.find((entry) => entry.iso6393 === languageCode);
        return languageInfo ? languageInfo.name : 'Unknown Language';
    }

    const detectLanguageFromPDF = async (pdfLink) => {
        try {
            const response = await axios.get(pdfLink, { responseType: 'arraybuffer' });
            const data = new Uint8Array(response.data);
            const text = await extractTextFromPDF(data);

            // Detection
            const detectedLanguageCode = franc(text);
            const detectedLanguageName = getLanguageName(detectedLanguageCode);

            return { pdfLink, detectedLanguageCode, detectedLanguageName };
        } catch (error) {
            return { pdfLink, detectedLanguage: '', error };
        }
    };

    const extractTextFromPDF = async (data) => {
        const pdf = await getDocument({ data }).promise;
        const maxPages = pdf.numPages;
        let text = '';

        for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
            const page = await pdf.getPage(pageNo);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(' ');
        }

        return text;
    };

    const handleDetectLanguagesClick = () => {
        if (loadSuccess) {
            detectLanguages();
            setDetectionLoading(true)
        }
    };

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headers = Object?.keys(detectedLanguages[0]);
        worksheet.addRow(headers);

        // Add data rows
        detectedLanguages.forEach((dataRow) => {
            const row = [];
            headers.forEach((header) => {
                row.push(dataRow[header]);
            });
            worksheet.addRow(row);
        });

        const currentDate = new Date()
        // Generate Excel file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Language Detection -  ${currentDate?.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className={styles["page-contents"]}>
            <h2>Upload Excel</h2>
            <ExcelFileUploader onFileUpload={handleUploadFile} />
            <br />
            <small style={{ color: "red" }}><i>** Column header for links should be <b>link</b>. </i></small>
            <br />
            <br />

            {loadSuccess && (
                <button onClick={handleDetectLanguagesClick}>
                    Detect Languages
                </button>
            )}
            <br />

            {detectionLoading && <h4 style={{ color: "red" }}>Fetching Details ...</h4>}
            {detectionLoading && <h5 style={{ color: "blue" }}>For now {runCount} have been completed.</h5>}
            {detectionSuccess && <h3 style={{ color: "green" }}>Language Detection Completed</h3>}

            <br />
            {validationTime && <h4 style={{ color: "blue" }}>Total Validation Time: {validationTime?.toFixed(2)} minutes</h4>}

            {detectionSuccess && <button onClick={convertJSONToExcel}>
                Download Excel
            </button>}
        </div>
    );
};

export default DetectLanguagesModel2;
