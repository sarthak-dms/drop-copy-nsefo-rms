import React from 'react';
import Navbar from './components/navbar/Navbar';
import NetPosition from './components/NetPosition';
import StatusBar from './components/footer/StatusBar';

import './App.css';

function App() {
  const [baseScripts, setBaseScripts] = React.useState([]);
  
  return (
    <div className="App h-screen bg-dark-secondary flex flex-col overflow-hidden" style={{ height: '100vh', width: '100%' }}>
      <Navbar baseScripts={baseScripts} />
      <NetPosition setBaseScripts={setBaseScripts} />
      <StatusBar />
    </div>
  );
}

export default App;
