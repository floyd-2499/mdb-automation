import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from './styles.module.scss';

const ZingChart = dynamic(() => import('zingchart-react'), { ssr: false });

const Charts = () => {
    const gaugeChartData = {
        type: "gauge",
        "scale-r": {
            aperture: 180,
            values: "0:100:25",
            labels: ["0%", "25%", "50%", "75%", "100%"],
            center: {
                size: 5,
                "background-color": "#FFFFFF",
                "border-color": "none"
            },
            item: {
                'font-color': "#999999",
                'font-size': 14,
                'offset-r': 0,
                angle: "auto"
            },
            ring: {
                size: 40,
                rules: [{
                    rule: "%v >= 0 && %v <= 25",
                    "background-color": "#FF8A7A"
                },
                {
                    rule: "%v >= 25 && %v <= 75",
                    "background-color": "#FFDC79"
                },
                {
                    rule: "%v >= 75 && %v <= 100",
                    "background-color": "#61A59E"
                }
                ]
            }
        },
        plot: {
            csize: "10%",
            size: "75%",
            "background-color": "#999999",
            valueBox: {
                text: '%v',
                fontSize: '0px',
            },
        },
        series: [{
            values: [75]
        }],
    };

    const barChartData = {
        type: "hbar",
        series: [{
            values: [20, 40, 25, 50]
        }],
        plot: {
            rules: [
                {
                    rule: '%v == 20',
                    backgroundColor: '#FFDE80' // Background color for the value 20
                },
                {
                    rule: '%v == 40',
                    backgroundColor: '#898F9E' // Background color for the value 40
                },
                {
                    rule: '%v == 25',
                    backgroundColor: '#FF9081' // Background color for the value 25
                },
                {
                    rule: '%v == 50',
                    backgroundColor: '#69AAA3' // Background color for the value 50
                }
            ]
        }
    };

    return (
        <div className={styles['charts-page']}>
            <div className={styles['chart-card']}>
                <ZingChart data={gaugeChartData} />
            </div>
            <div className={styles['chart-card']}>
                <ZingChart data={barChartData} />
            </div>
        </div>
    )
}

export default Charts;
