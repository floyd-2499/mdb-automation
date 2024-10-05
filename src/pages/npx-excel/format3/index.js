import React, { useState } from "react";
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

import styles from "./styles.module.scss"

const Format3 = () => {
    const [inputJson, setInputJson] = useState([]);
    const [jsonLoad, setJSONLoad] = useState(false);
    const [splitHeaders, setSplitHeaders] = useState("Company, Meeting Type, Meeting Date, Resolution, Proposal, Proposal Type, Vote Cast, Reason")
    const [exportJson, setExportJson] = useState([])
    const [formatLoading, setFormatLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("")

    const columnHeaders = splitHeaders.split(", ")

    const onFileUpload = (event) => {
        setJSONLoad(true);
        const file = event.target.files[0];
        setUploadedFileName(file?.name?.split(".")[0])
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

    const formatJson = () => {
        setFormatLoading(true);
        let formattedData = [];
        let currentSet = [];
        let headersFound = false;

        inputJson.forEach((row) => {
            // Convert row to lowercase to match against headers
            const rowLowerCase = row.map(cell => cell ? String(cell).toLowerCase() : '');

            // Check if the current row matches the column headers
            if (rowLowerCase.every((value, index) => value === columnHeaders[index]?.toLowerCase())) {
                // If headers are found, finalize the previous set if it exists
                if (currentSet.length > 0) {
                    formattedData.push([...currentSet]); // Push the current set (excluding headers)
                }

                // Start a new set and mark headers as found
                headersFound = true;
                currentSet = []; // Reset current set
            }

            if (headersFound) {
                // Add the current row to the current set if it's not the header row
                currentSet.push(row);
            }
        });

        // Push the last accumulated set if it has more than just the headers
        if (currentSet.length > 0) {
            formattedData.push([...currentSet]);
        }

        console.log(formattedData);

        setExportJson(formattedData);
        setFormatLoading(false);
    };


    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        worksheet.addRow(columnHeaders);

        // Add data rows
        exportJson.forEach((dataRow) => {
            const row = columnHeaders.map((_, index) => dataRow[index] || '');
            worksheet.addRow(row);
        });

        // Generate Excel file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Formatted EXCEL.xlsx`;
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
            <div className={styles["input-wrapper"]}>
                <label>Add Split Headers <small className={styles["important-text"]}> ( Add "," and "--space--" )</small></label>
                <input style={{ width: "500px" }} type="text" onChange={(e) => setSplitHeaders(e.target.value)} value={splitHeaders} placeholder="Number, Proposal Text, Proponent, Mgmt" />
            </div>
            <br />
            {(inputJson?.length > 0 && exportJson?.length === 0) && (<button className={styles["button"]} onClick={() => formatJson()}>Format Excel</button>)}
            {formatLoading && <h4 style={{ color: "red" }}>Formatting Rows ...</h4>}
            {(exportJson?.length > 0) && <button className={styles["button"]} onClick={() => convertJSONToExcel()}>Download Formatted File</button>}
        </div>
    )
}

export default Format3;
