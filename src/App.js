import Navbar from './components/navbar/Navbar';
import NetPosition from './components/NetPosition';
import StatusBar from './components/footer/StatusBar';

import './App.css';

function App() {
  return (
    <div className="App h-screen bg-dark-secondary flex flex-col overflow-hidden" style={{ height: '100vh', width: '100%' }}>
      <Navbar />
      <NetPosition />
      <StatusBar />
    </div>
  );
}

export default App;
