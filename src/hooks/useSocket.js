import { useState, useEffect, useCallback } from 'react';

export const useSocket = () => {
    const [connectionStatus, setConnectionStatus] = useState({
        isConnected: false,
        connectionStatus: false,
        totalErrors: 0,
        lastReceiveTime: '00:00:00',
        noOfScriptsMapped: 0
    });
    const [messages, setMessages] = useState([]);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Set up event listeners
        const unsubscribeStatus = window.electronAPI.onSocketStatusChanged((status) => {
            setConnectionStatus(status);
        });

        const unsubscribeMessage = window.electronAPI.onSocketMessageReceived((message) => {
            const objNposPkt = createNetPosData(message);

            const fullScr = objNposPkt.FullScriptName;

            const exp = new Date(1970, 0, 1, 12, 0, 0);
            exp.setSeconds(exp.getSeconds() + objNposPkt.Expiry);
            const formattedExp = exp.toLocaleDateString('en-GB').replace(/[/]/g, '');
            objNposPkt.Expiry = formattedExp;

            if (fullScr.endsWith("CE") || fullScr.endsWith("PE")) {
                objNposPkt.OpType = fullScr.slice(-2);
            } else {
                objNposPkt.OpType = "XX";
            }

            if (objNposPkt.OpType !== "XX") {
                const withoutSuffix = fullScr.slice(0, -2); // remove "CE"/"PE" suffix
                let strikePrice = 0;

                // Try YYMDD pattern first
                let pattern = /([A-Z]+)(\d{2})([1-9OND])(\d{2})(\d+)$/i;
                let match = withoutSuffix.match(pattern);

                if (match) {
                    strikePrice = parseFloat(match[5]);
                } else {
                    // Try Month name pattern
                    pattern = /([A-Z]+)(\d{2})([A-Z]{3})(\d+(?:\.\d+)?)$/i;
                    match = withoutSuffix.match(pattern);

                    if (match) {
                        strikePrice = parseFloat(match[4]);
                    }
                }

                objNposPkt.Strike = strikePrice;
            }

            objNposPkt.BaseScriptName = objNposPkt.BaseScriptName + "-" + objNposPkt.Expiry


            setMessages(prevMessages => {
                let index = -1;
                index = prevMessages.findIndex(m =>
                    m.FullScriptName === objNposPkt.FullScriptName
                );

                if (index === -1) {
                    // Add new entry
                    return [...prevMessages, objNposPkt];
                } else {
                    // Replace existing entry (immutably)
                    const updatedMessages = [...prevMessages];
                    const existing = updatedMessages[index];

                    const originalBLots = parseInt(existing.BLots);
                    const originalSLots = parseInt(existing.SLots);
                    const originalNLots = parseInt(existing.NLots);
                    const originalBAvg = parseFloat(existing.BAvg);
                    const originalSAvg = parseFloat(existing.SAvg);
                    const originalNAvg = parseFloat(existing.NAvg);
                    
                    const newBLots = parseInt(objNposPkt.BLots);
                    const newSLots = parseInt(objNposPkt.SLots);
                    const newNLots = parseInt(objNposPkt.NLots);
                    const newBAvg = parseFloat(objNposPkt.BAvg);
                    const newSAvg = parseFloat(objNposPkt.SAvg);
                    const newNAvg = parseFloat(objNposPkt.NAvg);

                    // Calculate new values
                    const totalBLots = originalBLots + newBLots;
                    const totalSLots = originalSLots + newSLots;
                    const totalNLots = originalNLots + newNLots;

                    updatedMessages[index] = {
                        ...existing,
                        BLots: totalBLots,
                        BAvg: totalBLots > 0 ? parseFloat((originalBAvg * originalBLots) + (newBAvg * newBLots)) / totalBLots : 0,
                        SLots: totalSLots,
                        SAvg: totalSLots > 0 ? parseFloat((originalSAvg * originalSLots) + (newSAvg * newSLots)) / totalSLots : 0,
                        NLots: totalNLots,
                        NAvg: totalNLots > 0 ? parseFloat((originalNAvg * originalNLots) + (newNAvg * newNLots)) / totalNLots : 0,
                        // Add any other fields from objNposPkt that should be updated (not calculated)
                        // LastUpdateTime: objNposPkt.LastUpdateTime, // example
                    };
                    return updatedMessages;
                }
            });
        });

        const unsubscribeError = window.electronAPI.onSocketError((error) => {
            setError(error);
        });

        const unsubscribeLog = window.electronAPI.onSocketLog((log) => {
            setLogs(prev => [...prev, {
                id: Date.now(),
                message: log,
                timestamp: new Date().toISOString()
            }]);
        });

        return () => {
            unsubscribeStatus();
            unsubscribeMessage();
            unsubscribeError();
            unsubscribeLog();
        };
    }, []);

    const connect = useCallback(async (ip, port) => {
        try {
            console.log('Going to call socketInit with:', ip, port);
            const result = await window.electronAPI.socketInit(ip, port);

            if (!result.success) {
                setError(result.message);
                console.error('Failed to connect to socket', result.message);
            } else {
                console.log('Connected to socket', result);
                setError(null);
            }
            return result;
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        }
    }, []);

    const sendMessage = useCallback(async (message, transCode = 1001) => {
        try {
            const result = await window.electronAPI.socketSendMessage(message, transCode);
            if (!result.success) {
                setError(result.message);
            }
            return result;
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        }
    }, []);

    const disconnect = useCallback(async () => {
        try {
            const result = await window.electronAPI.socketDisconnect();
            if (result.success) {
                setMessages([]);
                setLogs([]);
                setError(null);
            }
            return result;
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        }
    }, []);

    const getStatus = useCallback(async () => {
        try {
            const status = await window.electronAPI.socketGetStatus();
            setConnectionStatus(status);
            return status;
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, []);

    const createNetPosData = (message) => {
        const data = message.message;
        // console.log('Received message:', data);

        const fields = data.split('|');
        const dict = {};

        fields.forEach((field, index) => {
            const [key, val] = field.split(':');
            dict[key] = val.trim();
        });

        const netPositionRow = {
            BaseScriptName: dict["BASESCRIPTNAME"],
            FullScriptName: dict["FULLSCNAME"],
            InsType: dict["InsType"],
            Strike: dict["STRIKE"],
            OpType: dict['OPTYPE'],
            Expiry: dict['EXPIRY'],
            BLots: dict["BQTY"],
            BAvg: dict["BPRICE"],
            SLots: dict["SQTY"],
            SAvg: dict["SPRICE"],
            NLots: dict["NQTY"],
            NAvg: dict["NAVG"],
            CarryForwardLts: dict["CFQTY"],
            CombinedNetLts: dict["CNQTY"],
            M2M: dict["M2M"],
            LotSize: dict["LOTSIZE"],
            Token: dict["TOKEN"]
        };

        return netPositionRow;
    }

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        connectionStatus,
        messages,
        logs,
        error,
        connect,
        sendMessage,
        disconnect,
        getStatus,
        clearMessages,
        clearLogs,
        clearError
    };
};