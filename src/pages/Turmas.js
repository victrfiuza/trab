// Caso de uso 3 (Instituição): Montar a oferta de turmas
// Coleção "turmas": { disciplinaId, professorId, horario: '21', vagas, alunos: [uid] }
// Regras: o professor não pode ter duas turmas no mesmo horário nem passar da carga máxima,
// e a mesma disciplina não pode ter duas turmas no mesmo horário.
import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash } from '@phosphor-icons/react';
import { db } from '../firebase';
import { ouvirColecao, indexarPorId } from '../utils/firestore';
import { HORARIOS, descreverHorario } from '../utils/horarios';
import GradeHorarios from '../components/GradeHorarios';
import Modal from '../components/Modal';
import BotaoIcone from '../components/BotaoIcone';

const FORM_VAZIO = { disciplinaId: '', professorId: '', horario: HORARIOS[0], vagas: 30 };

function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroProfessor, setFiltroProfessor] = useState(''); // '' = grade com todos
  const [erro, setErro] = useState('');         // erros da página (ex.: exclusão)
  const [erroForm, setErroForm] = useState(''); // erros do formulário, mostrados no modal
  const [mensagem, setMensagem] = useState('');

  useEffect(() => ouvirColecao('turmas', 'horario', setTurmas), []);
  useEffect(() => ouvirColecao('disciplinas', 'codigo', setDisciplinas), []);
  useEffect(() => ouvirColecao('professores', 'nome', setProfessores), []);

  const disciplinaPorId = indexarPorId(disciplinas);
  const professorPorId = indexarPorId(professores);

  function turmasDoProfessor(professorId) {
    return turmas.filter((t) => t.professorId === professorId);
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function abrirNova() {
    setForm(FORM_VAZIO);
    setErro('');
    setErroForm('');
    setMensagem('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setForm(FORM_VAZIO);
    setErroForm('');
  }

  // Retorna a mensagem de erro, ou '' se estiver tudo certo
  function validar() {
    const professor = professorPorId[form.professorId];
    const doProfessor = turmasDoProfessor(form.professorId);
    if (Number(form.vagas) < 1) {
      return 'A turma deve ter pelo menos 1 vaga.';
    }
    if (doProfessor.some((t) => t.horario === form.horario)) {
      return `${professor.nome} já dá aula em ${descreverHorario(form.horario)}.`;
    }
    if (doProfessor.length >= professor.cargaMaxima) {
      return `${professor.nome} já atingiu a carga máxima de ${professor.cargaMaxima} turma(s).`;
    }
    if (turmas.some((t) => t.disciplinaId === form.disciplinaId && t.horario === form.horario)) {
      return 'Já existe uma turma desta disciplina neste horário.';
    }
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroForm('');
    const problema = validar();
    if (problema) {
      setErroForm(problema);
      return;
    }
    try {
      await addDoc(collection(db, 'turmas'), {
        disciplinaId: form.disciplinaId,
        professorId: form.professorId,
        horario: form.horario,
        vagas: Number(form.vagas),
        alunos: [], // uids dos alunos matriculados
      });
      setMensagem('Turma ofertada.');
      fecharModal();
    } catch (e) {
      console.error(e);
      setErroForm('Não foi possível salvar a turma.');
    }
  }

  async function excluir(turma) {
    setErro('');
    setMensagem('');
    const matriculados = (turma.alunos || []).length;
    const aviso = matriculados > 0
      ? `Esta turma tem ${matriculados} aluno(s) matriculado(s). Excluir mesmo assim?`
      : 'Excluir esta turma?';
    if (!window.confirm(aviso)) return;
    try {
      await deleteDoc(doc(db, 'turmas', turma.id));
      setMensagem('Turma excluída.');
    } catch (e) {
      console.error(e);
      setErro('Não foi possível excluir a turma.');
    }
  }

  const nomeDisciplina = (id) => disciplinaPorId[id]?.codigo || '?';
  const nomeProfessor = (id) => professorPorId[id]?.nome || '?';

  const turmasNaGrade = filtroProfessor ? turmasDoProfessor(filtroProfessor) : turmas;
  const faltaCadastro = disciplinas.length === 0 || professores.length === 0;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="mb-0">Oferta de turmas</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={abrirNova}>
          <Plus weight="bold" /> Nova turma
        </button>
      </div>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="table-responsive">
        <table className="table table-hover bg-white align-middle shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Horário</th>
              <th>Disciplina</th>
              <th>Professor</th>
              <th>Ocupação</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {turmas.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted">Nenhuma turma ofertada.</td></tr>
            )}
            {turmas.map((t) => {
              const ocupadas = (t.alunos || []).length;
              return (
                <tr key={t.id}>
                  <td>
                    <span className="badge bg-primary me-1">{t.horario}</span>
                    <span className="small text-muted">{descreverHorario(t.horario)}</span>
                  </td>
                  <td className="fw-bold">{nomeDisciplina(t.disciplinaId)}</td>
                  <td>{nomeProfessor(t.professorId)}</td>
                  <td className={ocupadas >= t.vagas ? 'text-danger fw-bold' : ''}>
                    {ocupadas}/{t.vagas}
                  </td>
                  <td className="text-end">
                    <BotaoIcone icone={Trash} texto="Excluir" cor="danger" onClick={() => excluir(t)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        aberto={modalAberto}
        titulo="Nova turma"
        onFechar={fecharModal}
        rodape={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={fecharModal}>
              {faltaCadastro ? 'Fechar' : 'Cancelar'}
            </button>
            {!faltaCadastro && (
              <button type="submit" form="form-turma" className="btn btn-primary">Ofertar turma</button>
            )}
          </>
        }
      >
        {faltaCadastro ? (
          <p className="text-muted mb-0">Cadastre pelo menos uma disciplina e um professor antes.</p>
        ) : (
          <>
            {erroForm && <div className="alert alert-danger">{erroForm}</div>}
            <form id="form-turma" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Disciplina</label>
                <select name="disciplinaId" className="form-select" required autoFocus
                  value={form.disciplinaId} onChange={handleChange}>
                  <option value="">Escolha...</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>{d.codigo} - {d.nome}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Professor</label>
                <select name="professorId" className="form-select" required
                  value={form.professorId} onChange={handleChange}>
                  <option value="">Escolha...</option>
                  {professores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({turmasDoProfessor(p.id).length}/{p.cargaMaxima} turmas)
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Horário</label>
                <select name="horario" className="form-select"
                  value={form.horario} onChange={handleChange}>
                  {HORARIOS.map((h) => (
                    <option key={h} value={h}>{h} - {descreverHorario(h)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Vagas</label>
                <input name="vagas" type="number" min="1" className="form-control" required
                  value={form.vagas} onChange={handleChange} />
              </div>
            </form>
          </>
        )}
      </Modal>

      <div className="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3 gap-2">
        <h4 className="mb-0">Grade de ofertas</h4>
        <select className="form-select w-auto" value={filtroProfessor}
          onChange={(e) => setFiltroProfessor(e.target.value)}>
          <option value="">Todos os professores</option>
          {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>
      <GradeHorarios
        turmas={turmasNaGrade}
        renderTurma={(t) => (
          <>
            <div className="fw-bold">{nomeDisciplina(t.disciplinaId)}</div>
            <div>{nomeProfessor(t.professorId)}</div>
            <div className="text-muted">{(t.alunos || []).length}/{t.vagas} alunos</div>
          </>
        )}
      />
    </>
  );
}

export default Turmas;
