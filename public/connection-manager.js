import net from 'net';
import { tCodes } from './CommTCodes.js';

class ConnectionManager {
    constructor(ip, port) {
        this.ip = ip;
        this.port = port;
        this.isConnected = false;
        this.isRcvThreadWorking = false;
        this.connectionStatus = false;
        this.clientSocket = null;
        this.totalNoOfErrs = 0;
        this.lastRcvTime = '00:00:00';
        this.noOfScriptsMapped = 0;
        this.sendLoopInterval = null;
        
        // Event callbacks for Electron
        this.onStatusChange = null;
        this.onMessage = null;
        this.onError = null;
        this.onLog = null;
    }

    init() {
        try {
            this.isConnected = false;
            this.isRcvThreadWorking = false;
            this.createConnection();
        } catch (ex) {
            this.addLogs("Exception Occurred in Init: " + ex.toString());
        }
    }

    createConnection() {
        try {
            if (!this.isConnected) {
                this.clientSocket = new net.Socket();
                this.clientSocket.setNoDelay(true);

                this.clientSocket.connect(this.port, this.ip, () => {
                    this.isConnected = true;
                    this.connectionStatus = true;
                    
                    this.addLogs('Connected to server');
                    this.notifyStatusChange();

                    // Start ping loop
                    this.sendLoopInterval = setInterval(() => {
                        if (this.isConnected) {
                            const now = new Date();
                            const timeString = now.toTimeString().split(' ')[0];
                            this.sendMessage(`Ping at ${timeString}`, tCodes.SEND_LIVE_DATA);
                        }
                    }, 2000);

                    if (!this.isRcvThreadWorking) {
                        this.receiveMessage();
                    }
                });

                this.clientSocket.on('error', (error) => {
                    this.isConnected = false;
                    this.connectionStatus = false;
                    this.clientSocket = null;
                    this.addLogs("[CreateConnection] Exception: " + error.toString());
                    this.notifyError(error.toString());
                    this.notifyStatusChange();
                });

                this.clientSocket.on('close', () => {
                    this.isConnected = false;
                    this.connectionStatus = false;
                    this.isRcvThreadWorking = false;
                    if (this.sendLoopInterval) {
                        clearInterval(this.sendLoopInterval);
                        this.sendLoopInterval = null;
                    }
                    this.addLogs("Connection closed");
                    this.notifyStatusChange();
                });
            }
        } catch (ex) {
            this.isConnected = false;
            this.clientSocket = null;
            this.addLogs("[CreateConnection] Exception: " + ex.toString());
            this.notifyError(ex.toString());
        }
    }

    sendMessage(message, transCode) {
        try {
            if (this.connectionStatus && this.clientSocket && !this.clientSocket.destroyed) {
                const msgBytes = Buffer.from(message, 'utf8');
                const pktLen = msgBytes.length + 2;
                const sendBuffer = Buffer.alloc(pktLen + 2);

                sendBuffer.writeInt16BE(pktLen, 0);
                sendBuffer.writeInt16BE(transCode, 2);
                msgBytes.copy(sendBuffer, 4);

                this.addLogs(`Sending message: ${message}`);
                this.clientSocket.write(sendBuffer);
            }
        } catch (ex) {
            this.totalNoOfErrs += 1;
            this.isConnected = false;
            this.connectionStatus = false;
            this.addLogs("Connection Broke");
            this.addLogs("[SendMessage] Exception: " + ex.toString());
            this.notifyError(ex.toString());
            this.notifyStatusChange();
        }
    }

