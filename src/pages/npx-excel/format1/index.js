import React, { useState } from "react";
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

import styles from "./styles.module.scss"

const ReadMultiSheetsToJSON = ({ onFileUpload }) => {
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

        return jsonData
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = e.target.result;
            console.log(data);
            let jsonData = await convertExcelToJson(data);

            // Remove blank rows
            jsonData = jsonData.filter(row => Object.values(row).some(cellValue => cellValue !== null && cellValue !== ''));

            onFileUpload(jsonData)
        };

        reader.readAsArrayBuffer(file);
    };

    return <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} multiple />
}

const Format1 = () => {
    const [inputJson, setInputJson] = useState([])
    const [jsonLoadSuccess, setJSONLoadSuccess] = useState(false)


    const onFileUpload = (data) => {
        if (data?.length > 0) {
            setInputJson(data);
            setJSONLoadSuccess(true)
        }
    }

    console.log(inputJson);

    return (
        <div>
            <h3>Format 1 - Excel (P1)</h3>

            {/* Add here the options for mergable cells and merge... + option for top and bottom merge */}

            <label>Upload Excel </label>
            <ReadMultiSheetsToJSON onFileUpload={onFileUpload} />
        </div>
    )
}

export default Format1