const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

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
    },

    getServerIpPort: getServerIpPort,

    getAllServerNames: getAllServerNames,

    addLogs: (message) => ipcRenderer.invoke('add-logs', message),
});

function getServerIpPort(serverName) {
    try {
        const settingsPath = path.join(__dirname, 'settings.txt');
        if (fs.existsSync(settingsPath)) {
            const content = fs.readFileSync(settingsPath, 'utf-8');

            const port = content
                .split('\n')
                .find(line => line.startsWith(`${serverName}`))
                ?.split(',')[1]
                ?.trim();

            const ip = content
                .split('\n')
                .find(line => line.startsWith('ip'))
                ?.split('=')[1]
                ?.trim();

            return { ip: ip, port: port };
        }
    } catch (err) {
        console.error('Error reading settings.txt:', err);
    }

    return null;
}
function getAllServerNames() {
    try {
        const settingsPath = path.join(__dirname, 'settings.txt');
        const serverNamesWithPorts = {};

        if (fs.existsSync(settingsPath)) {
            const content = fs.readFileSync(settingsPath, 'utf-8');

            const lines = content.split('\n');
            lines.forEach(line => {
                const [name, port] = line.split(',');
                if (name !== "server" && name && port) {
                    serverNamesWithPorts[name.trim()] = port.trim();
                }
            });
        }

        return serverNamesWithPorts;
    } catch (err) {
        console.error('Error reading settings.txt:', err);
    }

    return null;
}