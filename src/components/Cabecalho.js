// Barra de navegação: mostra links diferentes para instituição e aluno
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MenuUsuario from './MenuUsuario';

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
  const { usuario, perfil } = useAuth();

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
          <MenuUsuario />
        </div>
      )}
    </nav>
  );
}

export default Cabecalho;
