import React, { useEffect, useState } from "react";
import ExcelJS from 'exceljs';
import { ExcelFileUploader } from "../validate-links";

const FieldMapper = () => {
    const [inputJson, setInputJson] = useState([])
    const [validations, setValidations] = useState([])
    const [FinalizedJson, setFinalizedJson] = useState([])
    const [loadSuccess, setLoadSuccess] = useState(false)
    const [validationLoadSuccess, setValidationLoadSuccess] = useState(false)
    const [changeSuccess, setChangeSuccess] = useState(false)

    const handleUploadbaseFile = (data) => {
        if (data?.length > 0) {
            setInputJson(data);
            setLoadSuccess(true)
        }
    }

    const handleUploadValidationFile = (data) => {
        setValidations(data)
        setValidationLoadSuccess(true)
    }

    useEffect(() => {
        const today = new Date();

        const findValidatedValues = (name) => {
            const findValues = validations?.find(item => item['metric'] === name)
            return {
                metric: findValues?.metric || "",
                unit: findValues?.unit || "",
                field: findValues?.field || "",
            }
        }


        if (inputJson?.length > 0 && validationLoadSuccess) {
            const mappedValues = inputJson.map((data, index) => {
                const matchedData = findValidatedValues(data?.metric)

                const findLinkValue = () => {
                    if (data["Match cases"] === "Match") {
                        if (data["link"] === ("" || null)) {
                            return ""
                        } else {
                            return data["link"]
                        }
                    } else {
                        return data["URL"] === ("" || null) ? data["link"] : data["URL"]
                    }
                }

                // Logic for value
                const findMatchedValue = (match, case1, val1, val2) => {
                    if (match === case1) {
                        return val1?.toString()
                    } else {
                        return val2?.toString()
                    }
                }

                return ({
                    "provider_id": data["clarity_id"] || "",
                    "metric": data?.metric,
                    "provider_code": "EDS1",
                    "value": findMatchedValue(data["Match cases"], "Match", data["value_to_check"], data["Data Value"]),
                    "data_type": "float",
                    "disclosure": "REPORTED",
                    "unit": matchedData.unit,
                    "create_date": today.toISOString().split('T')[0] + 'T00:00:00Z',
                    "reported_date": "",
                    "metric_year": data["metric_year"] || "",
                    "info": findMatchedValue(data["Match cases"], "Match", "", data["Comments"]),
                    "extract": findMatchedValue(data["Match cases"], "Match", "", data["Snippet"]),
                    "link": findLinkValue(),
                    "Batch": "",
                    "Field Name": matchedData.field,
                    "MAD / INCOMPLETE/ NONENGLISH": "",
                    "Coverage % * Reported": "",
                    "Reporting Scope": "",
                })
                // BACKUP
                // return ({
                //     "provider_id": data["clarity_id"] || "",
                //     "metric": data?.metric,
                //     "provider_code": "EDS1",
                //     "value": findMatchedValue(data["Match cases"], "Match", data["value_to_check"], data["Data Value"]),
                //     "data_type": "float",
                //     "disclosure": "REPORTED",
                //     "unit": matchedData.unit,
                //     "create_date": today.toISOString().split('T')[0] + 'T00:00:00Z',
                //     "reported_date": "",
                //     "metric_year": data["metric_year"] || "",
                //     "info": findMatchedValue(data["Match cases"], "Match", "", data["Comments"]),
                //     "extract": findMatchedValue(data["Match cases"], "Match", "", data["Snippet"]),
                //     "link": findMatchedValue(data["Match cases"], "Match", data["link"], data["URL"]),
                //     "Batch": "",
                //     "Field Name": matchedData.field,
                //     "MAD / INCOMPLETE/ NONENGLISH": "",
                //     "Coverage % * Reported": "",
                //     "Reporting Scope": "",
                // })
            })

            if (mappedValues?.length > 0) {
                setFinalizedJson(mappedValues)
                setChangeSuccess(true)
            }
        }
    }, [inputJson, setFinalizedJson, validationLoadSuccess, loadSuccess, setChangeSuccess])

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headers = Object?.keys(FinalizedJson[0]);
        worksheet.addRow(headers);

        // Add data rows
        FinalizedJson.forEach((dataRow) => {
            const row = [];
            headers.forEach((header) => {
                row.push(dataRow[header]);
            });
            worksheet.addRow(row);
        });

        // Generate Excel file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date()
            a.href = url;
            a.download = `Jitesh Final Check - ${date.toLocaleString()}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div>
            <div>
                <h3>Upload Base Excel</h3>
                <ExcelFileUploader onFileUpload={handleUploadbaseFile} />
            </div>
            {loadSuccess && <h3 style={{ color: "green" }}>Convertion Completed</h3>}
            <br />
            <br />
            <div>
                <h3>Upload Validation Excel</h3>
                <ExcelFileUploader onFileUpload={handleUploadValidationFile} />
                {validationLoadSuccess && <h3 style={{ color: "green" }}>Validation Completed</h3>}
            </div>
            {changeSuccess && <p style={{ color: "green" }}>Ready to Download</p>}
            <br />
            <div>
                <h1>JSON to Excel Converter</h1>
                <button onClick={convertJSONToExcel}>Download Excel</button>
            </div>
        </div>
    )
}

export default FieldMapper

