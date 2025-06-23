import { useState, useEffect, useCallback } from 'react';

export const useSocket = () => {
    const [connectionStatus, setConnectionStatus] = useState({
        isConnected: false,
        connectionStatus: false,
        totalErrors: 0,
        lastReceiveTime: '',
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
            setMessages(prev => [...prev, {
                id: Date.now(),
                ...message,
                receivedAt: new Date().toISOString()
            }]);
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