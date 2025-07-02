import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import { useSocket } from "../hooks/useSocket";
import { useTheme } from '../context/ThemeContext.jsx';

const NetPosition = () => {
    const gridRef = useRef(null);
    const { theme } = useTheme();
    const [rowData, setRowData] = useState([]);
    const containerStyle = useMemo(() => ({ width: "100%", height: "90%" }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const { messages, connectionStatus } = useSocket();

    const myTheme = themeQuartz.withParams({
        spacing: 5,
        rowBorder: true,
        wrapperBorder: true,
        wrapperBorderRadius: '0',

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
            enableCellChangeFlash: true
        };
    }, []);

    const [columnDefs, setColumnDefs] = useState([
        { field: "BaseScriptName", cellRenderer: "agGroupCellRenderer" },
        { field: "BaseScriptSummary" },
    ]);

    const detailCellRendererParams = useMemo(() => {
        return {
            refreshStrategy: "rows",
            detailGridOptions: {
                columnDefs: [
                    { field: "FullScriptName", minWidth: 250 },
                    { field: "InsType", minWidth: 70 },
                    { field: "Strike", minWidth: 120 },
                    { field: "OpType", minWidth: 70 },
                    { field: "Expiry", minWidth: 80 },
                    { field: "BLots", minWidth: 70 },
                    { field: "BAvg", minWidth: 100 },
                    { field: "SLots", minWidth: 70 },
                    { field: "SAvg", minWidth: 100 },
                    { field: "NLots", minWidth: 70 },
                    { field: "NAvg", minWidth: 100 },
                    { field: "CarryForwardLts", minWidth: 80 },
                    { field: "CombinedNetLts", minWidth: 80 },
                    { field: "M2M", minWidth: 100 },
                ],
                defaultColDef: {
                    flex: 1,
                    enableCellChangeFlash: true,
                },
                getRowId: (params) => {
                    return String(params.data.FullScriptName);
                },
            },

            getDetailRowData: (params) => {
                params.successCallback(params.data.childScripts);
            },
        };
    }, []);

    const getRowId = useCallback(function (params) {
        return String(params.data.BaseScriptName);
    }, []);

    const getRowStyle = (params) => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: theme === 'dark' ? '#282A2C' : '#EEF2FE' };
        }
    };

    useEffect(() => {
        const rowsToUpdate = [];
        const rowsToAdd = [];

        const newData = rowData.map(item => ({ ...item, childScripts: [...item.childScripts] }));

        messages.forEach((message) => {
            const netPosRow = message;
            console.log('Received message:', netPosRow);
            const baseScrIdx = newData.findIndex(item => item.BaseScriptName === netPosRow.BaseScriptName);

            if (baseScrIdx > -1) {
                // Update existing row
                const updatedRow = newData[baseScrIdx];

                const childIdx = updatedRow.childScripts.findIndex(child => child.FullScriptName === netPosRow.FullScriptName);
                if (childIdx > -1) {
                    updatedRow.childScripts[childIdx] = netPosRow;
                } else {
                    updatedRow.childScripts.push(netPosRow);
                }

                rowsToUpdate.push(updatedRow);
            } else {
                const newRow = {
                    BaseScriptName: netPosRow.BaseScriptName,
                    BaseScriptSummary: "All Hedged",
                    childScripts: [netPosRow]
                };
                newData.push(newRow);
                rowsToAdd.push(newRow);
                connectionStatus.noOfScriptsMapped += 1;
            }
        });

        // Update React state
        setRowData(newData);

        // Apply transactions to ag-Grid
        if (gridRef.current) {
            if (rowsToUpdate.length > 0) {
                gridRef.current.api.applyTransaction({ update: rowsToUpdate });
            }
            if (rowsToAdd.length > 0) {
                gridRef.current.api.applyTransaction({ add: rowsToAdd });
            }
        }
    }, [messages]);

    return (
        <div style={containerStyle}>
            <div style={gridStyle}>
                <AgGridReact
                    masterDetail={true}
                    detailRowAutoHeight={true}
                    ref={gridRef}
                    theme={myTheme}
                    rowData={rowData}
                    getRowId={getRowId}
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
