import React, { useState } from "react";
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

import styles from "./styles.module.scss"

const Format1 = () => {
    const [inputJson, setInputJson] = useState([]);
    const [jsonLoad, setJSONLoad] = useState(false);
    const [exportJson, setExportJson] = useState([])
    const [formatLoading, setFormatLoading] = useState(false);

    const columnHeaders = [
        "COMPANY NAME",
        "TICKER",
        "PRIMARY ISIN",
        "COUNTRY",
        "MEETING DATE",
        "RECORD DATE",
        "MEETING TYPE",
        "PROPONENT",
        "PROPOSAL NUMBER",
        "PROPOSAL TEXT",
        "MANAGEMENT RECOMMENDATION",
        "VOTE INSTRUCTION",
        "GOLDMAN SACHS ASSET MANAGEMENT RATIONALE"
    ];

    const onFileUpload = (event) => {
        setJSONLoad(true);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let allData = [];
                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    allData = allData.concat(jsonData);
                });
                setInputJson(allData);
                setJSONLoad(false);
            };
            reader.readAsArrayBuffer(file);
        }
    }

    const rowValidation = (currentRow) => {
        if (currentRow[0] === "Goldman Sachs Asset Management" && (currentRow[2] === "" && currentRow[3] === "") && (currentRow[4] === "" && currentRow[5] === "")) {
            return false
        } else if (currentRow[0] === 'COMPANY NAME' && currentRow[1] === 'TICKER' && currentRow[2] === 'PRIMARY ISIN') {
            return false
        } else if (currentRow[11] === "Voting Records") {
            return false
        } else if (currentRow[12] === "1Q2024") {
            return false
        } else {
            return true
        }
    }

    const formatJson = () => {
        setFormatLoading(true)
        let previousRow = null;
        const formattedJson = inputJson.map((currentRow, index) => {
            const isValidRow = rowValidation(currentRow);
            if (!isValidRow) return null; // Skip invalid rows

            // Merge values with the previous row if current row's columns 1-5 are empty
            if (previousRow && currentRow.slice(4, 6).every(value => value === "")) {
                currentRow.forEach((value, columnIndex) => {
                    if (value !== "") {
                        previousRow[columnIndex] += ` ${value}`; // Merge values with a space
                    }
                });
                return null; // Skip this row since it's merged with the previous one
            }

            // If not merged, update previousRow
            previousRow = currentRow;
            return currentRow;
        }).filter(row => row !== null);

        setExportJson(formattedJson)
        setFormatLoading(false)
    }

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        worksheet.addRow(columnHeaders);

        // Add data rows
        exportJson.forEach((dataRow) => {
            const row = [];
            columnHeaders.forEach((_, index) => {
                if (index < dataRow.length) {
                    row.push(dataRow[index]);
                } else {
                    row.push("");
                }
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
            a.download = `Formatted NPX EXCEL -  ${currentDate?.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className={styles["format-1-container"]}>
            <h3>Format 1 - Excel (P1)</h3>
            <input type="file" onChange={onFileUpload} accept=".xlsx, .xls" />
            {jsonLoad && <h4 style={{ color: "red" }}>Fetching Details ...</h4>}
            {(inputJson?.length > 0 && !jsonLoad) && <h4 style={{ color: "green" }}>Data Fetched Successfully!</h4>}
            <br />
            <br />
            {(inputJson?.length > 0 && exportJson?.length === 0) && (<button className={styles["button"]} onClick={() => formatJson()}>Format Excel</button>)}
            {formatLoading && <h4 style={{ color: "red" }}>Formatting Rows ...</h4>}
            {(exportJson?.length > 0) && <button className={styles["button"]} onClick={() => convertJSONToExcel()}>Download Formatted File</button>}
        </div>
    )
}

export default Format1;
