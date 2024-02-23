import React, { useState } from "react";
import ExcelJS from 'exceljs';
import styles from "./styles.module.scss"

export const MultiFileJson = ({ onFileUpload }) => {
    const handleFileUpload = async (event) => {
        const files = event.target.files;

        const promises = Array.from(files).map(async (file) => {
            const reader = new FileReader();

            return new Promise((resolve) => {
                reader.onload = async (e) => {
                    const data = e.target.result;
                    const jsonData = await convertExcelToJson(data);
                    resolve(jsonData);
                };

                reader.readAsArrayBuffer(file);
            });
        });

        Promise.all(promises)
            .then((result) => {
                // Flatten the array of JSONs if there are multiple files
                const flattenedData = result.flat();
                onFileUpload(flattenedData);
                onFileUpload(flattenedData);
            })
            .catch((error) => {
                console.error('Error reading Excel files:', error);
            });
    };

    const convertExcelToJson = async (data) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);

        const jsonData = [];

        workbook.eachSheet((sheet, sheetId) => {
            const header = sheet.getRow(1).values;

            sheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    const rowData = {};
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        rowData[header[colNumber]] = cell?.value !== undefined ? cell.value : null;
                    });
                    jsonData.push(rowData);
                }
            });
        });

        return jsonData;
    };

    return <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} multiple />
}

const MergeExcels = () => {
    const [inputJson, setInputJson] = useState([])
    const [loadSuccess, setLoadSuccess] = useState(false)

    const onFileUpload = (data) => {
        if (data?.length > 0) {
            setInputJson(data);
            setLoadSuccess(true)
        }
    }

    console.log(inputJson.length);
    console.log(inputJson);

    // const convertJSONToExcel = () => {
    //     const workbook = new ExcelJS.Workbook();
    //     const worksheet = workbook.addWorksheet('Sheet 1');

    //     // Specify the fields you want to export
    //     const selectedFields = [
    //         'Batches',
    //         'clarity_id',
    //         'metric',
    //         'metric_year',
    //         'value_to_check',
    //         'link',
    //         'omy',
    //         'Allotment',
    //         'Data Value',
    //         'Comments',
    //         'Snippet',
    //         'URL',
    //         'Page number',
    //     ];

    //     // Add headers
    //     worksheet.addRow(selectedFields);

    //     // Add data rows
    //     inputJson.forEach((dataRow) => {
    //         const row = selectedFields.map(field => dataRow[field] || null);
    //         worksheet.addRow(row);
    //     });

    //     const currentDate = new Date();

    //     // Generate Excel file
    //     workbook.xlsx.writeBuffer().then((buffer) => {
    //         const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //         const url = URL.createObjectURL(blob);
    //         const a = document.createElement('a');
    //         a.href = url;
    //         a.download = `Jitesh_Merged.xlsx`;
    //         a.click();
    //         URL.revokeObjectURL(url);
    //     });
    // };

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

        const currentDate = new Date()
        // Generate Excel file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Merged Excel.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className={styles["page-contents"]}>
            <h2>Merge Excels</h2>

            <h4>Upload Base Excel</h4>
            <MultiFileJson onFileUpload={onFileUpload} />
            <br />
            <small style={{ color: "red" }}><i>** This will take <b>1st</b> line as header. **</i></small>
            <br />
            <br />

            {loadSuccess && (
                <div>
                    <h1>JSON to Excel Converter</h1>
                    <button onClick={convertJSONToExcel}>Download Excel</button>
                </div>
            )}
        </div>
    )
}

export default MergeExcels