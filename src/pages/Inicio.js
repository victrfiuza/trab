// Página inicial: atalhos diferentes para cada tipo de usuário
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ATALHOS = {
  instituicao: [
    { para: '/disciplinas', titulo: 'Disciplinas', texto: 'Cadastre disciplinas e seus pré-requisitos.' },
    { para: '/professores', titulo: 'Professores', texto: 'Cadastre professores e a carga máxima de turmas.' },
    { para: '/turmas', titulo: 'Turmas', texto: 'Monte a oferta de turmas com professor e horário.' },
  ],
  aluno: [
    { para: '/ofertas', titulo: 'Ofertas', texto: 'Veja as turmas abertas e faça sua matrícula.' },
    { para: '/minha-grade', titulo: 'Minha grade', texto: 'Veja seus horários e cancele matrículas.' },
    { para: '/historico', titulo: 'Histórico', texto: 'Informe as disciplinas que você já cursou.' },
  ],
};

function Inicio() {
  const { perfil } = useAuth();

  if (!perfil) {
    return <div className="alert alert-warning">Perfil não encontrado. Saia e crie uma nova conta.</div>;
  }

  return (
    <>
      <h2 className="mb-4">Olá, {perfil.nome}!</h2>
      <div className="row g-3">
        {ATALHOS[perfil.tipo].map((a) => (
          <div className="col-md-4" key={a.para}>
            <Link to={a.para} className="card h-100 text-decoration-none shadow-sm cartao-atalho">
              <div className="card-body">
                <h5 className="card-title text-primary">{a.titulo}</h5>
                <p className="card-text text-muted">{a.texto}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

export default Inicio;
