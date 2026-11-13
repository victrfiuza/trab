// Caso de uso 5 (Aluno): Ver a própria grade de horários e cancelar matrículas
// Cancelar = tirar o uid do aluno do array "alunos" da turma (arrayRemove).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ouvirColecao, indexarPorId } from '../utils/firestore';
import { descreverHorario } from '../utils/horarios';
import GradeHorarios from '../components/GradeHorarios';

function MinhaGrade() {
  const { usuario } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => ouvirColecao('turmas', 'horario', setTurmas), []);
  useEffect(() => ouvirColecao('disciplinas', 'codigo', setDisciplinas), []);
  useEffect(() => ouvirColecao('professores', 'nome', setProfessores), []);

  const disciplinaPorId = indexarPorId(disciplinas);
  const professorPorId = indexarPorId(professores);
  const minhasTurmas = turmas.filter((t) => (t.alunos || []).includes(usuario.uid));

  async function cancelar(turma) {
    setErro('');
    setMensagem('');
    const codigo = disciplinaPorId[turma.disciplinaId]?.codigo || 'esta disciplina';
    if (!window.confirm(`Cancelar a matrícula em ${codigo}?`)) return;
    try {
      await updateDoc(doc(db, 'turmas', turma.id), { alunos: arrayRemove(usuario.uid) });
      setMensagem(`Matrícula em ${codigo} cancelada.`);
    } catch (e) {
      console.error(e);
      setErro('Não foi possível cancelar a matrícula.');
    }
  }

  return (
    <>
      <h2 className="mb-4">Minha grade</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      {minhasTurmas.length === 0 ? (
        <div className="alert alert-info">
          Você ainda não está matriculado em nenhuma turma. <Link to="/ofertas">Ver ofertas</Link>
        </div>
      ) : (
        <>
          <GradeHorarios
            turmas={minhasTurmas}
            renderTurma={(t) => (
              <>
                <div className="fw-bold">{disciplinaPorId[t.disciplinaId]?.codigo || '?'}</div>
                <div>{professorPorId[t.professorId]?.nome || '?'}</div>
              </>
            )}
          />

          <h4 className="mt-5 mb-3">Matrículas ({minhasTurmas.length})</h4>
          <div className="table-responsive">
            <table className="table table-hover bg-white align-middle shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>Disciplina</th>
                  <th>Professor</th>
                  <th>Horário</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {minhasTurmas.map((t) => {
                  const disciplina = disciplinaPorId[t.disciplinaId];
                  return (
                    <tr key={t.id}>
                      <td>
                        <span className="fw-bold">{disciplina?.codigo || '?'}</span>
                        <span className="text-muted"> - {disciplina?.nome}</span>
                      </td>
                      <td>{professorPorId[t.professorId]?.nome || '?'}</td>
                      <td>
                        <span className="badge bg-primary me-1">{t.horario}</span>
                        <span className="small text-muted">{descreverHorario(t.horario)}</span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => cancelar(t)}>
                          Cancelar matrícula
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export default MinhaGrade;
