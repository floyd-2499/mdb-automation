
import React, { useState } from "react";

const Format5 = () => {
    const [jsonData, setJsonData] = useState([])

    const handleFileUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (file) {
                const txtContent = await readFileContent(file);
                const npxData = await parseNpxData(txtContent);
                const jsonString = JSON.stringify(npxData, null, 2);
                setJsonData(jsonString);
            }
        } catch (error) {
            console.error('Error handling file change:', error);
        }
    };

    const handleDownload = () => {
        if (jsonData) {
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'npx_data_format5.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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

    const parseNpxData = (txtContent) => {
        const lines = txtContent.split('\n');

        let result = {
            accessionNumber: '',
            submissionType: '',
            publicDocumentCount: 0,
            periodOfReport: '',
            filedAsOfDate: '',
            dateAsOfChange: '',
            effectivenessDate: '',
            filer: {
                companyData: {},
                filingValues: {},
                businessAddress: {},
                mailAddress: {},
                formerCompany: {},
            },
            seriesAndClassesContractsData: {
                existingSeriesAndClassesContracts: [],
            },
            meetingData: {
                companies: [],
            },
        };

        let currentSeries = null;
        let currentClassContract = null;
        let currentMeeting = null;
        let currentMeetingProperty = null;

        for (const line of lines) {
            const match = line.match(/<([^>]+)>(.*)<\/\1>|<([^>]+)>/);

            if (match) {
                const [, tag, value, nonClosingTag] = match;
                const cleanedTag = (tag || nonClosingTag).replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase();
                const trimmedValue = (value || '').trim();

                switch (cleanedTag) {
                    case 'accession_number':
                        result.accessionNumber = trimmedValue;
                        break;
                    case 'conformed_submission_type':
                        result.submissionType = trimmedValue;
                        break;
                    case 'public_document_count':
                        result.publicDocumentCount = parseInt(trimmedValue, 10) || 0;
                        break;
                    case 'conformed_period_of_report':
                        result.periodOfReport = trimmedValue;
                        break;
                    case 'filed_as_of_date':
                        result.filedAsOfDate = trimmedValue;
                        break;
                    case 'date_as_of_change':
                        result.dateAsOfChange = trimmedValue;
                        break;
                    case 'effectiveness_date':
                        result.effectivenessDate = trimmedValue;
                        break;
                    case 'filer':
                        currentSeries = null; // Reset series when entering a new filing
                        currentMeeting = null; // Reset meeting when entering a new filing
                        break;
                    case 'series':
                        currentSeries = {
                            ownerCik: '',
                            seriesId: '',
                            seriesName: '',
                            classContracts: [],
                        };
                        break;
                    case 'class_contract':
                        currentClassContract = {
                            classContractId: '',
                            classContractName: '',
                            classContractTickerSymbol: '',
                        };
                        break;
                    case 'b':
                        if (currentMeetingProperty) {
                            currentMeetingProperty = cleanedTag; // Store the property type
                        }
                        break;
                    case '/b':
                        currentMeetingProperty = null; // Reset meeting property when closing the <B> tag
                        break;
                    case 'td':
                        if (currentMeetingProperty) {
                            currentMeeting[currentMeetingProperty] = trimmedValue; // Store the property value
                        }
                        break;
                    default:
                        if (currentSeries) {
                            switch (cleanedTag) {
                                case 'owner_cik':
                                case 'series_id':
                                case 'series_name':
                                    currentSeries[cleanedTag] = trimmedValue;
                                    break;
                                case 'class_contract_id':
                                case 'class_contract_name':
                                case 'class_contract_ticker_symbol':
                                    currentClassContract[cleanedTag] = trimmedValue;
                                    break;
                                default:
                                    break;
                            }
                        } else if (currentMeeting) {
                            currentMeeting[cleanedTag] = trimmedValue;
                        } else if (cleanedTag in result) {
                            result[cleanedTag] = trimmedValue;
                        }
                        break;
                }
            }
        }

        if (currentSeries) {
            result.seriesAndClassesContractsData.existingSeriesAndClassesContracts.push(currentSeries);
        }

        console.log('Parsed Data:', result);
        return result;
    };

    return (
        <div className="format-5">
            <h3>Format 5</h3>
            <input type="file" accept=".txt" onChange={handleFileUpload} />

            {jsonData.length > 0 && (
                <div>
                    <h3 style={{ color: "green" }}>Json Converted Successfully</h3>
                    <button onClick={handleDownload}>Download JSON</button>
                </div>
            )}
        </div>
    )
}

export default Format5