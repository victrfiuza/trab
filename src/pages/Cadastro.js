// Caso de uso: Criar conta (aluno ou instituição)
// Cria o usuário no Firebase Auth e salva o perfil na coleção "usuarios" do Firestore
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

function Cadastro() {
  const { recarregarPerfil } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', tipo: 'aluno' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Um único handler para todos os campos, usando o atributo "name"
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setEnviando(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.senha);
      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        nome: form.nome,
        email: form.email,
        tipo: form.tipo,
        concluidas: [], // ids das disciplinas já cursadas (usado nos pré-requisitos)
      });
      await recarregarPerfil();
      navigate('/');
    } catch (e) {
      setErro(e.code === 'auth/email-already-in-use'
        ? 'Este e-mail já está cadastrado.'
        : 'Não foi possível criar a conta.');
      setEnviando(false);
    }
  }

  return (
    <div className="card mx-auto mt-5 shadow-sm" style={{ maxWidth: 420 }}>
      <div className="card-body p-4">
        <h3 className="mb-4 text-center">Criar conta</h3>
        {erro && <div className="alert alert-danger">{erro}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input name="nome" className="form-control" required
              value={form.nome} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input name="email" type="email" className="form-control" required
              value={form.email} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input name="senha" type="password" className="form-control" required
              value={form.senha} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Perfil</label>
            <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
              <option value="aluno">Aluno</option>
              <option value="instituicao">Instituição (secretaria)</option>
            </select>
          </div>
          <button className="btn btn-primary w-100" disabled={enviando}>
            {enviando ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        <p className="text-center mt-3 mb-0">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;
