import React, { useState } from 'react';
import ExcelJS from 'exceljs';

import styles from './styles.module.scss'

export const ExcelFileUploader = ({ onFileUpload, sheetKey }) => {
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = e.target.result;
            const jsonData = await convertExcelToJson(data);
            onFileUpload(jsonData);
        };

        reader.readAsArrayBuffer(file);
    };

    const convertExcelToJson = async (data) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);

        const sheet = workbook.worksheets[sheetKey || 0];
        const header = sheet.getRow(1).values;

        const jsonData = [];
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) {
                const rowData = {};
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    rowData[header[colNumber]] = cell?.value !== undefined ? cell.value : null;
                });
                jsonData.push(rowData);
            }
        });

        return jsonData;
    };

    return <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />;
};

const PDFReader = () => {
    const [jsonData, setJsonData] = useState(null);
    const [validatedData, setValidatedData] = useState([]);
    const [validationTime, setValidationTime] = useState(null);
    const [fileName, setFileName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleFileUpload = (data) => {
        setJsonData(data);
    };

    async function checkValidity(link) {
        try {
            const response = await fetch(link);
            if (response.status === 200) {
                return 'valid';
            } else {
                return 'invalid (HTTP Status: ' + response.status + ')';
            }
        } catch (error) {
            return `Invalid Error - ${error}`;
        }
    }

    async function validateLinks() {
        const startTime = new Date();
        setLoading(true)
        const updatedData = await Promise.all(
            jsonData.map(async (item) => {
                const { url, link } = item;
                const validstatus = await checkValidity(url || link);
                return { ...item, Status: validstatus, };
            })
        );

        const endTime = new Date();
        const totalTime = endTime - startTime; // Calculate total validation time in milliseconds
        setValidationTime((totalTime) / 60000);
        setLoading(false)
        setValidatedData(updatedData);
    }

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headers = Object?.keys(validatedData[0]);
        worksheet.addRow(headers);

        // Add data rows
        validatedData.forEach((dataRow) => {
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
        <div>
            <div>
                <h1>Excel to JSON Converter</h1>
                <ExcelFileUploader onFileUpload={handleFileUpload} />
                {jsonData?.length > 0 && <h4 style={{ color: "green" }}>JSON is Ready with {jsonData?.length} items</h4>}<br />
                <small style={{ color: "red" }}><i>** Either have <b>link</b> or <b>url</b> as column header. **</i></small>
            </div>
            <h1>PDF URL Validator</h1>
            <button className={styles['button']} onClick={validateLinks}>Validate PDF URLs</button>
            {loading ? <h4 style={{ color: "red" }}>Loading ...</h4> : ""}
            {validationTime && <h4 style={{ color: "blue" }}>Total Validation Time: {validationTime?.toFixed(2)} minutes</h4>}
            {validatedData?.length > 1 && <h3 style={{ color: "green" }}>Validation Done</h3>}
            <br />
            <div>
                <h1>JSON to Excel Converter</h1>
                <label>File Name  (optional)</label>
                <br />
                <input className={styles['input-field']} type='text' placeholder='Enter File Name for Export' onChange={(e) => setFileName(e.target.value)} />
                <br />
                <br />
                <button className={styles['button']} onClick={convertJSONToExcel}>Download Excel</button>
            </div>
        </div>
    );
};

export default PDFReader;
