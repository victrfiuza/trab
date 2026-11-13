// Só deixa acessar a página se o usuário estiver logado (e, opcionalmente, tiver o tipo certo)
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RotaProtegida({ tipo, children }) {
  const { usuario, perfil, carregando } = useAuth();

  if (carregando) {
    return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  }
  if (!usuario) {
    return <Navigate to="/login" />;
  }
  if (tipo && perfil?.tipo !== tipo) {
    return <Navigate to="/" />;
  }
  return children;
}

export default RotaProtegida;
