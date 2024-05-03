import React, { useState } from "react";
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

import styles from "./styles.module.scss"

const Format2 = () => {
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

    const rowValidation = (currentRow) => {
        const splitTableHeaders = splitHeaders.split(", ")
        if (currentRow[0] === "Baillie Gifford" && currentRow[1] === "Where Votes Have Been Instructed Globally") {
            return false
        } else if (currentRow.every((value, index) => value === splitTableHeaders[index])) {
            return false
        } else if (currentRow.length === 1) {
            return false
        } else {
            return true
        }
    }

    // try 1
    // const formatJson = () => {
    //     setFormatLoading(true)
    //     let previousRow = null;
    //     const validatedJson = inputJson.map((currentRow, index) => {
    //         const isValidRow = rowValidation(currentRow);
    //         if (!isValidRow) return null;

    //         if (previousRow && currentRow[2] === "" && currentRow.slice(3, 6).every(value => value !== "")) {
    //             currentRow.forEach((value, columnIndex) => {
    //                 if (value !== "") {
    //                     previousRow[0] += currentRow[0];
    //                     previousRow[1] += currentRow[1];

    //                     currentRow[0] = "";
    //                     currentRow[1] = "";
    //                 }
    //             });
    //             return currentRow;
    //         }

    //         previousRow = currentRow;
    //         return currentRow;
    //     })?.filter(row => row !== null)

    //     const splitTableHeaders = splitHeaders.split(", ")
    //     let previousData = {};

    //     const structuredJson = validatedJson.map(data => {
    //         const newData = data.reduce((obj, val, index) => ({ ...obj, [splitTableHeaders[index]]: val }), {});

    //         if (newData.Company === "" && previousData.Company) {
    //             newData.Company = previousData.Company;
    //         }

    //         if (newData['Meeting Date'] === "" && previousData['Meeting Date']) {
    //             newData['Meeting Date'] = previousData['Meeting Date'];
    //         }

    //         if (newData['Meeting Type'] === "" && previousData['Meeting Type']) {
    //             newData['Meeting Type'] = previousData['Meeting Type'];
    //         }

    //         previousData = newData;
    //         return newData;
    //     });

    //     setExportJson(structuredJson)
    //     setFormatLoading(false)
    // }

    const formatJson = () => {
        setFormatLoading(true)

        const structuredJson = inputJson.map(currentRow => {
            const isValidRow = rowValidation(currentRow);
            if (!isValidRow) return null;
            const newData = currentRow.reduce((obj, val, index) => ({ ...obj, [columnHeaders[index]]: val }), {});
            return newData
        })?.filter(row => row !== null)

        const splitJsons = [];
        let currentGroup = [];
        let mergedCompany = "";
        let mergedMeetingType = "";
        let mergedMeetingDate = "";

        for (let i = 0; i < structuredJson.length; i++) {
            const currentRow = structuredJson[i];
            const hasRequiredFields = ['Meeting Type', 'Meeting Date', 'Resolution', 'Proposal', 'Proposal Type', 'Vote Cast']
                .every(field => currentRow[field]);

            if (hasRequiredFields && currentGroup.length > 0) {
                mergedCompany = currentGroup.map(obj => obj && obj.Company).join('') || mergedCompany;
                mergedMeetingType = currentGroup.map(obj => obj && obj['Meeting Type']).join('') || mergedMeetingType;
                mergedMeetingDate = currentGroup.map(obj => obj && obj['Meeting Date']).join('') || mergedMeetingDate;

                currentGroup?.map(item => {
                    item['Company'] = mergedCompany;
                    item['Meeting Type'] = mergedMeetingType;
                    item['Meeting Date'] = mergedMeetingDate;
                })

                const itemsToRemove = [];
                let lastReasonIndex = -1;
                currentGroup?.forEach((obj, index) => {
                    if (!obj.Resolution && !obj.Proposal && !obj['Proposal Type'] && !obj['Vote Cast'] && obj.Reason) {
                        if (lastReasonIndex !== -1) {
                            currentGroup[lastReasonIndex].Reason += ` ${obj.Reason}`;
                            itemsToRemove.push(index);
                        }
                    } else {
                        lastReasonIndex = index;
                    }
                });

                itemsToRemove.reverse().forEach(index => {
                    currentGroup.splice(index, 1);
                });

                splitJsons.push(currentGroup);
                currentGroup = [];
            }

            currentGroup.push(currentRow);
        }

        if (currentGroup.length > 0) {
            splitJsons.push(currentGroup);
        }

        setExportJson([].concat(...splitJsons))
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
            columnHeaders.forEach((header) => {
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
            a.download = `${uploadedFileName} - Formatted NPX EXCEL.xlsx`;
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

export default Format2;
