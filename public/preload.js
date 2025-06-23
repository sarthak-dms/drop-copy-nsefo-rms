const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Socket operations
    socketInit: (ip, port) => ipcRenderer.invoke('socket-init', { ip, port }),
    socketSendMessage: (message, transCode) => ipcRenderer.invoke('socket-send-message', { message, transCode }),
    socketGetStatus: () => ipcRenderer.invoke('socket-get-status'),
    socketDisconnect: () => ipcRenderer.invoke('socket-disconnect'),
    
    // Event listeners
    onSocketStatusChanged: (callback) => {
        ipcRenderer.on('socket-status-changed', (event, status) => callback(status));
        return () => ipcRenderer.removeAllListeners('socket-status-changed');
    },
    
    onSocketMessageReceived: (callback) => {
        ipcRenderer.on('socket-message-received', (event, message) => callback(message));
        return () => ipcRenderer.removeAllListeners('socket-message-received');
    },
    
    onSocketError: (callback) => {
        ipcRenderer.on('socket-error', (event, error) => callback(error));
        return () => ipcRenderer.removeAllListeners('socket-error');
    },
    
    onSocketLog: (callback) => {
        ipcRenderer.on('socket-log', (event, log) => callback(log));
        return () => ipcRenderer.removeAllListeners('socket-log');
    }
});