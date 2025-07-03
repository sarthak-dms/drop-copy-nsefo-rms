import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initialize } from '@electron/remote/main/index.js';
import { fileURLToPath } from 'url';
import ConnectionManager from './connection-manager.js';
import isDev from 'electron-is-dev';

initialize();

let mainWindow;
let connectionManager = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const isDev = !app.isPackaged;

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

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        // mainWindow.loadFile(path.join(__dirname, 'index.html')); // adjust path if electron.js is in public/
        mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
    }
    mainWindow.webContents.openDevTools();
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
    console.log('app on activate');
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log('going to call createWindow');
        createWindow();
    }
});


// ===============================================
// IPC HANDLERS FOR SOCKET COMMUNICATION
// ===============================================

// Initialize connection
ipcMain.handle('socket-init', async (event, { ip, port }) => {
    // console.log('[socket-init] Going to create new connection', connectionManager);
    console.log('[socket-init] Imported connection manager class: ', ConnectionManager);
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

ipcMain.handle('add-logs', async (event, logMessage) => {
    try {
        const exeDir = path.dirname(app.getPath('exe'));

        const logsDir = path.join(exeDir, 'logs');

        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }

        const today = new Date();
        const dateFolderName = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
        const dateDir = path.join(logsDir, dateFolderName);

        if (!fs.existsSync(dateDir)) {
            fs.mkdirSync(dateDir);
        }

        const logFile = path.join(dateDir, 'logs.txt');

        const timestamp = today.toLocaleTimeString('en-GB');
        const formattedMessage = `[${timestamp}] ${logMessage}\n`;

        fs.appendFileSync(logFile, formattedMessage, 'utf8');
    } catch (error) {
        return `Error writing log: ${error.message}`;
    }
});