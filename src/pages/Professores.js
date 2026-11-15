// Caso de uso 2 (Instituição): Cadastrar professores e a carga máxima de turmas
// Coleção "professores": { nome, email, cargaMaxima }
// A tabela mostra a carga atual de cada professor, para equilibrar a distribuição das turmas.
import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Pencil, Plus, Trash } from '@phosphor-icons/react';
import { db } from '../firebase';
import { ouvirColecao } from '../utils/firestore';
import Modal from '../components/Modal';
import BotaoIcone from '../components/BotaoIcone';

const FORM_VAZIO = { nome: '', email: '', cargaMaxima: 4 };

function Professores() {
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');         // erros da página (ex.: exclusão)
  const [erroForm, setErroForm] = useState(''); // erros do formulário, mostrados no modal
  const [mensagem, setMensagem] = useState('');

  useEffect(() => ouvirColecao('professores', 'nome', setProfessores), []);
  useEffect(() => ouvirColecao('turmas', 'horario', setTurmas), []);

  // Quantas turmas o professor já tem
  function cargaAtual(professorId) {
    return turmas.filter((t) => t.professorId === professorId).length;
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function abrirNovo() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro('');
    setErroForm('');
    setMensagem('');
    setModalAberto(true);
  }

  function editar(professor) {
    setEditandoId(professor.id);
    setForm({ nome: professor.nome, email: professor.email || '', cargaMaxima: professor.cargaMaxima });
    setErro('');
    setErroForm('');
    setMensagem('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErroForm('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroForm('');
    const dados = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      cargaMaxima: Number(form.cargaMaxima),
    };
    if (dados.cargaMaxima < 1) {
      setErroForm('A carga máxima deve ser de pelo menos 1 turma.');
      return;
    }
    if (editandoId && dados.cargaMaxima < cargaAtual(editandoId)) {
      setErroForm(`Este professor já tem ${cargaAtual(editandoId)} turma(s). A carga máxima não pode ser menor.`);
      return;
    }
    try {
      if (editandoId) {
        await updateDoc(doc(db, 'professores', editandoId), dados);
        setMensagem('Professor atualizado.');
      } else {
        await addDoc(collection(db, 'professores'), dados);
        setMensagem('Professor cadastrado.');
      }
      fecharModal();
    } catch (e) {
      console.error(e);
      setErroForm('Não foi possível salvar o professor.');
    }
  }

  async function excluir(professor) {
    setErro('');
    setMensagem('');
    if (cargaAtual(professor.id) > 0) {
      setErro(`${professor.nome} tem turmas atribuídas. Exclua as turmas antes.`);
      return;
    }
    if (!window.confirm(`Excluir o professor ${professor.nome}?`)) return;
    try {
      await deleteDoc(doc(db, 'professores', professor.id));
      setMensagem('Professor excluído.');
    } catch (e) {
      console.error(e);
      setErro('Não foi possível excluir o professor.');
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="mb-0">Professores</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={abrirNovo}>
          <Plus weight="bold" /> Novo professor
        </button>
      </div>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="table-responsive">
        <table className="table table-hover bg-white align-middle shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th style={{ width: 200 }}>Carga</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {professores.length === 0 && (
              <tr><td colSpan="4" className="text-center text-muted">Nenhum professor cadastrado.</td></tr>
            )}
            {professores.map((p) => {
              const atual = cargaAtual(p.id);
              const porcentagem = Math.round((atual / p.cargaMaxima) * 100);
              const cor = atual >= p.cargaMaxima ? 'bg-danger' : porcentagem >= 75 ? 'bg-warning' : 'bg-success';
              return (
                <tr key={p.id}>
                  <td className="fw-bold">{p.nome}</td>
                  <td>{p.email || <span className="text-muted">-</span>}</td>
                  <td>
                    <div className="small">{atual} de {p.cargaMaxima} turma(s)</div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className={`progress-bar ${cor}`} style={{ width: `${porcentagem}%` }} />
                    </div>
                  </td>
                  <td className="text-end text-nowrap">
                    <BotaoIcone icone={Pencil} texto="Editar" onClick={() => editar(p)} />
                    <BotaoIcone icone={Trash} texto="Excluir" cor="danger" onClick={() => excluir(p)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        aberto={modalAberto}
        titulo={editandoId ? 'Editar professor' : 'Novo professor'}
        onFechar={fecharModal}
        rodape={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={fecharModal}>Cancelar</button>
            <button type="submit" form="form-professor" className="btn btn-primary">
              {editandoId ? 'Salvar' : 'Cadastrar'}
            </button>
          </>
        }
      >
        {erroForm && <div className="alert alert-danger">{erroForm}</div>}
        <form id="form-professor" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input name="nome" className="form-control" required autoFocus
              value={form.nome} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input name="email" type="email" className="form-control"
              value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="form-label">Carga máxima (turmas por semestre)</label>
            <input name="cargaMaxima" type="number" min="1" max="18" className="form-control" required
              value={form.cargaMaxima} onChange={handleChange} />
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Professores;
