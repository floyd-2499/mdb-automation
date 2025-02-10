import React, { useState } from "react";

import axios from 'axios';
import ExcelJS from 'exceljs';

import styles from './styles.module.scss'

const CustomRequestsMain = () => {

    const [responseByPage, setResponseByPage] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [failedCases, setFailedCases] = useState([])

    const firstPage = 1044;
    const lastPage = 1060;

    const fetchCompanyList = async (page) => {
        setCurrentPage(page)
        try {
            const response = await axios.get('https://www.weps.org/views/ajax', {
                params: {
                    _wrapper_format: 'drupal_ajax',
                    view_name: 'company_list',
                    view_display_id: 'block_1',
                    view_args: '',
                    view_path: '/node/23',
                    view_base_path: '',
                    view_dom_id: 'a511aebc0d553fc07b4d3715af25525a9775b608281e80cbb0c33ab5ae1873e9',
                    pager_element: 0,
                    'viewsreference[data][title]': '',
                    'viewsreference[data][pager]': '',
                    'viewsreference[data][argument]': '',
                    'viewsreference[data][offset]': '',
                    'viewsreference[data][limit]': '',
                    'viewsreference[enabled_settings][argument]': 'argument',
                    'viewsreference[enabled_settings][title]': true,
                    'viewsreference[parent_entity_type]': 'paragraph',
                    'viewsreference[parent_entity_id]': 15,
                    'viewsreference[parent_field_name]': 'bp_view',
                    page: page,
                    _drupal_ajax: 1,
                    'ajax_page_state[theme]': 'empower_women',
                    'ajax_page_state[theme_token]': '',
                    'ajax_page_state[libraries]': 'eJxlkGFuwzAIhS_EwpEsbNPEGwmWsevl9kuXro7WP-jxCZ4eeNVqtVDGrFnvXMC_SFWVmvIgLlOh-RCL4Qt-DAhhUeMNY2mZZDq7J3SSPJ5yCnaMfnFMVYsb7pW84aNA0MJ_LjGR6DzRJ33DrDoLO9pI9pqC4X8Al4TP_UGmtuXmJdnCEUzDYew6ieBFT1Z3YQPbrfKKnoyhbd11zubW4ynXBu6Ju-FvPQNewaqxCUNnf9OyjjvxjfwAhDOaTA',
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const runAPI = async () => {
        const pages = Array.from({ length: lastPage - firstPage + 1 }, (_, i) => firstPage + i);

        for (const page of pages) {
            try {
                const response = await fetchCompanyList(page);
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(response[2]?.data, 'text/html');
                const titleElements = htmlDoc.querySelectorAll('.views-field-title');
                const descriptionElements = htmlDoc.querySelectorAll('.views-field-nothing');

                const titles = Array.from(titleElements).map((element) => {
                    return element.querySelector('.field-content .showcompany').textContent;
                });

                const descriptions = Array.from(descriptionElements).map((element) => {
                    const fieldContent = element.querySelector('.field-content');


                    const timeContent = fieldContent.querySelector('time').textContent;
                    return {
                        description: fieldContent.textContent.replace(timeContent, '').trim(),
                        date: timeContent,
                    };
                });

                setResponseByPage(prev => [...prev, ...(titles.map((title, index) => ({ title, ...descriptions[index], page: page + 1 })))])
            } catch (error) {
                setResponseByPage(prev => [...prev, { page: page, error: error }])
                setFailedCases(prev => [...prev, { page: page, error: error }])
            }
        }
    };

    const convertJSONToExcel = ({ data, fileName }) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))];
        worksheet.addRow(headers);

        // Add data rows
        data.forEach((dataRow) => {
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
            a.download = `${fileName}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    return (
        <div className={styles["custom-requests-page"]}>
            <h3>Custom API requests (P1)</h3>
            <button className={styles["button-container"]} onClick={() => runAPI()}>Run API</button>
            <br />
            <br />
            {responseByPage?.length > 0 && (
                <>
                    <div>Current Page : {currentPage}</div>
                    <br />
                    <br />
                    <div>Number of rows fetched: {responseByPage?.length}</div>
                    <br />
                    <button className={styles["button-container"]} onClick={() => convertJSONToExcel({ data: responseByPage, fileName: "Companies List" })}>Download Success Data</button>
                    <button className={styles["button-container"]} onClick={() => convertJSONToExcel({ data: failedCases, fileName: "Failed Cases" })}>Download Failed Cases</button>
                </>
            )}
        </div>
    )
}

export default CustomRequestsMain