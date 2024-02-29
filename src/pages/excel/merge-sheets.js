import React, { useState } from "react";
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import styles from "./styles.module.scss"

const MergeJsons = () => {
    const [inputJson, setInputJson] = useState([])

    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let allSheetsData = [];

                workbook.SheetNames.forEach((sheetName) => {
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, range: "A1:Z100" });

                    // Filter out rows with all empty values
                    const nonEmptyRows = jsonData.filter(row => row.some(cellValue => cellValue !== null && cellValue !== ''));

                    allSheetsData = [...allSheetsData, ...nonEmptyRows];
                });

                setInputJson(allSheetsData);
            };

            reader.readAsArrayBuffer(file);
        }
    };

    console.log(inputJson);

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headers = Object?.keys(inputJson[0]);
        worksheet.addRow(headers);

        // Add data rows
        inputJson.forEach((dataRow) => {
            const row = [];
            headers.forEach((header) => {
                row.push(dataRow[header]);
            });
            worksheet.addRow(row);
        });

        // Generate Excel file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Merged Sheets.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className={styles["page-contents"]}>
            <h2>Merge Sheets</h2>
            <br />
            <input type="file" onChange={handleFileUpload} />

            {inputJson?.length > 0 && (
                <button onClick={() => convertJSONToExcel(inputJson)}>
                    Download Excel
                </button>
            )}
        </div>
    )
}

export default MergeJsons