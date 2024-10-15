import React, { useState } from "react";
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

import styles from "./styles.module.scss"

const Format3 = () => {
    const [inputJson, setInputJson] = useState([]);
    const [jsonLoad, setJSONLoad] = useState(false);
    const [exportJson, setExportJson] = useState([])
    const [formatLoading, setFormatLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("")

    // Row wise
    // const onFileUpload = (event) => {
    //     setJSONLoad(true);
    //     const file = event.target.files[0];
    //     setUploadedFileName(file?.name?.split(".")[0])
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             const data = new Uint8Array(e.target.result);
    //             const workbook = XLSX.read(data, { type: 'array' });
    //             let allData = [];
    //             workbook.SheetNames.forEach(sheetName => {
    //                 const sheet = workbook.Sheets[sheetName];
    //                 const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    //                 allData = allData.concat(jsonData);
    //             });
    //             setInputJson(allData);
    //             setJSONLoad(false);
    //         };
    //         reader.readAsArrayBuffer(file);
    //     }
    // }

    // First row as Keys
    const onFileUpload = (event) => {
        setJSONLoad(true);
        const file = event.target.files[0];
        setUploadedFileName(file?.name?.split(".")[0]);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let allData = [];

                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    // Read the data row by row
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    if (jsonData.length > 0) {
                        const headers = jsonData[0]; // Use the first row as headers
                        const rowData = jsonData.slice(1); // All subsequent rows

                        // Map each row to the corresponding header
                        const formattedData = rowData.map(row => {
                            let rowObject = {};
                            headers.forEach((header, index) => {
                                rowObject[header] = row[index] || ""; // Create key-value pairs
                            });
                            return rowObject;
                        });

                        allData = allData.concat(formattedData); // Add to the final data array
                    }
                });

                setInputJson(allData); // Update the state with formatted JSON
                setJSONLoad(false);
            };

            reader.readAsArrayBuffer(file);
        }
    };


    const formatJson = () => {
        setFormatLoading(true);
        let formattedData = [];

        inputJson.forEach((row, index) => {
            // Check if the row has a 'proposalNumber'
            if (!row.proposalNumber && index > 0) {
                // Merge with the previous row
                let previousRow = formattedData[formattedData.length - 1];

                // Merge 'proposalText', 'managementRec', and 'voteInstruction'
                previousRow.proposalText += "" + (row.proposalText || "");
                previousRow.managementRec += "" + (row.managementRec || "");
                previousRow.voteInstruction += "" + (row.voteInstruction || "");

            } else {
                // If the row has a 'proposalNumber', push it as is
                formattedData.push(row);
            }
        });

        // Post-processing to check for "Blended Rationale:" and split it
        formattedData = formattedData.map(row => {
            if (row.proposalText && row.proposalText.includes("Blended Rationale:")) {
                const [beforeRationale, afterRationale] = row.proposalText.split("Blended Rationale:");

                // Add rationale key with the text after "Blended Rationale:"
                row.rationale = afterRationale.trim(); // Add the rationale key with trimmed content

                // Update proposalText to remove the "Blended Rationale:" part
                row.proposalText = beforeRationale.trim();
            }

            return row; // Return the updated row
        });

        // Log the formatted data and update the state
        // console.log(formattedData);
        setExportJson(formattedData);
        setFormatLoading(false);
    };

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Step 1: Gather all unique keys from all rows
        let dynamicHeaders = new Set(); // Use a Set to store unique keys
        exportJson.forEach(row => {
            Object.keys(row).forEach(key => dynamicHeaders.add(key)); // Add each key to the Set
        });

        // Convert Set to an array
        dynamicHeaders = Array.from(dynamicHeaders);

        // Step 2: Add headers to the worksheet
        worksheet.addRow(dynamicHeaders);

        // Step 3: Add data rows
        exportJson.forEach((dataRow) => {
            const row = dynamicHeaders.map((header) => dataRow[header] || ''); // Map headers to data rows
            worksheet.addRow(row);
        });

        // Step 4: Generate Excel file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Formatted_EXCEL.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className={styles["format-1-container"]}>
            <h3>Format 3 - Excel (P1)</h3>
            <input type="file" onChange={onFileUpload} accept=".xlsx, .xls" />
            {jsonLoad && <h4 style={{ color: "red" }}>Fetching Details ...</h4>}
            {(inputJson?.length > 0 && !jsonLoad) && <h4 style={{ color: "green" }}>Data Fetched Successfully!</h4>}
            <br />
            {(inputJson?.length > 0 && exportJson?.length === 0) && (<button className={styles["button"]} onClick={() => formatJson()}>Format Excel</button>)}
            {formatLoading && <h4 style={{ color: "red" }}>Formatting Rows ...</h4>}
            {(exportJson?.length > 0) && <button className={styles["button"]} onClick={() => convertJSONToExcel()}>Download Formatted File</button>}
        </div>
    )
}

export default Format3;
