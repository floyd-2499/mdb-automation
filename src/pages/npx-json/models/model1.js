
import React, { useState } from "react";

const Format1 = () => {
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

    // const parseNpxData = (txtContent) => {
    //     const sections = txtContent.split('--------------------------------------------------------------------------------');

    //     const companiesData = sections.map((section) => {
    //         const lines = section.split('\n').filter((line) => line.trim() !== '');

    //         if (lines.length === 0) {
    //             return null; // Skip empty sections
    //         }

    //         let companyData = {};
    //         let isProposalTable = false;
    //         let currentProposal = null;
    //         let proposals = [];

    //         lines.forEach((line, index) => {
    //             try {
    //                 if (!isProposalTable) {
    //                     const match = line.match(/(Ticker|Security ID|Meeting Date|Meeting Type|Record Date):(.+)/);
    //                     if (match) {
    //                         const [, key, value] = match;
    //                         if (key.trim() === 'Ticker') {
    //                             const [ticker, name, securityId] = value.split(/\s{2,}/).filter(Boolean); // Filter out empty values
    //                             companyData['Ticker'] = ticker?.trim() || '';
    //                             companyData["Security Id"] = securityId.trim()
    //                         } else if (key.trim() === 'Meeting Date') {
    //                             const [meetingDate, meetingType] = value.split(/\s{2,}/).filter(Boolean); // Filter out empty values
    //                             companyData['Meeting Date'] = meetingDate?.trim() || '';
    //                             companyData["Meeting Type"] = meetingType?.split(": ")[1]
    //                         } else {
    //                             companyData[key.trim()] = value.trim();
    //                         }
    //                     } else if (line.startsWith('#')) {
    //                         isProposalTable = true;
    //                     } else {
    //                         companyData['Company Name'] = line.trim();
    //                     }
    //                 } else {
    //                     const [id, proposal, mgtRec, voteCast] = line.split(/\s{2,}/).filter(Boolean); // Filter out empty values
    //                     if (id && proposal) {
    //                         const lastWord = line?.split(' ').pop() || '';
    //                         currentProposal = {
    //                             '#': id.trim(),
    //                             proposal: proposal.trim(),
    //                             'Mgt Rec': mgtRec?.trim() || '',
    //                             'Vote Cast': voteCast?.replace(lastWord, '')?.trim() || '',
    //                             Sponsor: lastWord,
    //                         };

    //                         if (!currentProposal['#']) {
    //                             // If # is missing, consider it as a continuation of the previous proposal
    //                             const previousProposal = proposals[proposals.length - 1];
    //                             if (previousProposal) {
    //                                 previousProposal.proposal += ' ' + currentProposal.proposal;
    //                             }
    //                         } else {
    //                             proposals.push(currentProposal);
    //                         }
    //                     }
    //                 }
    //             } catch (error) {
    //                 console.error(`Error on line ${index + 1}:`, error);
    //             }
    //         });

    //         // If "Statutory Reports" is missing in the first proposal, add it
    //         if (proposals.length > 0 && proposals[0].proposal.indexOf('Statutory Reports') === -1) {
    //             proposals[0].proposal += ' Statutory Reports';
    //         }

    //         return {
    //             ...companyData,
    //             proposals,
    //         };
    //     });

    //     // Filter out null sections (empty sections)
    //     const validSections = companiesData.filter((companyData) => companyData !== null);

    //     console.log('Parsed Data:', validSections);
    //     return validSections;
    // };

    const parseNpxData = (txtContent) => {
        const sections = txtContent.split('--------------------------------------------------------------------------------');

        const companiesData = sections.map((section) => {
            const lines = section.split('\n').filter((line) => line.trim() !== '');

            if (lines.length === 0) {
                return null; // Skip empty sections
            }

            let companyData = {};
            let isProposalTable = false;
            let currentProposal = null;
            let proposals = [];

            lines.forEach((line, index) => {
                try {
                    if (!isProposalTable) {
                        const match = line.match(/(Ticker|Security ID|Meeting Date|Meeting Type|Record Date):(.+)/);
                        if (match) {
                            const [, key, value] = match;
                            if (key.trim() === 'Ticker') {
                                const [ticker, name, securityId] = value.split(/\s{2,}/).filter(Boolean); // Filter out empty values
                                companyData['Ticker'] = ticker?.trim() || '';
                                companyData['Security Id'] = securityId?.trim() || ''; // Fix: Assign to 'Security Id'
                            } else if (key.trim() === 'Meeting Date') {
                                const [meetingDate, meetingType] = value.split(/\s{2,}/).filter(Boolean);
                                companyData['Meeting Date'] = meetingDate?.trim() || '';
                                companyData['Meeting Type'] = meetingType?.split(": ")[1]?.trim() || ''; // Fix: Assign to 'Meeting Type'
                            } else {
                                companyData[key.trim()] = value.trim();
                            }
                        } else if (line.startsWith('#')) {
                            isProposalTable = true;
                        } else {
                            companyData['Company Name'] = line.trim();
                        }
                    } else {
                        const [id, proposal, mgtRec, voteCast] = line.split(/\s{2,}/).filter(Boolean);
                        if (id && proposal) {
                            const lastWord = line?.split(' ').pop() || '';
                            currentProposal = {
                                '#': id.trim(),
                                proposal: proposal.trim(),
                                'Mgt Rec': mgtRec?.trim() || '',
                                'Vote Cast': voteCast?.replace(lastWord, '')?.trim() || '',
                                Sponsor: lastWord,
                            };

                            if (!currentProposal['#']) {
                                const previousProposal = proposals[proposals.length - 1];
                                if (previousProposal) {
                                    previousProposal.proposal += ' ' + currentProposal.proposal;
                                }
                            } else {
                                proposals.push(currentProposal);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error on line ${index + 1}:`, error);
                }
            });

            if (proposals.length > 0 && proposals[0].proposal.indexOf('Statutory Reports') === -1) {
                proposals[0].proposal += ' Statutory Reports';
            }

            return {
                ...companyData,
                proposals,
            };
        });

        const validSections = companiesData.filter((companyData) => companyData !== null);
        return validSections;
    };

    return (
        <div className="format-1">
            <h3>Format 1</h3>
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

export default Format1