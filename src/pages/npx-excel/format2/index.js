import React, { useState } from "react";
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

import styles from "./styles.module.scss"

const Format2 = () => {
    const [inputJson, setInputJson] = useState([]);
    const [jsonLoad, setJSONLoad] = useState(false);
    const [splitHeaders, setSplitHeaders] = useState("COMPANY NAME, TICKER, PRIMARY ISIN, COUNTRY, MEETING DATE, RECORD DATE, MEETING TYPE, PROPONENT, PROPOSAL NUMBER, PROPOSAL TEXT, MANAGEMENT RECOMMENDATION, VOTE INSTRUCTION, GOLDMAN SACHS ASSET MANAGEMENT RATIONALE")
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
        if (currentRow[0] === "Baillie Gifford" && currentRow[1] === "Where Votes Have Been Instructed Globally") {
            return false
        } else if (currentRow.every((value, index) => value === columnHeaders[index])) {
            return false
        } else if (currentRow.length === 1) {
            return false
        } else {
            return true
        }
    }

    // const formatJson = () => {
    //     setFormatLoading(true)

    //     const structuredJson = inputJson.map(currentRow => {
    //         const isValidRow = rowValidation(currentRow);
    //         if (!isValidRow) return null;
    //         const newData = currentRow.reduce((obj, val, index) => ({ ...obj, [columnHeaders[index]]: val }), {});
    //         return newData
    //     })?.filter(row => row !== null)

    //     const splitJsons = [];
    //     let currentGroup = [];
    //     let mergedCompany = "";
    //     let mergedMeetingType = "";
    //     let mergedMeetingDate = "";
    //     let mergedCountry = "";
    //     let mergedCompanyName = "";
    //     let mergedProposalText = "";

    //     for (let i = 0; i < structuredJson.length; i++) {
    //         const currentRow = structuredJson[i];
    //         const hasRequiredFields = ['MEETING TYPE', 'MEETING DATE', "COUNTRY", "COMPANY NAME", "PROPOSAL TEXT"]
    //             .every(field => currentRow[field]);

    //         if (hasRequiredFields && currentGroup.length > 0) {
    //             mergedCompany = currentGroup.map(obj => obj && obj["COMPANY NAME"]).join(' ') || mergedCompany;
    //             mergedMeetingType = currentGroup.map(obj => obj && obj['MEETING TYPE']).join(' ') || mergedMeetingType;
    //             mergedMeetingDate = currentGroup.map(obj => obj && obj['MEETING DATE']).join(' ') || mergedMeetingDate;
    //             mergedCountry = currentGroup.map(obj => obj && obj['COUNTRY']).join(' ') || mergedCountry;
    //             mergedCompanyName = currentGroup.map(obj => obj && obj['COMPANY NAME']).join(' ') || mergedCompanyName;
    //             mergedProposalText = currentGroup.map(obj => obj && obj['PROPOSAL TEXT']).join(' ') || mergedProposalText;

    //             currentGroup?.map(item => {
    //                 item['COMPANY NAME'] = mergedCompany;
    //                 item['MEETING TYPE'] = mergedMeetingType;
    //                 item['MEETING DATE'] = mergedMeetingDate;
    //                 item['COUNTRY'] = mergedMeetingDate;
    //                 item['COMPANY NAME'] = mergedCompanyName;
    //                 item['PROPOSAL TEXT'] = mergedProposalText;
    //             })

    //             const itemsToRemove = [];
    //             let lastReasonIndex = -1;
    //             currentGroup?.forEach((obj, index) => {
    //                 if (!obj.Resolution && !obj.Proposal && !obj['Proposal Type'] && !obj['Vote Cast'] && obj.Reason) {
    //                     if (lastReasonIndex !== -1) {
    //                         currentGroup[lastReasonIndex].Reason += ` ${obj.Reason}`;
    //                         itemsToRemove.push(index);
    //                     }
    //                 } else {
    //                     lastReasonIndex = index;
    //                 }
    //             });

    //             itemsToRemove.reverse().forEach(index => {
    //                 currentGroup.splice(index, 1);
    //             });

    //             splitJsons.push(currentGroup);
    //             currentGroup = [];
    //         }

    //         currentGroup.push(currentRow);
    //     }

    //     if (currentGroup.length > 0) {
    //         splitJsons.push(currentGroup);
    //     }

    //     console.log([].concat(...splitJsons));


    //     setExportJson([].concat(...splitJsons))
    //     setFormatLoading(false)
    // }

    const formatJson = () => {
        const headerIndices = columnHeaders.reduce((indices, header, idx) => {
            indices[header] = idx;
            return indices;
        }, {});

        const requiredHeaders = [
            'MEETING DATE',
            'RECORD DATE',
            'MANAGEMENT RECOMMENDATION',
            'VOTE INSTRUCTION'
        ];

        let formattedData = [];
        let previousRow = null;

        inputJson.forEach(row => {
            if (!rowValidation(row)) return; // Skip rows based on validation

            // If there's no previous row, just push the current row
            if (!previousRow) {
                previousRow = row;
                return;
            }

            // Check if the current row has any of the required headers with non-empty values
            const hasRequiredHeaders = requiredHeaders.some(header => {
                const headerIndex = headerIndices[header];
                return headerIndex !== undefined && row[headerIndex] !== undefined && row[headerIndex] !== '';
            });

            if (hasRequiredHeaders) {
                // If the current row has required headers, push the previous row and update it
                if (previousRow) {
                    formattedData.push(previousRow);
                    previousRow = row;
                }
            } else {
                // If the current row is missing required headers, merge with the previous row
                previousRow = previousRow.map((item, index) => `${item} ${row[index]}`);
            }
        });

        // Push the last accumulated row
        if (previousRow) {
            formattedData.push(previousRow);
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

export default Format2;
