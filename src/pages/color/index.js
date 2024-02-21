import React, { useState } from "react";
import ExcelJS from 'exceljs';
import { ExcelFileUploader } from "../validate-links";

const ColorExcel = () => {
    const [inputJson, setInputJson] = useState([])
    const [loadSuccess, setLoadSuccess] = useState(false)

    const handleUploadbaseFile = (data) => {
        if (data?.length > 0) {
            setInputJson(data);
            setLoadSuccess(true)
        }
    }

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers

        const headers = ['In Scope', 'Unique code', 'Completed', 'Batches', 'PermID', 'Country', 'name', 'clarity_id', 'Pillar', 'metric', 'metric_year', 'value_to_check', 'reason_for_priority', 'link', 'omy', 'Allotment', 'Data Value', 'Match cases', 'Comments', 'Snippet', 'URL', 'Page number', 'End Date', 'Recheck required', 'QA Name', 'Status', 'QA Value', 'QA comments', 'Rework Status',];
        worksheet.addRow(headers);

        // Add data rows
        inputJson.forEach((dataRow) => {
            const row = [];
            headers.forEach((header) => {
                row.push(dataRow[header]);
            });
            worksheet.addRow(row);
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) {
                row.eachCell((cell, colNumber) => {

                    const matchCase = headers.indexOf('Match cases');
                    const dataValue = headers.indexOf('Data Value');
                    const comments = headers.indexOf('Comments');
                    const snippet = headers.indexOf('Snippet');
                    const urlsIndex = headers.indexOf('URL');
                    const link = headers.indexOf('link');
                    const name = headers.indexOf('name');
                    const qaValue = headers.indexOf('QA Value');
                    const qaComments = headers.indexOf('QA comments');
                    const reworkStatus = headers.indexOf('Rework Status');

                    const matchColumn = row.getCell(matchCase + 1)?.value;
                    const dataValueColumn = row.getCell(dataValue + 1);
                    const commentsColumn = row.getCell(comments + 1);
                    const snippetColumn = row.getCell(snippet + 1);
                    const urlsCell = row.getCell(urlsIndex + 1);
                    const linkColumn = row.getCell(link + 1);
                    const nameColumn = row.getCell(name + 1);
                    const qaValueColumn = row.getCell(qaValue + 1);
                    const qacommentsColumn = row.getCell(qaComments + 1);
                    const reworkStatusColumn = row.getCell(reworkStatus + 1);

                    if ((matchColumn !== "Match") && (matchColumn !== "Match ")) {
                        // green
                        if (dataValueColumn?.value === ("" || null)) {
                            if (!dataValueColumn?.value) {
                                headers.push('Data Value');
                                dataValueColumn.value = "";
                            }

                            dataValueColumn.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: '77E020' },
                            };

                            nameColumn.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFF00' },
                            };
                        } else {

                            //  Data column is not blank
                            // blue
                            if (dataValueColumn?.value?.toString() === ("NA")) {
                                if (commentsColumn.value === ("" || null)) {
                                    if (!commentsColumn?.value) {
                                        headers.push('Comments');
                                        commentsColumn.value = "";
                                    }

                                    commentsColumn.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: '5F6AFD' },
                                    };
                                    nameColumn.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: 'FFFF00' },
                                    };
                                }
                            } else {
                                //  DATA column not equal to NA or Blank
                                // yellow
                                if ((linkColumn?.value === ("" || null)) && (urlsCell.value === ("" || null))) {
                                    if (!urlsCell?.value) {
                                        headers.push('URL');
                                        urlsCell.value = "";
                                    }

                                    urlsCell.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: 'FFFF00' },
                                    };
                                    nameColumn.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: 'FFFF00' },
                                    };
                                }

                                // Red
                                if (snippetColumn.value === ("" || null)) {
                                    if (!snippetColumn?.value) {
                                        headers.push('Snippet');
                                        snippetColumn.value = "";
                                    }

                                    snippetColumn.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: 'F56767' },
                                    };
                                    nameColumn.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: 'FFFF00' },
                                    };
                                }

                                // Red
                                if (urlsCell.value === ("" || null)) {
                                    if (!urlsCell?.value) {
                                        headers.push('URL');
                                        urlsCell.value = "";
                                    }

                                    urlsCell.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: 'F56767' },
                                    };
                                    nameColumn.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: 'FFFF00' },
                                    };
                                }

                            }

                            // if ((dataValueColumn?.value?.toString() !== '-99' && dataValueColumn?.value?.toString() !== "NA") && ((linkColumn?.value === ("" || null)) && (urlsCell.value === ("" || null)))) {
                            //     if (!urlsCell?.value) {
                            //         headers.push('URL');
                            //         urlsCell.value = "";
                            //     }

                            //     urlsCell.fill = {
                            //         type: 'pattern',
                            //         pattern: 'solid',
                            //         fgColor: { argb: 'FFFF00' },
                            //     };
                            //     nameColumn.fill = {
                            //         type: 'pattern',
                            //         pattern: 'solid',
                            //         fgColor: { argb: 'FFFF00' },
                            //     };
                            // }

                            // if ((dataValueColumn?.value?.toString() === ("-99" || "NA")) && (commentsColumn.value === ("" || null))) {
                            //     if (!commentsColumn?.value) {
                            //         headers.push('Comments');
                            //         commentsColumn.value = "";
                            //     }

                            //     commentsColumn.fill = {
                            //         type: 'pattern',
                            //         pattern: 'solid',
                            //         fgColor: { argb: '5F6AFD' },
                            //     };
                            //     nameColumn.fill = {
                            //         type: 'pattern',
                            //         pattern: 'solid',
                            //         fgColor: { argb: 'FFFF00' },
                            //     };
                            // }


                            // if ((dataValueColumn?.value !== ("-99" || "NA" || null || "")) && ((snippetColumn.value === ("" || null)) || (urlsCell.value === ("" || null)))) {
                            //     if (!snippetColumn?.value) {
                            //         headers.push('Snippet');
                            //         snippetColumn.value = "";
                            //     }
                            //     if (!urlsCell?.value) {
                            //         headers.push('URL');
                            //         urlsCell.value = "";
                            //     }

                            //     snippetColumn.fill = {
                            //         type: 'pattern',
                            //         pattern: 'solid',
                            //         fgColor: { argb: 'F56767' },
                            //     };
                            //     urlsCell.fill = {
                            //         type: 'pattern',
                            //         pattern: 'solid',
                            //         fgColor: { argb: 'F56767' },
                            //     };
                            //     nameColumn.fill = {
                            //         type: 'pattern',
                            //         pattern: 'solid',
                            //         fgColor: { argb: 'FFFF00' },
                            //     };
                            // }
                        }
                    } else {
                        // Logic 6 : Orange
                        // If Match Case = Match, then column "Link" or "URL" should contain Value, if both are Blank, then highlight the Column "URL"
                        if ((linkColumn?.value === ("" || null)) && (urlsCell?.value === ("" || null))) {
                            if (!urlsCell?.value) {
                                headers.push('Data Value');
                                urlsCell.value = "";
                            }

                            urlsCell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'F4B084' },
                            };

                            nameColumn.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFF00' },
                            };
                        }
                    }


                    // Logic 5 : Light Blue
                    //If QA Value or QA comments has any value, then check rework status "Completed", if rework status not equalt to "Completed", then highlight "Rework Status"
                    if (((qaValueColumn?.value !== ("" || null)) || (qacommentsColumn?.value !== ("" || null))) && (reworkStatusColumn?.value !== "Completed")) {
                        if (!reworkStatusColumn?.value) {
                            headers.push('Data Value');
                            reworkStatusColumn.value = "";
                        }

                        reworkStatusColumn.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: '8EA9DB' },
                        };

                        nameColumn.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFF00' },
                        };
                    }
                });
            }
        });

        // Generate Excel file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date()
            a.href = url;
            a.download = `Pritesh Color ${date.toLocaleString()}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };


    return (
        <div className="color-pdf-page">
            <div>
                <h2>Upload Base Excel</h2>
                <ExcelFileUploader onFileUpload={handleUploadbaseFile} />
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

export default ColorExcel