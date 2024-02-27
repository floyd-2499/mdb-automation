import React, { useEffect, useState } from "react";
import axios from "axios";
import ExcelJS from 'exceljs';
import * as pdfjs from "pdfjs-dist"

import styles from "./styles.module.scss";
import { ExcelFileUploader } from "../validate-links";
import moment from "moment";

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js';

// Swathi - Please Change here
const batch_size = 200;
const URL_Header_Name = "sourceUrl"

const MetaDataAutomated = () => {
    const [batchwiseData, setBatchwiseData] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [fetchSuccess, setFetchSuccess] = useState(false);

    // Finalized
    const [metaDetails, setMetaDetails] = useState([]);
    const [errorLists, setErrorList] = useState([])
    const [validationTime, setValidationTime] = useState("");


    const handleUploadFile = (data) => {
        if (data?.length > 0) {
            const batches = Array.from({ length: Math.ceil(data.length / batch_size) }, (v, i) =>
                data.slice(i * batch_size, i * batch_size + batch_size)
            );

            setBatchwiseData(batches)
        }
    };

    const run403 = async (pdfLink) => {
        try {
            const response = await axios({
                url: pdfLink,
                method: 'GET',
                responseType: 'arraybuffer', // Change responseType to 'arraybuffer'
                headers: {
                    'User-Agent': 'Your User Agent String',
                    'Referer': 'Your Referer URL',
                    'Accept': 'application/pdf',
                    'Content-Type': 'application/pdf',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
            });

            const data = new Uint8Array(response.data);
            const pdfDocument = await pdfjs.getDocument(data).promise;
            const metadata = await pdfDocument.getMetadata();

            console.log({ pdfLink, metadata });

            return { pdfLink, metadata };
        } catch (error) {
            console.error('Error downloading file:', error);
            return { pdfLink, error };
        }
    };

    const fetchMetaData = async (pdfLink) => {
        try {
            const response = await axios.get(pdfLink, { responseType: 'arraybuffer' });
            const data = new Uint8Array(response.data);

            const pdfDocument = await pdfjs.getDocument(data).promise;
            const metadata = await pdfDocument.getMetadata();

            return { pdfLink, metadata };
        } catch (error) {
            const errStatus = error?.response?.status;

            if (errStatus === 403) {
                const response = await run403(pdfLink)
                return response
            } else {
                return { pdfLink, error };
            }
        }
    }

    const parseDate = (dateString) => {
        const formatWithTimeZone = 'YYYYMMDDHHmmssZ';
        const formatWithoutTimeZone = 'YYYYMMDDHHmmss';

        if (dateString === 'D:00000101000000Z') {
            return null;
        }

        const formattedDate = moment.utc(dateString, [formatWithTimeZone, formatWithoutTimeZone]);

        return formattedDate?.isValid() ? {
            year: formattedDate.format("YYYY"),
            fullDate: formattedDate.format("DD-MM-YYYY")
        } : null;
    };

    const findDifference = (publicationDate) => {
        const dateFormats = ["DD-MM-YYYY", "YYYY-MM-DD", "MM-DD-YYYY", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/DD/MM"]
        const date = new Date()
        const currentDate = date.toLocaleDateString()
        const pubDate = moment(publicationDate, dateFormats, true);
        const crrDate = moment(currentDate, dateFormats, true);

        if (!pubDate.isValid() || !crrDate.isValid()) {
            return "Invalid";
        }

        const daysDifference = crrDate === pubDate

        return daysDifference;
    };

    const handleFindMetaData = async (batch) => {
        setFetchLoading(true)
        const metaDataList = await Promise.all(
            batch.map(async (item) => {

                const result = await fetchMetaData(item[URL_Header_Name]);
                const dateInfo = result?.metadata?.info;
                const createdDate = await dateInfo?.CreationDate ? parseDate(dateInfo?.CreationDate) : " "
                const modifiedDate = await dateInfo?.ModDate ? parseDate(dateInfo?.ModDate) : " "

                if (result?.error?.message) {
                    setErrorList(prevErrorLists => [...prevErrorLists, item]);
                }

                return {
                    ...item,
                    "New Created Date": dateInfo?.CreationDate ? createdDate?.fullDate : "-",
                    "New Created Year": dateInfo?.CreationDate ? createdDate?.year : "-",
                    "New Modified Date": dateInfo?.ModDate ? modifiedDate?.fullDate : "-",
                    "New Modified Year": dateInfo?.ModDate ? modifiedDate?.year : "-",
                    "Updated Today": findDifference(dateInfo?.ModDate ? modifiedDate?.fullDate : createdDate?.fullDate),
                    "Error": result?.error?.message
                }
            })
        )

        const oldFetched = metaDetails;
        oldFetched.push(...metaDataList)
        setMetaDetails(oldFetched)

        setFetchLoading(false)
    }

    const convertJSONToExcel = (data, type) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headers = Object?.keys(data[0]);
        worksheet.addRow(headers);

        // Add data rows
        data.forEach((dataRow) => {
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
            a.download = `${type === "all" ? "Metadata" : "Errors"} -  ${currentDate?.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    useEffect(() => {
        const processBatches = async () => {
            if (batchwiseData?.length > 0) {
                const startTime = new Date();
                await batchwiseData.reduce(async (previousPromise, batch, index) => {
                    await previousPromise; // Wait for the previous batch to complete
                    console.log(batch);
                    await handleFindMetaData(batch);
                    console.log(`Batch ${index} Done`);
                }, Promise.resolve());
                const endTime = new Date();
                const totalTime = endTime - startTime; // Calculate total validation time in milliseconds
                setValidationTime((totalTime) / 60000);
                setFetchSuccess(true)
            }
        };

        processBatches();
    }, [batchwiseData]);

    console.log(metaDetails);

    return (
        <div className={styles["page-contents"]}>
            <h1>PDF META-DATA</h1>
            <br />

            <h2>Upload Base Excel</h2>
            <ExcelFileUploader onFileUpload={handleUploadFile} />

            <br />
            <br />

            {fetchLoading && <h4 style={{ color: "red" }}>Fetching Meta-Data ...</h4>}
            {fetchSuccess && <h3 style={{ color: "green" }}>Fetching Meta-Data completed</h3>}

            <br />
            {validationTime && <h4 style={{ color: "blue" }}>Total Validation Time: {validationTime?.toFixed(2)} minutes</h4>}

            {fetchSuccess && <div className={styles["buttons-container"]}>
                <button onClick={() => convertJSONToExcel(metaDetails, "all")}>
                    Download Excel
                </button>
                <button onClick={() => convertJSONToExcel(errorLists, "error")}>
                    Download Errors
                </button>
            </div>}
        </div>
    )
}

export default MetaDataAutomated