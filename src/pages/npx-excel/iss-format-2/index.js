import React, { useState } from "react";
import styles from "../iss-format-main/styles.module.scss"
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

const ignorableRows = ['Vote Summary Report', 'Date range covered: ',]
const headersToSplit = "Number, Proposal Text, Mgmt Rec, Instruction"
const rationaleSplitText = "Blended Rationale: "
const outputHeaders = ["Company Name", 'Meeting Date', 'Country', 'Meeting Type', 'Ticker', 'Number', 'Proposal Text', 'Mgmt Rec', 'Instruction', "Blended Rationale", "undefined"]

const ISSFormat2 = () => {
    const [splitHeaders, setSplitHeaders] = useState(headersToSplit)
    const [rationaleText, setRationaleText] = useState(rationaleSplitText)
    const [inputJson, setInputJson] = useState([])
    const [loadJson, setLoadJson] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(false);
    const [companyData, setCompanyData] = useState(null);

    const handleFileUpload = (e) => {
        setLoadJson(true)
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
                    if (jsonData?.length > 0) {
                        allSheetsData = [...allSheetsData, ...jsonData];
                    }
                });

                const filteredArray = allSheetsData.filter(subArray => subArray.length > 0 && !subArray.some(row => ignorableRows.includes(row)));

                setInputJson(filteredArray);
            };

            reader.readAsArrayBuffer(file);
        }
        setLoadJson(false)
    };

    const groupSplit = () => {
        let groups = [];
        let currentGroup = [];

        for (let subArray of inputJson) {
            if (subArray.length === 1 && currentGroup.length > 0) {
                groups.push(currentGroup);
                currentGroup = [];
            }

            currentGroup.push(subArray);
        }

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    }

    const formatCompany = (company) => {
        if (company.length > 1) {
            let companyDetails = [];
            let votingDetails = [];
            let isVotingDetails = false;
            let additionalInfo = {};

            for (let row of company) {
                if (row[0] === "Number" && row[1].includes("Proposal") && row[2].includes("Rec") && row[3] === "Instruction") {
                    isVotingDetails = true;
                    continue;
                }

                if (!isVotingDetails) {
                    companyDetails.push(row);
                } else {
                    votingDetails.push(row);
                }
            }

            if (companyDetails?.length > 0) {
                const companyName = companyDetails[0][0];
                for (let row of companyDetails) {
                    if (row?.length > 0) {
                        for (let item of row) {
                            if ((item.toLocaleString()).includes(":")) {
                                const [key, value] = item.split(": ");
                                if (['Meeting Date', 'Country', 'Meeting Type', 'Ticker'].includes(key)) {
                                    additionalInfo[key] = value;
                                }

                                additionalInfo['Company Name'] = companyName
                            }
                        }
                    }
                }

            }

            if (votingDetails?.length > 0) {
                const formattedDetails = [];
                let currentDetail = {};
                const keys = splitHeaders?.split(", ");

                votingDetails.forEach(row => {
                    let formattedRow = {};
                    row.forEach((item, index) => {
                        formattedRow[keys[index]] = item;
                    });

                    if (formattedRow['Number'] === "") {
                        Object.keys(formattedRow).forEach(key => {
                            currentDetail[key] = (currentDetail[key] || '') + ' ' + formattedRow[key];
                        });
                    } else {
                        if (Object.keys(currentDetail).length !== 0) {
                            // Check if Proposal Text contains rationaleSplitText
                            if (currentDetail['Proposal Text'].includes(rationaleSplitText)) {
                                const splitText = currentDetail['Proposal Text'].split(rationaleSplitText);
                                currentDetail['Proposal Text'] = splitText[0];
                                currentDetail['Blended Rationale'] = splitText[1];
                            }
                            currentDetail = { ...currentDetail, ...additionalInfo }
                            formattedDetails.push(currentDetail);
                        }
                        // Reset the currentDetail to the new formattedRow
                        currentDetail = formattedRow;
                    }
                });

                if (Object.keys(currentDetail).length !== 0) {
                    // Check if Proposal Text contains rationaleSplitText
                    if (currentDetail['Proposal Text'].includes(rationaleSplitText)) {
                        const splitText = currentDetail['Proposal Text'].split(rationaleSplitText);
                        currentDetail['Proposal Text'] = splitText[0];
                        currentDetail['Blended Rationale'] = splitText[1];
                    }

                    currentDetail = { ...currentDetail, ...additionalInfo }
                    formattedDetails.push(currentDetail);
                }
                return formattedDetails
            }
        }

        return null
    }

    const formatExcel = () => {
        const splits = groupSplit()
        const formattedSet = splits.map((company) => formatCompany(company)).filter(detail => detail !== null)
        const flattenedSet = formattedSet.flat()

        setCompanyData(flattenedSet)
    }

    const convertJSONToExcel = (data) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        // const headers = Object?.keys(data[0]);
        const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))];
        console.log(headers);

        worksheet.addRow(outputHeaders);

        // Add data rows
        data.forEach((dataRow) => {
            const row = [];
            outputHeaders.forEach((header) => {
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
            a.download = `iss-format-2-${currentDate.toLocaleString()}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className={styles["npx-excel-page"]}>
            <p>Please mention Split Headers</p>
            <input style={{ width: "500px" }} type="text" onChange={(e) => setSplitHeaders(e.target.value)} value={splitHeaders} />
            <br />
            <small>Please add "," and "space"</small>
            <br />
            <br />

            <p>Please mention Rationale text</p>
            <input type="text" onChange={(e) => setRationaleText(e.target.value)} value={rationaleText} />
            <br />
            <br />
            <br />

            <input type="file" onChange={handleFileUpload} />
            <br />
            {loadJson && <h4 style={{ color: "red" }}>Loading File ...</h4>}
            <br />

            {inputJson.length > 0 && (
                <button onClick={() => formatExcel()}>
                    Format Excel
                </button>
            )}
            <br />

            {fetchLoading && <h4 style={{ color: "red" }}>Working on it ...</h4>}
            {companyData?.length > 0 && <h3 style={{ color: "green" }}>Company Data is Ready</h3>}
            <br />
            <br />

            {(companyData?.length > 0 && !fetchLoading) && (
                <button onClick={() => convertJSONToExcel(companyData)}>
                    Download Excel
                </button>
            )}
        </div>
    )
}

export default ISSFormat2