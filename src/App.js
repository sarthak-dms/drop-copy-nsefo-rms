import StatusBar from './components/footer/StatusBar';
import Navbar from './components/navbar/Navbar';
import NetPosition from './components/NetPosition';
import SocketConnection from './components/SocketConnection';

import './App.css';

function App() {
  return (
    <div className="App h-screen bg-gray-50 flex flex-col overflow-hidden" style={{ height: '100vh', width: '100%' }}>
      <Navbar />
      <NetPosition />
      <StatusBar />

      {/* <SocketConnection /> */}
    </div>
  );
}

export default App;
