import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { PDFDocument } from 'pdf-lib';

const PdfCompressor = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const compressPdf = async () => {
        if (!file) return;

        const pdfBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        // Iterate over each page in the PDF document
        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
            const page = pdfDoc.getPage(i);
            const { resources } = page;

            // Check if resources exist
            if (resources) {
                // Get the XObject resources
                const xObject = resources.get('XObject');

                // Iterate over XObject resources to find images
                if (xObject) {
                    for (const [name, object] of xObject.entries()) {
                        if (object && object.image) {
                            // Compress the image more aggressively
                            const imageBytes = await object.image.scale(0.5).toUint8Array();
                            const compressedImage = await pdfDoc.embedPng(imageBytes);
                            resources.set(name, compressedImage);
                        }
                    }
                }
            }
        }

        // Save the compressed PDF
        const compressedPdfBytes = await pdfDoc.save();
        saveAs(new Blob([compressedPdfBytes], { type: 'application/pdf' }), 'compressed.pdf');
    };

    return (
        <div>
            <h1>PDF Compressor</h1>
            <input type="file" onChange={handleFileChange} accept=".pdf" />
            <button onClick={compressPdf}>Compress PDF</button>
        </div>
    );
};

export default PdfCompressor;
