import React from 'react'
import { Badge, Divider } from 'antd';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock, Database } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

const StatusBar = () => {
    // const statusData = {
    //     isConnected: true,
    //     noOfErrs: 3,
    //     noOfScriptsMapped: 2,
    //     lastRcvdTime: '12:00:00',
    //     dbStatus: 'healthy',
    //     uptime: '99.8%'
    // };
    const {
            connectionStatus,
        } = useSocket();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-200/40 border-t border-gray-200 shadow-lg z-50">
            <div className="px-6 py-3">
                <div className="flex items-center justify-between mx-auto">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            {connectionStatus.isConnected ? (
                                <Wifi className="h-4 w-4 text-green-500" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Connected:</span>
                            <Badge
                                color={connectionStatus.isConnected ? 'green' : 'red'}
                                text={connectionStatus.isConnected ? 'True' : 'False'}
                                className="text-sm"
                            />
                        </div>

                        <Divider type="vertical" className="h-6" />

                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">Errors:</span>
                            <Badge
                                count={connectionStatus.totalErrors}
                                color={connectionStatus.totalErrors > 0 ? 'red' : 'green'}
                                className="text-sm"
                            />
                        </div>

                        <Divider type="vertical" className="h-6" />

                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">NoOfScriptsMapped:</span>
                            {/* <span className="text-sm font-semibold text-gray-900">{connectionStatus.noOfScriptsMapped.toLocaleString()}</span> */}
                        </div>

                        <Divider type="vertical" className="h-6" />

                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-700">LastRcvdTime:</span>
                            <span className="text-sm font-semibold text-gray-900">{connectionStatus.lastReceiveTime}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <Database className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">DB Status:</span>
                            <Badge
                                color="green"
                                // text={statusData.dbStatus}
                                className="text-sm capitalize"
                            />
                        </div>

                        <Divider type="vertical" className="h-6" />

                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Uptime:</span>
                            {/* <span className="text-sm font-semibold text-green-600">{statusData.uptime}</span> */}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default StatusBar;
