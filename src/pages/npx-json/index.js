import React, { useState } from "react";
import Format1 from "./models/model1";
import Format5 from "./models/model5";
import styles from "./styles.module.scss"
import Format4 from "./models/model4";

const formatOptions = [
    { key: 1, name: "Format 1", body: <Format1 /> },
    { key: 4, name: "Format 4", body: <Format4 /> },
    { key: 5, name: "Format 5", body: <Format5 /> },
]

const NpxToJson = () => {
    const [format, setFormat] = useState(formatOptions[1])

    return (
        <div className="npx-json-page">
            <h2>Convert NPX(txt) to JSON</h2>
            <div className={styles['format-options-container']}>
                {formatOptions.map((formatDetail) => (
                    <h4
                        key={formatDetail.key}
                        className={`${styles["form-options"]} ${format?.name === formatDetail.name ? styles["active-format"] : ""}`}
                        onClick={() => setFormat(formatDetail)}
                    >
                        {formatDetail.name}
                    </h4>
                ))}
            </div>
            <br />
            {format?.body || ""}
        </div>

    )
}

export default NpxToJson