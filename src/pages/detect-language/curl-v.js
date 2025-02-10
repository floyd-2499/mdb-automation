import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { ExcelFileUploader } from '../validate-links';
import moment from 'moment';
import axios from 'axios';

const ExcelRequestViewer = () => {
    const [inputJson, setInputJson] = useState([]);
    const [loadSuccess, setLoadSuccess] = useState(false);
    const [metaData, setMetaData] = useState([])

    const handleUploadFile = (data) => {
        if (data?.length > 0) {
            setInputJson(data);
            setLoadSuccess(true);
        }
    };

    const fetchMetadata = async (url) => {
        try {
            // Perform a HEAD request to fetch metadata without downloading the entire resource
            const response = await axios.head(url);
            const lastModified = response.headers['last-modified'];

            // Construct metadata object
            const metadata = {
                "Last Modified Date": lastModified,
            };

            return metadata;
        } catch (error) {
            throw new Error(`Error fetching metadata for URL: ${url}`);
        }
    };


    const processData = async () => {
        const metadataArray = [];
        for (const item of inputJson) {
            try {
                // Fetch metadata for the URL of the current item
                const response = await fetchMetadata(item.URL);

                // Add retrieved metadata to the item and push it into the metadataArray
                metadataArray.push({
                    ...item,
                    ...response,
                });
            } catch (error) {
                // Handle errors during metadata retrieval
                console.error(`Error fetching metadata for URL: ${item.URL}`, error);
            }
        }

        // Update component state with the metadataArray
        setMetaData(metadataArray);
    };

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headers = Object?.keys(metaData[0]);
        worksheet.addRow(headers);

        // Add data rows
        metaData.forEach((dataRow) => {
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
            a.href = url;
            a.download = `Result.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div>
            <h1>PDF META-DATA</h1>
            <br />

            <h2>Upload Base Excel</h2>
            <ExcelFileUploader onFileUpload={handleUploadFile} />

            {loadSuccess && <button onClick={() => processData()}>Process Data</button>}
            <br />
            {metaData?.length > 0 && <button onClick={() => convertJSONToExcel()}>Export Details</button>}
        </div>
    );
};

export default ExcelRequestViewer;