    receiveMessage() {
        try {
            this.isRcvThreadWorking = true;
            let readBuffer = Buffer.alloc(1024 * 15);
            let truncLen = 0;

            this.clientSocket.on('data', (data) => {
                try {
                    readBuffer.fill(0, truncLen);
                    data.copy(readBuffer, truncLen);
                    
                    const bytesRead = data.length;
                    if (bytesRead === 0 || !this.connectionStatus) {
                        return;
                    }

                    const totalBytes = bytesRead + truncLen;
                    let tmpIdx = 0;
                    truncLen = 0;

                    while (tmpIdx < totalBytes) {
                        if (tmpIdx + 2 > totalBytes) {
                            truncLen = totalBytes - tmpIdx;
                            readBuffer.copy(readBuffer, 0, tmpIdx, tmpIdx + truncLen);
                            break;
                        }

                        const pktLen = readBuffer.readInt16BE(tmpIdx);

                        if (pktLen <= 0 || pktLen > 65535) {
                            break;
                        }

                        if (tmpIdx + 2 + pktLen > totalBytes) {
                            truncLen = totalBytes - tmpIdx;
                            readBuffer.copy(readBuffer, 0, tmpIdx, tmpIdx + truncLen);
                            break;
                        }

                        const packetData = Buffer.alloc(pktLen);
                        readBuffer.copy(packetData, 0, tmpIdx + 2, tmpIdx + 2 + pktLen);

                        this.processPacket(packetData, pktLen);
                        tmpIdx += 2 + pktLen;
                    }
                } catch (ex) {
                    this.totalNoOfErrs += 1;
                    this.addLogs("[ReceiveMessage Data] Exception: " + ex.toString());
                    this.notifyError(ex.toString());
                    this.notifyStatusChange();
                }
            });

            this.clientSocket.on('end', () => {
                this.isRcvThreadWorking = false;
                this.isConnected = false;
                this.connectionStatus = false;
                this.addLogs("ReceiveMessage thread stopped");
                this.notifyStatusChange();
            });

        } catch (ex) {
            this.isRcvThreadWorking = false;
            this.isConnected = false;
            this.connectionStatus = false;
            this.totalNoOfErrs += 1;
            this.addLogs("[ReceiveMessage] Exception: " + ex.toString());
            this.notifyError(ex.toString());
            this.notifyStatusChange();
        }
    }

    processPacket(pkt, pktlen) {
        try {
            if (pktlen < 4) return;

            const now = new Date();
            this.lastRcvTime = now.toTimeString().split(' ')[0];
            this.notifyStatusChange();

            const tcode = pkt.readInt16BE(2);
            // const newPkt = pkt.toString('utf8', 4, pktlen);
            const newPkt = pkt.slice(2).toString('utf8');

            // Notify React about received message
            this.notifyMessage({
                transactionCode: tcode,
                message: newPkt,
                timestamp: this.lastRcvTime
            });

        } catch (ex) {
            this.totalNoOfErrs += 1;
            this.addLogs("[ProcessPacket] Exception: " + ex.toString());
            this.notifyError(ex.toString());
            this.notifyStatusChange();
        }
    }

    // Notification methods for Electron
    notifyStatusChange() {
        if (this.onStatusChange) {
            this.onStatusChange({
                isConnected: this.isConnected,
                connectionStatus: this.connectionStatus,
                totalErrors: this.totalNoOfErrs,
                lastReceiveTime: this.lastRcvTime,
                noOfScriptsMapped: this.noOfScriptsMapped
            });
        }
    }

    notifyMessage(messageData) {
        if (this.onMessage) {
            this.onMessage(messageData);
        }
    }

    notifyError(error) {
        if (this.onError) {
            this.onError(error);
        }
    }

    addLogs(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        if (this.onLog) {
            this.onLog(logMessage);
        }
    }

    disconnect() {
        try {
            this.isConnected = false;
            this.connectionStatus = false;
            
            if (this.sendLoopInterval) {
                clearInterval(this.sendLoopInterval);
                this.sendLoopInterval = null;
            }
            
            if (this.clientSocket && !this.clientSocket.destroyed) {
                this.clientSocket.end();
            }
            
            this.addLogs("Connection disconnected gracefully");
            this.notifyStatusChange();
        } catch (ex) {
            this.addLogs("[Disconnect] Exception: " + ex.toString());
            this.notifyError(ex.toString());
        }
    }

    // Getters
    getConnectionStatus() { return this.connectionStatus; }
    getIsConnected() { return this.isConnected; }
    getTotalErrors() { return this.totalNoOfErrs; }
    getLastReceiveTime() { return this.lastRcvTime; }
    getNoOfScriptsMapped() { return this.noOfScriptsMapped; }
}

export default ConnectionManager;