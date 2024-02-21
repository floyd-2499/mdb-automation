import React, { useState } from "react";

import ExcelJS from 'exceljs';

export const MultiExcelFileUploader = ({ onCombinedFileUpload }) => {
    const handleFileUpload = async (event) => {
        const files = event.target.files;
        const combinedData = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const data = e.target.result;
                const jsonData = await convertExcelToJson(data);
                combinedData.push(jsonData);

                if (combinedData.length === files.length) {
                    // If all files processed, pass combined data to parent component
                    onCombinedFileUpload(combinedData);
                }
            };

            reader.readAsArrayBuffer(file);
        }
    };

    const convertExcelToJson = async (data) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);

        const sheet = workbook.worksheets[0]; // Process data from the first sheet
        const header = sheet.getRow(1).values;

        const jsonData = [];
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) {
                const rowData = {};
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    rowData[header[colNumber]] = cell?.value !== undefined ? cell.value : null;
                });
                jsonData.push(rowData);
            }
        });

        return jsonData;
    };

    return <input type="file" accept=".xlsx, .xls" multiple onChange={handleFileUpload} />;
};

const MultiExcel = () => {
    const [jsonData, setJsonData] = useState(null);
    const [loadSuccess, setLoadSuccess] = useState(false)

    const handleUploadFileUpload = (data) => {
        console.log(data);
        if (data?.length > 0) {
            setLoadSuccess(true)
        }
    }

    const convertJSONToExcel = () => {
        console.log(jsonData);
    }

    return (
        <div className="page">
            <div>
                <h2>Upload Base Excel</h2>
                <MultiExcelFileUploader onCombinedFileUpload={handleUploadFileUpload} />
            </div>
            {loadSuccess && <h3 style={{ color: "green" }}>Convertion Completed</h3>}
            <br />
            <br />
            <div>
                <h2>JSON to Excel Converter</h2>
                <button onClick={convertJSONToExcel}>Download Excel</button>
            </div>
        </div>
    )

}

export default MultiExcel