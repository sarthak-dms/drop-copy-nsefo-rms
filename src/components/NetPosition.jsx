import React, { useCallback, useMemo, useState, StrictMode } from "react";
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';

const NetPosition = () => {
    const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
    const theme = "light";

    const myTheme = themeQuartz.withParams({
        spacing: 5,
        rowBorder: true,
        wrapperBorder: true,
        wrapperBorderRadius: '0 0 8px 8px',

        foregroundColor: theme === 'dark' ? '#F5F6F6' : '#282A2C',
        backgroundColor: theme === 'dark' ? '#191B1C' : '#FFFFFF',

        headerBackgroundColor: theme === 'dark' ? '#191B1C' : '#FFFFFF',
        headerTextColor: theme === 'dark' ? '#98B1FB' : '#3c3cff',
        headerHeight: '30px',
        fontFamily: 'inter, sans-serif',
    });

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
        };
    }, []);

    const [columnDefs, setColumnDefs] = useState([
        { field: "BaseScriptName", cellRenderer: "agGroupCellRenderer" },
        { field: "ScriptSummary" },
    ]);

    const detailCellRendererParams = useMemo(() => {
        return {
            detailGridOptions: {
                columnDefs: [
                    { field: "FullScriptName" },
                    { field: "InsType" },
                    { field: "Strike" },
                    { field: "OpType" },
                    { field: "Exp" },
                    { field: "BLots" },
                    { field: "BAvg" },
                    { field: "SLots" },
                    { field: "SAvg" },
                    { field: "NLots" },
                    { field: "NAvg" },
                    { field: "CarryForwardLts" },
                    { field: "CombinedNetLts" },
                    { field: "M2M" },
                ],
                defaultColDef: {
                    flex: 1,
                },
            },
            getDetailRowData: (params) => {
                params.successCallback(params.data.childScripts);
            },
        };
    }, []);

    const [data, setData] = useState([
        {
            "BaseScriptName": "NIFTY",
            "ScriptSummary": "All Hedged",
            "childScripts": [
                {
                    "FullScriptName": "NIFTY2413270000CE",
                    "InsType": "OPTIDX",
                    "Strike": 27000,
                    "OpType": "CE",
                    "Exp": "27-JUN-2024",
                    "BLots": 2,
                    "BAvg": 120.5,
                    "SLots": 0,
                    "SAvg": 0,
                    "NLots": 2,
                    "NAvg": 120.5,
                    "CarryForwardLts": 0,
                    "CombinedNetLts": 2,
                    "M2M": 4500
                },
                {
                    "FullScriptName": "NIFTY2413270000PE",
                    "InsType": "OPTIDX",
                    "Strike": 27000,
                    "OpType": "PE",
                    "Exp": "27-JUN-2024",
                    "BLots": 0,
                    "BAvg": 0,
                    "SLots": 2,
                    "SAvg": 110.0,
                    "NLots": -2,
                    "NAvg": 110.0,
                    "CarryForwardLts": -1,
                    "CombinedNetLts": -3,
                    "M2M": -2300
                },
            ]
        },
        {
            "BaseScriptName": "BANKNIFTY",
            "ScriptSummary": "***Unhedged***",
            "childScripts": [
                {
                    "FullScriptName": "BANKNIFTY2413270000CE",
                    "InsType": "OPTIDX",
                    "Strike": 27000,
                    "OpType": "CE",
                    "Exp": "27-JUN-2024",
                    "BLots": 1,
                    "BAvg": 250.0,
                    "SLots": 0,
                    "SAvg": 0,
                    "NLots": 1,
                    "NAvg": 250.0,
                    "CarryForwardLts": 0,
                    "CombinedNetLts": 1,
                    "M2M": 1200
                },
                {
                    "FullScriptName": "BANKNIFTY2413270000PE",
                    "InsType": "OPTIDX",
                    "Strike": 27000,
                    "OpType": "PE",
                    "Exp": "27-JUN-2024",
                    "BLots": 0,
                    "BAvg": 0,
                    "SLots": 1,
                    "SAvg": 240.0,
                    "NLots": -1,
                    "NAvg": 240.0,
                    "CarryForwardLts": 0,
                    "CombinedNetLts": -1,
                    "M2M": -800
                },
            ]
        },
    ]);

    const getRowStyle = (params) => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: theme === 'dark' ? '#282A2C' : '#EEF2FE' };
        }
    };

    return (
        <div style={containerStyle}>
            <div style={gridStyle}>
                <AgGridReact
                    masterDetail={true}
                    detailRowAutoHeight={true}
                    // ref={gridRef}
                    theme={myTheme}
                    rowData={data}
                    // getRowId={getRowId}
                    getRowStyle={getRowStyle}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    detailCellRendererParams={detailCellRendererParams}
                />
            </div>
        </div>
    )
}

export default NetPosition;
