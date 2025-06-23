const { BrowserWindow, app, ipcMain } = require('electron');
const path = require('path');
const ConnectionManager = require('./connection-manager');

require('@electron/remote/main').initialize();

let mainWindow;
let connectionManager = null;

console.log('Starting Electron app...');
function createWindow() {
    // Create the browser window.
    console.log('Creating mainWindow');
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            //   contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
    console.log('mainWindow created', mainWindow);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (connectionManager) {
        connectionManager.disconnect();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


// ===============================================
// IPC HANDLERS FOR SOCKET COMMUNICATION
// ===============================================

// Initialize connection
ipcMain.handle('socket-init', async (event, { ip, port }) => {
    console.log('[socket-init] Going to create new connection', connectionManager);
    try {
        if (connectionManager) {
            connectionManager.disconnect();
        }
        
        connectionManager = new ConnectionManager(ip, port);
        console.log('New connection created', connectionManager);

        // Setup event listeners to send updates to React
        connectionManager.onStatusChange = (status) => {
            mainWindow.webContents.send('socket-status-changed', status);
        };
        
        connectionManager.onMessage = (message) => {
            mainWindow.webContents.send('socket-message-received', message);
        };
        
        connectionManager.onError = (error) => {
            mainWindow.webContents.send('socket-error', error);
        };
        
        connectionManager.onLog = (log) => {
            mainWindow.webContents.send('socket-log', log);
        };
        
        connectionManager.init();
        
        return { success: true, message: 'Connection initialized' };
    } catch (error) {
        console.error('[socket-init] Cannot connect to socket', connectionManager);
        return { success: false, message: error.message };
    }
});

// Send message
ipcMain.handle('socket-send-message', async (event, { message, transCode }) => {
    try {
        if (connectionManager && connectionManager.getConnectionStatus()) {
            connectionManager.sendMessage(message, transCode);
            return { success: true };
        } else {
            return { success: false, message: 'Not connected' };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
});

// Get connection status
ipcMain.handle('socket-get-status', async () => {
    if (connectionManager) {
        return {
            isConnected: connectionManager.getIsConnected(),
            connectionStatus: connectionManager.getConnectionStatus(),
            totalErrors: connectionManager.getTotalErrors(),
            lastReceiveTime: connectionManager.getLastReceiveTime(),
            noOfScriptsMapped: connectionManager.getNoOfScriptsMapped()
        };
    }
    return {
        isConnected: false,
        connectionStatus: false,
        totalErrors: 0,
        lastReceiveTime: '',
        noOfScriptsMapped: 0,
    };
});

// Disconnect
ipcMain.handle('socket-disconnect', async () => {
    try {
        if (connectionManager) {
            connectionManager.disconnect();
            connectionManager = null;
        }
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
