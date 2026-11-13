// Caso de uso: Entrar no sistema (Firebase Authentication com e-mail e senha)
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" />;

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/');
    } catch (e) {
      setErro('E-mail ou senha inválidos.');
    }
    setEnviando(false);
  }

  return (
    <div className="card mx-auto mt-5 shadow-sm" style={{ maxWidth: 420 }}>
      <div className="card-body p-4">
        <h3 className="mb-4 text-center">Entrar</h3>
        {erro && <div className="alert alert-danger">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input type="email" className="form-control" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input type="password" className="form-control" required
              value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <button className="btn btn-primary w-100" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
