import React, { useState } from "react";
import styles from './styles.module.scss'
import { ExcelFileUploader } from '../validate-links/index'
import ExcelJS from 'exceljs';
import MergeExcels from "./merge-excels";
import MergeJsons from "./merge-sheets";

const Excel = () => {
    const [tab, setTab] = useState("json-to-excel")
    // Json to Excel
    const [jsonFile, setJsonFile] = useState(null);
    // Excel To JSON
    const [jsonData, setJsonData] = useState([])
    const [sheetNumber, setSheetNumber] = useState()
    // Spitter
    const [splitLength, setSplitLength] = useState(0)
    const [splitJson, setSplitJson] = useState([])

    const tabsData = [
        {
            name: "JSON To Excel",
            ref: "json-to-excel"
        },
        {
            name: "Excel To JSON",
            ref: "excel-to-json"
        },
        {
            name: "Split Excel",
            ref: "split-excel"
        },
        {
            name: "Merge Excel",
            ref: "merge-excels"
        },
        {
            name: "Merge Sheets",
            ref: "merge-sheets"
        },
    ]

    const downloadJsonData = () => {
        const jsonContent = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const splitExcels = async () => {
        const chunks = splitJson.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / splitLength);

            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []; // start a new chunk
            }

            resultArray[chunkIndex].push(item);
            return resultArray;
        }, []);

        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index];
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');

            const headers = Object.keys(chunk[0]);
            worksheet.addRow(headers);

            chunk.forEach((dataRow) => {
                const row = [];
                headers.forEach((header) => {
                    row.push(dataRow[header]);
                });
                worksheet.addRow(row);
            });

            await workbook.xlsx.writeBuffer().then((buffer) => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Split File - ${index * splitLength} - ${(index + 1) * splitLength}`;
                a.click();
                URL.revokeObjectURL(url);
            });

            const delay = 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    };

    const handleMerge = async (files) => {
        let mergedWorkbook = new ExcelJS.Workbook();

        for (const file of files) {
            const reader = new FileReader();
            const buffer = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsArrayBuffer(file);
            });

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            let isFirstSheet = true;
            let isHeaderAdded = false;

            workbook.eachSheet((worksheet) => {
                const sheetName = worksheet.name;
                const mergedSheet = mergedWorkbook.getWorksheet(sheetName) || mergedWorkbook.addWorksheet(sheetName);

                worksheet.eachRow((row, rowNumber) => {
                    if (!(isFirstSheet && !isHeaderAdded && rowNumber === 1)) {
                        mergedSheet.addRow(row.values);
                    }
                });

                isFirstSheet = false;
                if (!isHeaderAdded) {
                    isHeaderAdded = true;
                }
            });
        }

        const buffer = await mergedWorkbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'MergedFile.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleInputFileChange = (event) => {
        const folderInput = event.target;
        if (folderInput.files.length > 0) {
            handleMerge(folderInput.files);
        }
    };

    const handleUploadJsonFile = (event) => {
        const selectedFile = event.target.files[0];
        setJsonFile(selectedFile);
    };

    const handleUpload = async () => {
        if (jsonFile) {
            try {
                const fileContent = await readFileContent(jsonFile);
                const jsonData = JSON.parse(fileContent);

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sheet 1');

                const headers = Object.keys(jsonData[0]);
                worksheet.addRow(headers);

                jsonData.forEach((row) => {
                    const values = headers.map((header) => row[header]);
                    worksheet.addRow(values);
                });

                const excelBlob = await workbook.xlsx.writeBuffer();
                saveAs(excelBlob, 'output.xlsx');
            } catch (error) {
                console.error('Error parsing JSON:', error.message);
            }
        }
    };

    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsText(file);
        });
    };

    const saveAs = (blob, filename) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([blob]));
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className={styles['excel-page']}>
            <h1>EXCEL Helper</h1>
            <div className={styles['tabs-section']}>
                {tabsData.map(tabItem => (
                    <div key={tabItem.name} className={tab === tabItem.ref && styles["active"]} onClick={() => setTab(tabItem.ref)}>{tabItem.name}</div>
                ))}
            </div>
            <br />
            {tab === "json-to-excel" && (
                <div className={styles['page-contents']}>
                    <h3>Convert JSON to Excel</h3>
                    <input type="file" onChange={handleUploadJsonFile} />
                    <button onClick={handleUpload}>Upload and Convert</button>
                </div>
            )}
            {tab === "excel-to-json" && (
                <div className={styles['page-contents']}>
                    <h3>Convert Excel to JSON</h3>
                    <small className={styles['input-label']}>Sheet Number:</small>
                    <input type="number" onChange={(e) => setSheetNumber(e.target.value)} className={!sheetNumber && styles['highlight-input']} />
                    <br />
                    <br />
                    <div className={!sheetNumber && styles['disable-upload']}>
                        <ExcelFileUploader onFileUpload={setJsonData} sheetKey={sheetNumber} />
                    </div>
                    {jsonData?.length > 0 && <h3 className={styles['success-text']}>Data Converted to JSON Successfully!!</h3>}
                    <br />
                    <br />
                    <br />
                    <br />
                    {jsonData?.length > 0 && <button onClick={downloadJsonData}>Download JSON Data</button>}
                </div>
            )}
            {tab === "split-excel" && (
                <div className={styles['page-contents']}>
                    <h3>Split Excels</h3>
                    <label>Enter the numbers to split</label><br />
                    <input type="number" onChange={(e) => setSplitLength(e.target.value)} />
                    <br />
                    <br />
                    <ExcelFileUploader onFileUpload={setSplitJson} />
                    {splitJson?.length > 0 && <h3 style={{ color: "green" }}>Json Converted to Excel</h3>}
                    <br />
                    <br />
                    <h4>JSON to Excel Converter</h4>
                    <button onClick={splitExcels}>Split to Files</button>
                </div>
            )}
            {tab === "merge-sheets" && (
                <MergeJsons />
            )}
            {tab === 'merge-excels' && (
                <MergeExcels />
            )}
        </div>
    )
}

export default Excel