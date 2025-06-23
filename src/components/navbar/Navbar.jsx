import React, { useState } from 'react'
import { Button, Input, Select, Divider } from 'antd';
import { Search, Grid } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
const { Option } = Select;

const Navbar = () => {
    const [serverName, setServerName] = useState('');
    const [ip, setIp] = useState('127.0.0.1');
    const [port, setPort] = useState('6682');

    const {
        connectionStatus,
        connect,
        disconnect,
    } = useSocket();

    const handleConnect = async () => {
        await connect(ip, parseInt(port));
    };
    const handleDisconnect = async () => {
        await disconnect();
    };

    return (
        <nav className="bg-gray-200/50 shadow-sm border-b border-gray-200 px-4 py-2">
            <div className="mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Grid className="h-6 w-6 text-gray-700" />
                        <span className="text-lg font-semibold text-gray-900">NetPosition Grid</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">

                    <Input
                        placeholder="Type server name..."
                        prefix={<Search className="h-4 w-4 text-gray-400" />}
                        className="w-64"
                        size="middle"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                    />
                    {!connectionStatus.isConnected ? (
                        <Button
                            type="primary"
                            onClick={handleConnect}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                        >
                            Connect
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={handleDisconnect}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                        >
                            Disconnect
                        </Button>
                    )}

                    <Divider type="vertical" className="h-6" />

                    <Select
                        defaultValue="all"
                        className="w-32"
                        size="middle"
                    >
                        <Option value="all">All Scripts</Option>
                    </Select>

                    <Button
                        type="default"
                        className="bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                    >
                        Hedge
                    </Button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar
