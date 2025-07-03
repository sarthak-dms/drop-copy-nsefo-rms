import React, { useEffect, useState } from 'react'
import { Button, Input, Select, Divider, Switch } from 'antd';
import { Search, Grid, Sun, Moon } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../context/ThemeContext.jsx';
const { Option } = Select;

const Navbar = ({ baseScripts }) => {
    const [selectedServer, setSelectedServer] = useState('');
    const [ip, setIp] = useState('127.0.0.1');
    const [port, setPort] = useState('6682');
    const [serverNamesWithPorts, setServerNamesWithPorts] = useState({});

    const { theme, toggleTheme } = useTheme();

    const {
        connectionStatus,
        connect,
        disconnect,
    } = useSocket();

    const handleConnect = async () => {
        const server = selectedServer;
        const port = serverNamesWithPorts[server];

        await connect(ip, parseInt(port));
    };

    const handleDisconnect = async () => {
        await disconnect();
    };

    const hedgeBtnClicked = () => {

    }

    const handleServerChange = (value) => {
        setSelectedServer(value);
    };

    useEffect(() => {
        const serverNamesWithPorts1 = window.electronAPI.getAllServerNames();

        setIp(serverNamesWithPorts1["ip"]);
        setServerNamesWithPorts(serverNamesWithPorts1);
    }, [])

    return (
        <nav className="bg-light-secondary shadow-sm border-gray-200 px-4 py-2 dark:bg-dark-primary">
            <div className="mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <Grid className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-300">NetPosition Grid</span>
                    </div>

                    <Switch defaultChecked={theme === "dark"} checkedChildren="Dark" unCheckedChildren="Light" size='large' onClick={toggleTheme} />
                </div>

                <div className="flex items-center space-x-4">

                    <Select className="w-36" placeholder="Select Server" onChange={handleServerChange}>
                        {Object.keys(serverNamesWithPorts).map((key) => (
                            key !== "ip" && (
                                <Option key={key} value={key}>
                                    {key}
                                </Option>
                            )
                        ))}
                    </Select>

                    {!connectionStatus.isConnected ? (
                        <Button
                            onClick={handleConnect}
                            className="flex items-center gap-2 bg-blue-500  border-blue-600 "
                        >
                            Connect
                        </Button>
                    ) : (
                        <Button
                            onClick={handleDisconnect}
                            className="flex items-center gap-2 bg-red-400 dark:bg-red-500 hover:bg-red-700 border-red-600 dark:border-red-600 hover:border-red-700"
                        >
                            Disconnect
                        </Button>
                    )}

                    <Divider type="vertical" className="h-6" />

                    <Select
                        placeholder="All Scripts"
                        className="w-56"
                    >
                        {/* <Option value="all">All Scripts</Option> */}
                        {baseScripts.map((script) => (
                            <Option key={script} value={script}>
                                {script}
                            </Option>
                        ))}
                    </Select>

                    <Button
                        type="default"
                        className="bg-green-500 dark:bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
                        onClick={hedgeBtnClicked}
                    >
                        Hedge
                    </Button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar
