import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MateriaPrima from './pages/MateriaPrima';
import ScanQR from './pages/ScanQR';
import Movimentos from './pages/Movimentos';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materias-primas" element={<MateriaPrima />} />
          <Route path="/scan" element={<ScanQR />} />
          <Route path="/movimentos" element={<Movimentos />} />
        </Routes>
      </main>
    </div>
  );
}
