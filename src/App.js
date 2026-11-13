// Componente principal: cabeçalho + rotas (páginas) do sistema
import { Routes, Route, Navigate } from 'react-router-dom';
import Cabecalho from './components/Cabecalho';
import ErrorBoundary from './components/ErrorBoundary';
import RotaProtegida from './components/RotaProtegida';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Inicio from './pages/Inicio';

function App() {
  return (
    <>
      <Cabecalho />
      <main className="container py-4">
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/" element={<RotaProtegida><Inicio /></RotaProtegida>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </>
  );
}

export default App;
