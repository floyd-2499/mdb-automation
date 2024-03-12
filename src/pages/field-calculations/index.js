import React, { useEffect, useState } from "react";
import ExcelJS from 'exceljs';
import { ExcelFileUploader } from "../validate-links";
import styles from './styles.module.scss'

const FieldCalculations = () => {
    const [inputJson, setInputJson] = useState([])
    const [sheetKey, setSheetKey] = useState(0)
    const [loadSuccess, setLoadSuccess] = useState(false)
    const [finalizedJson, setFinalizedJson] = useState([])
    const [calculationsData, setCalculationsData] = useState([])

    const handleUploadbaseFile = (data) => {
        if (data?.length > 0) {
            setInputJson(data);
            setLoadSuccess(true)
        }
    }

    const findUniques = () => {
        const uniqueData = [];

        inputJson.forEach((item) => {
            let found = false;
            uniqueData.forEach((uniqueItem) => {
                if (
                    uniqueItem["provider_id"] === item["provider_id"] &&
                    uniqueItem["metric"] === item["metric"] &&
                    uniqueItem["companyName"] === item["companyName"]

                ) {
                    found = true;

                    if (item["metric_year"]) {
                        uniqueItem[item["metric_year"]] = item["value"];
                    }
                }
            });

            if (!found) {
                const newItem = {
                    "provider_id": item["provider_id"],
                    "metric": item["metric"],
                    ...item
                };

                if (item["metric_year"]) {
                    newItem[item["metric_year"]] = item["value"];
                }
                uniqueData.push(newItem);
            }
        });

        const headers = ['provider_id', 'metric', "companyName", '2018', '2019', '2020', '2021', '2022', "2023"]
        const arrayWithAllKeys = uniqueData.map(item => {
            const newObj = {};
            headers.forEach(key => {
                newObj[key] = item[key] || null;
            });
            return newObj;
        });

        arrayWithAllKeys.forEach(obj => {
            for (let i = 2018; i <= 2022; i++) { // Change the last year to 2022 as we start from 2016 and compare until 2023
                const currentYear = i.toString();
                let nextYear = (i + 1).toString();

                if (!obj[currentYear] || (obj[currentYear]?.toString() !== (null || "-99" || "" || -99))) {
                    while (nextYear !== '2024' && (obj[nextYear] === '' || obj[nextYear] === null)) {
                        nextYear = (parseInt(nextYear) + 1).toString();
                    }
                    if (nextYear !== '2024' && obj[nextYear] !== '' && obj[nextYear] !== null) {
                        const difference = parseFloat(obj[nextYear]) - parseFloat(obj[currentYear]);
                        const percentage = ((difference / parseFloat(obj[currentYear])) * 100) || "";
                        obj[`${currentYear}-${nextYear}`] = percentage && (percentage !== "NaN" ? percentage.toFixed(2) : "");
                    }
                }
            }
        });

        setCalculationsData(arrayWithAllKeys)
    };

    useEffect(() => {
        if (inputJson) {
            setFinalizedJson(inputJson)
            findUniques()
        }
    }, [inputJson, setFinalizedJson])

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');
        const workSheet2 = workbook.addWorksheet("Calculations")

        // Sheet 1
        const headers1 = Object?.keys(finalizedJson[0]);
        worksheet.addRow(headers1);
        finalizedJson.forEach((dataRow) => {
            const row = [];
            headers1.forEach((header) => {
                row.push(dataRow[header]);
            });
            worksheet.addRow(row);
        });


        // Sheet 2
        const headers2 = [...new Set(calculationsData.flatMap(obj => Object.keys(obj)))];
        const headers = ['provider_id', 'metric', "companyName", '2018', '2019', '2020', '2021', '2022', "2023"]
        workSheet2.addRow(headers2);
        calculationsData.forEach((dataRow) => {
            const row = [];
            let colorProviderId = false;

            headers2.forEach((header) => {
                if (!headers.includes(header)) {
                    const value = parseFloat(dataRow[header]);
                    if (!isNaN(value) && ((value > 50 && value < 100) || (value < -50 && value > -100))) {
                        colorProviderId = true;
                    }
                }
                row.push(dataRow[header]);
            });

            const rowAdded = workSheet2.addRow(row);
            if (colorProviderId) {
                rowAdded.getCell('G').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF0000' } // Red color for 'provider_id' cell
                };
            }
        });

        // Generate Excel file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date()
            a.href = url;
            a.download = `Percent Check ${date.toLocaleString()}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    console.log(finalizedJson);
    return (
        <div className="page">
            <div>
                <h3>Upload Base Excel</h3>
                <div className={styles["sheet-key"]}>
                    <h4 >Enter Sheet Number <span>*</span></h4>
                    <input type="number" onChange={(e) => setSheetKey(e.target.value)} placeholder="number" value={sheetKey} />
                </div>
                <div className={sheetKey ? styles.enable : styles.disable}>
                    <ExcelFileUploader onFileUpload={handleUploadbaseFile} sheetKey={Number(sheetKey) - 1 || 0} />
                </div>
                {loadSuccess && <h4 style={{ color: "green" }}>Uploaded Successfully</h4>}
                <br />
                <br />
                <br />
                {finalizedJson?.length > 0 && (
                    <div>
                        <h1>JSON to Excel Converter</h1>
                        <button onClick={convertJSONToExcel}>Download Excel</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FieldCalculations