import React, { useState } from "react";
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

import styles from "./styles.module.scss"

const DynamicFormat = () => {
    const [splitHeaders, setSplitHeaders] = useState("")
    const [nonMergeColumns, setNonMergeColumns] = useState("")

    // const nonMergecellNumbers = nonMergeColumns.split(", ").map((alphabet) => {
    //     const uppercaseAlphabet = alphabet.toUpperCase();

    //     const asciiA = 'A'.charCodeAt(0);
    //     const asciiInput = uppercaseAlphabet.charCodeAt(0);
    //     const numericValue = asciiInput - asciiA;

    //     return numericValue;
    // })

    return (
        <div className={styles["dynamic-format-container"]}>
            <h2>Dynamic Formatting</h2>
            <small className={styles["important-text"]}>** Enter the required fields below</small>
            <br />
            <div className={styles["options-container"]}>
                <div className={styles["input-wrapper"]}>
                    <label>Add Split Headers <small className={styles["important-text"]}> ( Add "," and "--space--" )</small></label>
                    <input style={{ width: "500px" }} type="text" onChange={(e) => setSplitHeaders(e.target.value)} value={splitHeaders} placeholder="Number, Proposal Text, Proponent, Mgmt" />
                </div>
                <div className={styles["input-wrapper"]}>
                    <label>Non-merge/Fixed columns <small className={styles["important-text"]}> ( Add "," and "--space--" )</small></label>
                    <input style={{ width: "500px" }} type="text" onChange={(e) => setNonMergeColumns(e.target.value)} value={nonMergeColumns} placeholder="A, B, H" />
                </div>
            </div>
        </div>
    )
}

export default DynamicFormat