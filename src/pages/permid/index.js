import React, { useState } from "react";
import ExcelJS from 'exceljs';

import styles from "./styles.module.scss"
import { ExcelFileUploader } from "../validate-links";

const PERMID_API_KEY = "SzkC7EjQk4CzplmoRAUkF0ZLC6laWdXS"

const PermIdDetails = () => {
    const [jsonData, setJsonData] = useState(null);
    const [loading, setLoading] = useState(false)
    const [validationTime, setValidationTime] = useState(null);
    const [finalData, setFinalData] = useState(null)
    const [fileName, setFileName] = useState("")

    const handleFileUpload = (data) => {
        setJsonData(data);
    };


    const findPermidDetails = async () => {
        const startTime = new Date();
        setLoading(true)

        const responseArray = []; // Array to store API responses

        for (const item of jsonData) {
            const apiUrl = `https://api-eit.refinitiv.com/permid/search?q=permid:${item.cin}&access-token=${PERMID_API_KEY}`;

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.result.organizations.entities.length > 0) {
                    const url = data.result.organizations.entities[0].hasURL;
                    responseArray.push({ ...item, permid: item.cin, "Company URL": url });
                } else {
                    const errorMessage = "No organizations found for permid";
                    responseArray.push({ ...item, permid: item.cin, error: errorMessage });
                }

            } catch (error) {
                console.error(`Error for permid ${item.cin}:`, error);
                responseArray.push({ ...item, permid: item.cin, error: error.message });
            }
        }

        console.log(responseArray);
        setFinalData(responseArray)

        const endTime = new Date();
        const totalTime = endTime - startTime; // Calculate total validation time in milliseconds
        setValidationTime((totalTime) / 60000);
        setLoading(false)
    }

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headers = Object?.keys(finalData[0]);
        worksheet.addRow(headers);

        // Add data rows
        finalData.forEach((dataRow) => {
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
            a.download = fileName || `Validated URLs -  ${currentDate?.toLocaleTimeString()}`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className={styles["permid-page"]}>
            <h1>Perm Id API</h1>
            <br />

            <h4>Upload Excel</h4>
            <ExcelFileUploader onFileUpload={handleFileUpload} /><br />
            <small style={{ color: "red" }}><i>** Keep <b>cin</b> as permid column header. **</i></small>
            <br />
            <br />

            {jsonData && (<button onClick={findPermidDetails}>Find Details</button>)}
            {loading ? <h4 style={{ color: "red" }}>Loading ...</h4> : ""}
            {validationTime && <h4 style={{ color: "blue" }}>Total Validation Time: {validationTime?.toFixed(2)} minutes</h4>}
            {finalData?.length > 1 && <h3 style={{ color: "green" }}>Validation Done</h3>}
            <br />
            <br />

            {finalData?.length > 1 && (
                <div>
                    <label>File Name  (optional)</label>
                    <br />
                    <input className={styles['input-field']} type='text' placeholder='Enter File Name for Export' onChange={(e) => setFileName(e.target.value)} />
                    <br />
                    <br />
                    <button className={styles['button']} onClick={convertJSONToExcel}>Download Excel</button>
                </div>
            )}

        </div>
    )
}

export default PermIdDetails