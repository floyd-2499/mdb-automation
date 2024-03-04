import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss"
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

const NPXExcel = () => {
    const [splitHeaders, setSplitHeaders] = useState("Number, Proposal Text, Proponent, Rec, Rec, Instruction, Mgmt")
    const [rationaleText, setRationaleText] = useState("Voting Policy Rationale:")
    const [inputJson, setInputJson] = useState([])
    const [fetchLoading, setFetchLoading] = useState(false);
    const [companyData, setCompanyData] = useState(null);

    // single sheet
    // const handleFileUpload = (e) => {
    //     const file = e.target.files[0];

    //     if (file) {
    //         const reader = new FileReader();

    //         reader.onload = (e) => {
    //             const data = new Uint8Array(e.target.result);
    //             const workbook = XLSX.read(data, { type: 'array' });
    //             const sheetName = workbook.SheetNames[0];
    //             const sheet = workbook.Sheets[sheetName];
    //             const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, range: "A1:Z100" })

    //             setInputJson(jsonData);
    //         };

    //         reader.readAsArrayBuffer(file);
    //     }
    // };


    // All Sheets
    // const handleFileUpload = (e) => {
    //     const file = e.target.files[0];

    //     if (file) {
    //         const reader = new FileReader();

    //         reader.onload = (e) => {
    //             const data = new Uint8Array(e.target.result);
    //             const workbook = XLSX.read(data, { type: 'array' });
    //             const allSheetsData = [];

    //             workbook.SheetNames.forEach((sheetName) => {
    //                 const sheet = workbook.Sheets[sheetName];
    //                 const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, range: "A1:Z100" });
    //                 allSheetsData.push(...jsonData);
    //             });

    //             setInputJson(allSheetsData);
    //         };

    //         reader.readAsArrayBuffer(file);
    //     }
    // };

    // Merging All sheets
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
                    allSheetsData = [...allSheetsData, ...jsonData];
                });

                setInputJson(allSheetsData);
            };

            reader.readAsArrayBuffer(file);
        }
    };

    // backup
    // const extractCompanyData = (myJson) => {
    //     const companyData = [];
    //     let currentCompany = {};

    //     for (const row of myJson) {
    //         if (row.length === 1 && !row[0].includes(":")) {
    //             // This is the company name
    //             if (Object.keys(currentCompany).length > 0) {
    //                 companyData.push(currentCompany);
    //             }
    //             currentCompany = {
    //                 company: row[0],
    //             };
    //         } else if (row.length >= 1) {

    //             if (
    //                 row.toString() === ['', '', '', '', 'Voting', '', 'Vote '].toString() ||
    //                 row.toString() === ['Proposal ', '', '', 'Mgmt', 'Policy ', 'Vote ', 'Against '].toString() ||
    //                 row.toString() === ['Number', 'Proposal Text', 'Proponent', 'Rec', 'Rec', 'Instruction', 'Mgmt'].toString()
    //             ) {
    //                 break;
    //             }

    //             // This is company details part
    //             row.forEach((item) => {
    //                 const [key, ...valueArray] = item.split(":").map((item) => item.trim());
    //                 const value = valueArray.join(":").trim();
    //                 currentCompany[key] = value;
    //             });
    //         } else if (row.length >= 1) {
    //             if (
    //                 row.toString() === ['', '', '', '', 'Voting', '', 'Vote '].toString() ||
    //                 row.toString() === ['Proposal ', '', '', 'Mgmt', 'Policy ', 'Vote ', 'Against '].toString() ||
    //                 row.toString() === ['Number', 'Proposal Text', 'Proponent', 'Rec', 'Rec', 'Instruction', 'Mgmt'].toString()
    //             ) {
    //                 // Skip the loop when encountering these specific arrays inside the else part
    //                 continue;
    //             }
    //         }
    //     }

    //     // Add the last company data
    //     if (Object.keys(currentCompany).length > 0) {
    //         companyData.push(currentCompany);
    //     }

    //     return companyData;
    // };

    const processTableArr = (tableArr) => {
        tableArr.shift();

        for (let i = 0; i < tableArr.length; i++) {
            const currentObj = tableArr[i];

            // Check conditions for merging with the previous object
            if (
                !currentObj['Proponent'] &&
                !currentObj['Vote Against Mgmt']
            ) {
                // Move Proposal Text to the previous object
                if (i > 0) {
                    const rationaleItem = Object.keys(currentObj).find(key =>
                        currentObj[key] &&
                        currentObj[key].toString().startsWith(rationaleText)
                    );

                    if (rationaleItem) {
                        tableArr[i - 1]['Rationale'] = currentObj[rationaleItem].replace(rationaleText, '').trim();
                    } else {
                        for (const key in currentObj) {
                            if (currentObj[key]) {

                                // If the current item has a value, merge it with the previous object
                                if (tableArr[i - 1][key]) {
                                    const isPrevRationaleAvailable = tableArr[i - 1]['Rationale']

                                    if (isPrevRationaleAvailable) {
                                        tableArr[i - 1]['Rationale'] += ` ${currentObj[key]}`;
                                    } else {
                                        tableArr[i - 1][key] += ` ${currentObj[key]}`;
                                    }
                                } else {
                                    tableArr[i - 1][key] = currentObj[key];
                                }

                            }
                        }
                    }

                    tableArr.splice(i, 1);
                    i--; // Adjust the index since we removed an element
                }
            }
        }

        return tableArr;
    };

    // const processTableArr = (tableArr) => {
    //     // Remove the first object
    //     tableArr.shift();

    //     for (let i = 0; i < tableArr.length; i++) {
    //         const currentObj = tableArr[i];

    //         // Check conditions for merging with the previous object
    //         if (
    //             !currentObj['Proponent'] &&
    //             !currentObj['Vote Against Mgmt']
    //         ) {
    //             // Move Proposal Text to the previous object
    //             if (i > 0) {
    //                 const rationaleItem = Object.keys(currentObj).find(key =>
    //                     currentObj[key] &&
    //                     currentObj[key]?.toString()?.startsWith('Voting Policy Rationale:')
    //                 );

    //                 if (rationaleItem) {
    //                     // Move the current object text to the 'Rationale' in the previous object
    //                     if (tableArr[i - 1]['Rationale']) {
    //                         tableArr[i - 1]['Rationale'] += ` ${currentObj[rationaleItem].replace('Voting Policy Rationale:', '').trim()}`;
    //                     } else {
    //                         tableArr[i - 1]['Rationale'] = currentObj[rationaleItem].replace('Voting Policy Rationale:', '').trim();
    //                     }

    //                     // Remove the current object
    //                     tableArr.splice(i, 1);
    //                     i--; // Adjust the index since we removed an element
    //                 } else {
    //                     // Check if the previous object has 'Rationale' key
    //                     if (tableArr[i - 1]['Rationale']) {
    //                         tableArr[i - 1]['Rationale'] += ` ${currentObj['Proposal Text']}`;
    //                     } else {
    //                         // Merge other keys as before
    //                         for (const key in currentObj) {
    //                             if (currentObj[key]) {
    //                                 // If the current item has a value, merge it with the previous object
    //                                 if (tableArr[i - 1][key]) {
    //                                     tableArr[i - 1][key] += ` ${currentObj[key]}`;
    //                                 } else {
    //                                     tableArr[i - 1][key] = currentObj[key];
    //                                 }
    //                             }
    //                         }
    //                     }
    //                     // Remove the current object
    //                     tableArr.splice(i, 1);
    //                     i--; // Adjust the index since we removed an element
    //                 }
    //             }
    //         }
    //     }

    //     return tableArr;
    // };

    const extractCompanyData = (myJson) => {
        if (myJson.length > 1) {
            const companyData = [];
            const tableArr = [];
            let currentCompany = {};
            let isAfterSplits = false;

            for (let i = 0; i < myJson.length; i++) {
                const row = myJson[i];

                if (row.length === 1 && !row[0].includes(":")) {
                    // This is the company name
                    if (Object.keys(currentCompany).length > 0) {
                        companyData.push(currentCompany);
                    }
                    currentCompany = {
                        company: row[0],
                    };
                } else if (row.length >= 1) {

                    const splitsTableHeader = splitHeaders.split(", ")

                    if (row.toString() === splitsTableHeader.toString()) {
                        isAfterSplits = true;
                    }

                    // This is company details part
                    if (isAfterSplits) {
                        const keys = ['Proposal Number', 'Proposal Text', 'Proponent', 'Mgmt Rec', 'Voting Policy Rec', 'Vote Instruction', 'Vote Against Mgmt'];
                        const rowData = Object.fromEntries(keys.map((key, index) => [key, row[index]]));
                        tableArr.push(rowData);

                        // Additional functionality to handle tableArr
                        if (keys.every((key) => !rowData[key].toString().trim())) {
                            if (tableArr.length > 1) {
                                tableArr[tableArr.length - 2] = { ...tableArr[tableArr.length - 2], ...rowData };
                                tableArr.pop();
                            }
                        }
                    } else {
                        row.forEach((item) => {
                            if (item) {
                                if (item?.toString()?.includes(":")) {
                                    const [key, ...valueArray] = item?.toString()?.split(":").map((i) => i.trim());
                                    const value = valueArray.join(":").trim();
                                    currentCompany[key] = value;
                                }
                            }
                        });
                    }
                }
            }

            // Add the last company data
            if (Object.keys(currentCompany).length > 0) {
                companyData.push(currentCompany);
            }

            const formattedTable = processTableArr(tableArr)
            const finalizedCompanyDetails = formattedTable?.map(detail => ({ ...companyData[0], ...detail }))

            return finalizedCompanyDetails;
        }
    };

    const splitJSON = (json) => {
        setFetchLoading(true)
        const resultArrays = [];
        let currentArray = [];

        let startNewArray = false;

        for (const row of json) {
            const isStartConditionMet =
                row.length === 2 &&
                row[0] === "" &&
                row[1].startsWith("VOTE SUMMARY REPORT");

            if (startNewArray && isStartConditionMet) {
                startNewArray = false;
            }

            if (row.length === 1 && row[0] !== "" && !row[0].includes(":")) {
                if (currentArray.length > 0 && currentArray[0].length === 1) {
                    resultArrays.push(currentArray.filter((item) => item.length > 0));
                }
                currentArray = [];
                startNewArray = true;
            }

            currentArray.push(row);
        }

        // Push the last set if it is not empty and the first object is a single length
        if (currentArray.length > 0 && currentArray[0].length === 1) {
            resultArrays.push(currentArray.filter((item) => item.length > 0));
        }

        const finalData = resultArrays?.map((sepArr) => {
            return extractCompanyData(sepArr)
        })

        return finalData
    };

    const convertJSONToExcel = (data) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        // const headers = Object?.keys(data[0]);
        const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))];
        worksheet.addRow(headers);

        // Add data rows
        data.forEach((dataRow) => {
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
            a.download = `npx-result-praneeth ${currentDate.toLocaleString()}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    useEffect(() => {
        if (inputJson) {
            const separatedArrays = splitJSON(inputJson);
            const combinedData = [].concat(...separatedArrays); // Combine arrays

            const missingValues = ['Meeting Date', 'Country', 'Ticker', 'Record Date', 'Meeting Type', 'Primary Security ID', 'Voting Policy', 'Shares Voted'];

            for (let i = 1; i < combinedData.length; i++) {
                const currentObject = combinedData[i];
                const previousObject = combinedData[i - 1];

                if (currentObject && previousObject) {
                    // Check if "Company Name" is the same
                    if (currentObject['company'] === previousObject['company']) {
                        // Check if any of the keys in missingValues are missing in the current object
                        const hasMissingValues = missingValues.some(key => !currentObject[key]);

                        if (hasMissingValues) {
                            // Use the previous object's values for missing keys
                            missingValues.forEach(key => {
                                if (!currentObject[key]) {
                                    currentObject[key] = previousObject[key];
                                }
                            });
                        }
                    }
                }
            }

            setCompanyData(combinedData);
            setFetchLoading(false)
        }
    }, [inputJson])

    return (
        <div className={styles["npx-excel-page"]}>
            <h1>Excel in NPX format </h1>

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

export default NPXExcel