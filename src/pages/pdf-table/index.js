// import React, { useState } from "react";
// import formidable from 'formidable';
// // import { PdfReader } from "pdfreader";

// const PDFTable = () => {
//     const [jsonData, setJsonData] = useState(null);

//     const handleFileUpload = async (event) => {
//         const form = new formidable.IncomingForm();

//         form.parse(event.target.files[0], async (err, fields, files) => {
//             if (err) {
//                 console.error('Error parsing file:', err);
//                 return;
//             }

//             const filePath = files.file.path;
//             const pdfreader = [];
//             const rows = [];
//             let currentRow = [];

//             const processRows = () => {
//                 const processedData = rows.map(row => {
//                     // Custom logic to parse each row and convert to JSON
//                     return { data: row };
//                 });

//                 setJsonData(processedData);
//             };

//             const pdfReader = new pdfreader.PdfReader();

//             pdfReader.on('data', function (chunk) {
//                 if (!chunk) {
//                     // End of page or document
//                     processRows();
//                     rows.length = 0; // Clear rows for the next page
//                 } else {
//                     currentRow.push(chunk.text);
//                 }
//             });

//             pdfReader.on('end', function () {
//                 // End of document
//                 processRows();
//             });

//             pdfReader.parseFile(filePath);
//         });
//     };

//     return (
//         <div>
//             <h1>PDF Table Extraction</h1>
//             <input type="file" accept=".pdf" onChange={handleFileUpload} />

//             {jsonData && (
//                 <div>
//                     <h2>JSON Data:</h2>
//                     <pre>{JSON.stringify(jsonData, null, 2)}</pre>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default PDFTable;

