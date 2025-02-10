import React, { useState } from "react";
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as pdfjs from "pdfjs-dist"

import styles from "./styles.module.scss";
import { ExcelFileUploader } from "../validate-links";
import moment from "moment";

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js';

const MetaDataOfLinks = () => {
    const [inputJson, setInputJson] = useState([]);
    const [loadSuccess, setLoadSuccess] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [fetchSuccess, setFetchSuccess] = useState(false);
    const [metaDetails, setMetaDetails] = useState(false);
    const [validationTime, setValidationTime] = useState(null);

    const handleUploadFile = (data) => {
        if (data?.length > 0) {
            setInputJson(data);
            setLoadSuccess(true);
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

    const findDifference = (publicationDate, currentDate) => {
        const dateFormats = ["DD-MM-YYYY", "YYYY-MM-DD", "MM-DD-YYYY", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY/DD/MM"]
        const pubDate = moment(publicationDate, dateFormats, true);
        const crrDate = moment(currentDate, dateFormats, true);

        if (!pubDate.isValid() || !crrDate.isValid()) {
            return "Invalid";
        }

        const daysDifference = crrDate.diff(pubDate, 'days');

        return daysDifference;
    };

    const handleFindMetaData = async () => {
        setFetchLoading(true)
        const startTime = new Date();
        const metaDataList = await Promise.all(
            inputJson.map(async (item) => {
                const result = await fetchMetaData(item["sourceUrl"]);
                // const result = await fetchMetaData(item["URL"]);
                const dateInfo = result?.metadata?.info;

                // const publicationDate = item["publicationDate"]
                const createdDate = await dateInfo?.CreationDate ? parseDate(dateInfo?.CreationDate) : " "
                const modifiedDate = await dateInfo?.ModDate ? parseDate(dateInfo?.ModDate) : " "

                return {
                    ...item,
                    "New Created Date": dateInfo?.CreationDate ? createdDate?.fullDate : "-",
                    "New Created Year": dateInfo?.CreationDate ? createdDate?.year : "-",
                    // "Date Difference - Created Date": creDateDiff || "-",
                    "Date Difference - Created Date": "",
                    "New Modified Date": dateInfo?.ModDate ? modifiedDate?.fullDate : "-",
                    "New Modified Year": dateInfo?.ModDate ? modifiedDate?.year : "-",
                    // "Date Difference - Modified Date": modDateDiff || "-",
                    "Date Difference - Modified Date": "",
                    "Error": result?.error?.message
                }
            })
        )

        // const metaDetails = await Promise.all(
        //     inputJson.map(async (item) => {
        //         const result = await fetchMetaData(item["URL"].text);
        //         // const result = await fetchMetaData(item["URL"]);
        //         const dateInfo = result?.metadata?.info;

        //         const publicationDate = item["Publication Date"]
        //         const createdDate = await dateInfo?.CreationDate ? parseDate(dateInfo?.CreationDate) : " "
        //         const modifiedDate = await dateInfo?.ModDate ? parseDate(dateInfo?.ModDate) : " "

        //         return {
        //             "Company Name": item["Company Name"],
        //             "Investor Category (SWP)": item["Investor Category (SWP)"],
        //             "Priority": item["Priority"],
        //             "Publication Date": item["Publication Date"],
        //             "Month": item["Month"],
        //             "Year": item["Year"],
        //             "Source Sub Type Name": item["Source Sub Type Name"],
        //             "Title": item["Title"],
        //             "URL": item["URL"],
        //             "isOutdated": item["isOutdated"],
        //             "New Created Date": dateInfo?.CreationDate ? createdDate?.fullDate : "-",
        //             "New Created Year": dateInfo?.CreationDate ? createdDate?.year : "-",
        //             "Date Difference - Created Date": createdDate?.fullDate ? findDifference(publicationDate, createdDate?.fullDate) : "-",
        //             "New Modified Date": dateInfo?.ModDate ? modifiedDate?.fullDate : "-",
        //             "New Modified Year": dateInfo?.ModDate ? modifiedDate?.year : "-",
        //             "Date Difference - Modified Date": modifiedDate?.fullDate ? findDifference(publicationDate, modifiedDate?.fullDate) : "-",
        //             "Error": result?.error?.message
        //         }
        //     })
        // )

        const dateGapsDetails = metaDataList?.map((meta) => {

            return {
                ...meta,
                "Date Difference - Created Date": findDifference(meta["publicationDate"], meta['New Created Date']),
                "Date Difference - Modified Date": findDifference(meta["publicationDate"], meta['New Modified Date'])
            }
        })


        setMetaDetails(dateGapsDetails)
        const endTime = new Date();
        const totalTime = endTime - startTime; // Calculate total validation time in milliseconds
        setValidationTime((totalTime) / 60000);
        setFetchLoading(false)
        setFetchSuccess(true)
    }

    const convertJSONToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headers = Object?.keys(metaDetails[0]);
        worksheet.addRow(headers);

        // Add data rows
        metaDetails.forEach((dataRow) => {
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
            a.download = `Metadata -  ${currentDate?.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className={styles["page-contents"]}>
            <h1>PDF Meta-Data</h1>

            <h3>Upload Base Excel</h3>
            <ExcelFileUploader onFileUpload={handleUploadFile} />
            <br />
            <small style={{ color: "red" }}><i>** Column header for links should be <b>sourceUrl</b>.  Rest any columns headers are fine **</i></small>

            <br />
            <br />

            {loadSuccess && (
                <button onClick={handleFindMetaData}>
                    Find Metadata
                </button>
            )}
            <br />

            {fetchLoading && <h4 style={{ color: "red" }}>Fetching Meta-Data ...</h4>}
            {fetchSuccess && <h3 style={{ color: "green" }}>Fetching Meta-Data completed</h3>}

            <br />
            {validationTime && <h4 style={{ color: "blue" }}>Total Validation Time: {validationTime?.toFixed(2)} minutes</h4>}


            {fetchSuccess && <button onClick={convertJSONToExcel}>
                Download Excel
            </button>}
        </div>
    )
}

export default MetaDataOfLinks