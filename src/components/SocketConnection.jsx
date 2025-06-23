import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

const SocketConnection = () => {
    const {
        connectionStatus,
        messages,
        logs,
        error,
        connect,
        sendMessage,
        disconnect,
        clearMessages,
        clearLogs,
        clearError
    } = useSocket();

    const [ip, setIp] = useState('127.0.0.1');
    const [port, setPort] = useState('8080');
    const [messageToSend, setMessageToSend] = useState('');
    const [transCode, setTransCode] = useState('1001');

    const handleConnect = async () => {
        await connect(ip, parseInt(port));
    };

    const handleDisconnect = async () => {
        await disconnect();
    };

    const handleSendMessage = async () => {
        if (messageToSend.trim()) {
            await sendMessage(messageToSend, parseInt(transCode));
            setMessageToSend('');
        }
    };

    const StatusIndicator = ({ isConnected }) => (
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
    );

    return (
        <div className="socket-connection">
            <div className="connection-panel">
                <h2>Socket Connection Manager</h2>
                
                {/* Connection Status */}
                <div className="status-section">
                    <StatusIndicator isConnected={connectionStatus.isConnected} />
                    <div className="status-details">
                        <span>Errors: {connectionStatus.totalErrors}</span>
                        <span>Last Receive: {connectionStatus.lastReceiveTime || 'N/A'}</span>
                    </div>
                </div>

                {/* Connection Form */}
                <div className="connection-form">
                    <div className="form-row">
                        <label>
                            IP Address:
                            <input
                                type="text"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                                disabled={connectionStatus.isConnected}
                            />
                        </label>
                        <label>
                            Port:
                            <input
                                type="number"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                disabled={connectionStatus.isConnected}
                            />
                        </label>
                    </div>
                    <div className="form-actions">
                        {!connectionStatus.isConnected ? (
                            <button onClick={handleConnect} className="connect-btn">
                                Connect
                            </button>
                        ) : (
                            <button onClick={handleDisconnect} className="disconnect-btn">
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>

                {/* Send Message */}
                {connectionStatus.isConnected && (
                    <div className="message-form">
                        <h3>Send Message</h3>
                        <div className="form-row">
                            <label>
                                Message:
                                <input
                                    type="text"
                                    value={messageToSend}
                                    onChange={(e) => setMessageToSend(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Enter message to send"
                                />
                            </label>
                            <label>
                                Transaction Code:
                                <input
                                    type="number"
                                    value={transCode}
                                    onChange={(e) => setTransCode(e.target.value)}
                                />
                            </label>
                        </div>
                        <button onClick={handleSendMessage} className="send-btn">
                            Send Message
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SocketConnection;
