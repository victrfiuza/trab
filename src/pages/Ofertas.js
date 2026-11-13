// Caso de uso 4 (Aluno): Ver as turmas ofertadas e se matricular
// A matrícula é o uid do aluno dentro do array "alunos" da turma.
// Regras: ter vaga, não ter conflito de horário, ter cumprido os pré-requisitos,
// não estar matriculado em outra turma da mesma disciplina e não ter concluído a disciplina.
import { useEffect, useState } from 'react';
import { arrayUnion, doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ouvirColecao, indexarPorId } from '../utils/firestore';
import { descreverHorario } from '../utils/horarios';

function Ofertas() {
  const { usuario, perfil } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [busca, setBusca] = useState('');
  const [soDisponiveis, setSoDisponiveis] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => ouvirColecao('turmas', 'horario', setTurmas), []);
  useEffect(() => ouvirColecao('disciplinas', 'codigo', setDisciplinas), []);
  useEffect(() => ouvirColecao('professores', 'nome', setProfessores), []);

  const disciplinaPorId = indexarPorId(disciplinas);
  const professorPorId = indexarPorId(professores);
  const concluidas = perfil?.concluidas || [];
  const minhasTurmas = turmas.filter((t) => (t.alunos || []).includes(usuario.uid));

  // Retorna o motivo que impede a matrícula, ou '' se o aluno pode se matricular
  function motivoBloqueio(turma) {
    const disciplina = disciplinaPorId[turma.disciplinaId];
    if ((turma.alunos || []).includes(usuario.uid)) return 'Você já está nesta turma.';
    if (concluidas.includes(turma.disciplinaId)) return 'Você já concluiu esta disciplina.';
    if (minhasTurmas.some((t) => t.disciplinaId === turma.disciplinaId)) {
      return 'Você já está em outra turma desta disciplina.';
    }
    const conflito = minhasTurmas.find((t) => t.horario === turma.horario);
    if (conflito) {
      return `Conflito de horário com ${disciplinaPorId[conflito.disciplinaId]?.codigo || 'outra turma'}.`;
    }
    const faltando = (disciplina?.prerequisitos || []).filter((pre) => !concluidas.includes(pre));
    if (faltando.length > 0) {
      const codigos = faltando.map((id) => disciplinaPorId[id]?.codigo || '?').join(', ');
      return `Falta cursar: ${codigos}.`;
    }
    if ((turma.alunos || []).length >= turma.vagas) return 'Turma lotada.';
    return '';
  }

  async function matricular(turma) {
    setErro('');
    setMensagem('');
    const motivo = motivoBloqueio(turma);
    if (motivo) {
      setErro(motivo);
      return;
    }
    const codigo = disciplinaPorId[turma.disciplinaId]?.codigo;
    try {
      // A transação lê a turma de novo no servidor e só grava se ainda houver vaga.
      // Assim, dois alunos não conseguem ocupar a última vaga ao mesmo tempo.
      await runTransaction(db, async (transacao) => {
        const ref = doc(db, 'turmas', turma.id);
        const snap = await transacao.get(ref);
        if (!snap.exists()) throw new Error('Esta turma não existe mais.');
        const dados = snap.data();
        if ((dados.alunos || []).length >= dados.vagas) throw new Error('Turma lotada.');
        transacao.update(ref, { alunos: arrayUnion(usuario.uid) });
      });
      setMensagem(`Matrícula em ${codigo} (${descreverHorario(turma.horario)}) realizada!`);
    } catch (e) {
      console.error(e);
      setErro(e.message === 'Turma lotada.' || e.message === 'Esta turma não existe mais.'
        ? e.message
        : 'Não foi possível fazer a matrícula.');
    }
  }

  // Aplica a busca (código ou nome da disciplina) e o filtro de turmas disponíveis
  const termo = busca.trim().toLowerCase();
  const turmasVisiveis = turmas.filter((t) => {
    const disciplina = disciplinaPorId[t.disciplinaId];
    const texto = `${disciplina?.codigo} ${disciplina?.nome}`.toLowerCase();
    if (termo && !texto.includes(termo)) return false;
    if (soDisponiveis && motivoBloqueio(t)) return false;
    return true;
  });

  return (
    <>
      <h2 className="mb-4">Turmas ofertadas</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <input className="form-control w-auto" placeholder="Buscar disciplina..."
          value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div className="form-check mb-0">
          <input type="checkbox" className="form-check-input" id="soDisponiveis"
            checked={soDisponiveis} onChange={(e) => setSoDisponiveis(e.target.checked)} />
          <label className="form-check-label" htmlFor="soDisponiveis">Só as que posso me matricular</label>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover bg-white align-middle shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Disciplina</th>
              <th>Professor</th>
              <th>Horário</th>
              <th>Vagas</th>
              <th className="text-end">Matrícula</th>
            </tr>
          </thead>
          <tbody>
            {turmasVisiveis.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted">Nenhuma turma encontrada.</td></tr>
            )}
            {turmasVisiveis.map((t) => {
              const disciplina = disciplinaPorId[t.disciplinaId];
              const livres = t.vagas - (t.alunos || []).length;
              const motivo = motivoBloqueio(t);
              const matriculado = (t.alunos || []).includes(usuario.uid);
              return (
                <tr key={t.id}>
                  <td>
                    <div className="fw-bold">{disciplina?.codigo || '?'}</div>
                    <div className="small text-muted">{disciplina?.nome}</div>
                  </td>
                  <td>{professorPorId[t.professorId]?.nome || '?'}</td>
                  <td>
                    <span className="badge bg-primary me-1">{t.horario}</span>
                    <span className="small text-muted">{descreverHorario(t.horario)}</span>
                  </td>
                  <td className={livres <= 0 ? 'text-danger fw-bold' : ''}>{livres} de {t.vagas}</td>
                  <td className="text-end">
                    {matriculado ? (
                      <span className="badge bg-success">Matriculado</span>
                    ) : motivo ? (
                      <span className="small text-muted">{motivo}</span>
                    ) : (
                      <button className="btn btn-sm btn-primary" onClick={() => matricular(t)}>Matricular</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Ofertas;
