// Página inicial: atalhos diferentes para cada tipo de usuário
import { Link } from 'react-router-dom';
import {
  BookOpenText,
  ChalkboardTeacher,
  UsersThree,
  ClipboardText,
  CalendarDots,
  ClockCounterClockwise,
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import AlunosImg from '../assets/estudantes.svg';
import ProfessorImg from '../assets/Webinar-cuate.svg';


const SUBTITULOS = {
  instituicao: 'Organize disciplinas, professores e a oferta de turmas do semestre.',
  aluno: 'Monte sua grade, acompanhe seus horários e registre o que você já cursou.',
};

const ATALHOS = {
  instituicao: [
    { para: '/disciplinas', titulo: 'Disciplinas', texto: 'Cadastre disciplinas e seus pré-requisitos.', Icone: BookOpenText },
    { para: '/professores', titulo: 'Professores', texto: 'Cadastre professores e a carga máxima de turmas.', Icone: ChalkboardTeacher },
    { para: '/turmas', titulo: 'Turmas', texto: 'Monte a oferta de turmas com professor e horário.', Icone: UsersThree },
  ],
  aluno: [
    { para: '/ofertas', titulo: 'Ofertas', texto: 'Veja as turmas abertas e faça sua matrícula.', Icone: ClipboardText },
    { para: '/minha-grade', titulo: 'Minha grade', texto: 'Veja seus horários e cancele matrículas.', Icone: CalendarDots },
    { para: '/historico', titulo: 'Histórico', texto: 'Informe as disciplinas que você já cursou.', Icone: ClockCounterClockwise },
  ],
};

function Inicio() {
  const { perfil } = useAuth();
  debugger

  if (!perfil) {
    return <div className="alert alert-warning">Perfil não encontrado. Saia e crie uma nova conta.</div>;
  }

  return (
    <>
      <h2 className="mb-1">Olá, {perfil.nome}!</h2>
      <p className="text-muted fs-5 mb-4">{SUBTITULOS[perfil.tipo]}</p>

      <div className="row g-4 align-items-center">
        <div className="col-lg-5 d-flex flex-column gap-3">
          {ATALHOS[perfil.tipo].map((a) => (
            <Link to={a.para} key={a.para} className="card text-decoration-none shadow-sm cartao-atalho">
              <div className="card-body d-flex gap-3 align-items-start">
                <div className="icone-atalho">
                  <a.Icone size={28} weight="duotone" />
                </div>
                <div>
                  <h5 className="card-title text-primary">{a.titulo}</h5>
                  <p className="card-text text-muted mb-0">{a.texto}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="col-lg-7 text-center">
          {perfil.tipo === "aluno" ?
            <img src={AlunosImg} alt="Estudantes" className="img-fluid ilustracao-inicio" />
            :
            <img src={ProfessorImg} alt="Professor" className="img-fluid ilustracao-inicio" />
          }
        </div>
      </div>
    </>
  );
}

export default Inicio;
