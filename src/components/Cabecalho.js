// Barra de navegação: mostra links diferentes para instituição e aluno
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LINKS = {
  instituicao: [
    { para: '/disciplinas', texto: 'Disciplinas' },
    { para: '/professores', texto: 'Professores' },
    { para: '/turmas', texto: 'Turmas' },
  ],
  aluno: [
    { para: '/ofertas', texto: 'Ofertas' },
    { para: '/minha-grade', texto: 'Minha grade' },
    { para: '/historico', texto: 'Histórico' },
  ],
};

function Cabecalho() {
  const { usuario, perfil, sair } = useAuth();
  const navigate = useNavigate();

  async function handleSair() {
    await sair();
    navigate('/login');
  }

  const links = perfil ? LINKS[perfil.tipo] || [] : [];

  return (
    <nav className="navbar navbar-dark bg-primary px-3">
      <NavLink to="/" className="navbar-brand fw-bold">Nunuu Escola de Tecnologia</NavLink>

      {usuario && (
        <div className="d-flex flex-wrap align-items-center gap-2">
          {links.map((link) => (
            <NavLink key={link.para} to={link.para} className="nav-link text-white px-2">
              {link.texto}
            </NavLink>
          ))}
          <span className="badge bg-light text-primary">
            {perfil ? `${perfil.nome} (${perfil.tipo === 'aluno' ? 'Aluno' : 'Instituição'})` : usuario.email}
          </span>
          <button className="btn btn-sm btn-outline-light" onClick={handleSair}>Sair</button>
        </div>
      )}
    </nav>
  );
}

export default Cabecalho;
