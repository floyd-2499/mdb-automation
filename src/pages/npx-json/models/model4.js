
import React, { useState } from "react";

const Format4 = () => {
    const [jsonData, setJsonData] = useState([])

    const handleFileUpload = async (event) => {
        try {
            const file = event.target.files[0];

            if (file) {
                const txtContent = await readFileContent(file);
                const npxData = parseNpxData(txtContent);

                console.log(npxData);
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
            a.download = 'npx_data.json';
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
        const companies = txtContent.split('________________________________________________________________________________');

        const result = companies.slice(1).map((company) => {
            const lines = company.split('\n').filter(line => line.trim() !== '');

            if (lines.length === 0) {
                return null; // Skip empty companies
            }

            const companyData = {
                "Company Name": lines[0].trim(),
                "Ticker": "",
                "Security Id": "",
                "Meeting Date": "",
                "Meeting Status": "",
                "Meeting Type": "",
                "Country of Trade": "",
            };

            let captureNextLine = false;
            let currentProposal = null;
            let proposals = [];

            // Check for first line of data
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();

                if (line.startsWith("Ticker")) {
                    captureNextLine = true;
                } else if (captureNextLine) {
                    const [ticker, securityId, meetingDate, meetingStatus] = line.split("  ").filter(part => part.trim() !== "");
                    companyData["Ticker"] = ticker || "";
                    companyData["Security Id"] = securityId || "";
                    companyData["Meeting Date"] = meetingDate || "";
                    companyData["Meeting Status"] = meetingStatus || "";
                    captureNextLine = false;
                }
            }

            // 2nd line data
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith("Meeting Type")) {
                    captureNextLine = true;
                } else if (captureNextLine) {
                    const [type, country] = line.split("  ").filter(part => part.trim() !== "");
                    companyData["Meeting Type"] = type || "";
                    companyData["Country of Trade"] = country || "";
                    captureNextLine = false;
                }
            }

            // table
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith("Issue No.")) {
                    captureNextLine = true;
                } else if (captureNextLine) {
                    if (line.length < 1) {
                        captureNextLine = true;
                    } else {
                        const [issueNo, description, proponent, mgmtRec, voteCast, forAgainst] = line.split(/\s{2,}/).filter(Boolean);
                        if (issueNo) {
                            currentProposal = {
                                'Issue No.': issueNo,
                                "Description": description,
                                'Proponent': proponent || '',
                                'Mgmt Rec': mgmtRec || '',
                                'Vote Cast': voteCast || '',
                                'For/Against Mgmt': forAgainst || '',
                            };

                            if (!currentProposal['Description'] && !currentProposal['Proponent'] && !currentProposal['Mgmt Rec']) {
                                const previousProposal = proposals[proposals.length - 1];
                                if (previousProposal) {
                                    previousProposal["Description"] += ' ' + issueNo;
                                }
                            } else {
                                proposals.push(currentProposal);
                            }
                        }
                    }
                }
            }

            return {
                ...companyData,
                table: proposals
            };
        });

        // Filter out null companies (empty companies)
        const validCompanies = result.filter(companyData => companyData !== null);

        console.log('Parsed Data:', validCompanies);
        return validCompanies;
    };

    return (
        <div className="format-4">
            <h3>Format 4</h3>
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

export default Format4
