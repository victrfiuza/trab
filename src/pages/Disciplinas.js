// Caso de uso 1 (Instituição): Cadastrar disciplinas e seus pré-requisitos
// Coleção "disciplinas": { codigo, nome, prerequisitos: [idDisciplina] }
import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ouvirColecao, indexarPorId } from '../utils/firestore';

const FORM_VAZIO = { codigo: '', nome: '', prerequisitos: [] };

// Verifica se a disciplina "id" aparece na cadeia de pré-requisitos de "prerequisitos".
// Ex.: se B exige A, então A não pode passar a exigir B (os dois ficariam impossíveis de cursar).
function geraCiclo(id, prerequisitos, porId) {
  return prerequisitos.some((pre) =>
    pre === id || geraCiclo(id, porId[pre]?.prerequisitos || [], porId)
  );
}

function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null); // null = cadastrando uma nova
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Escuta as coleções em tempo real enquanto a página estiver aberta
  useEffect(() => ouvirColecao('disciplinas', 'codigo', setDisciplinas), []);
  useEffect(() => ouvirColecao('turmas', 'horario', setTurmas), []);

  const porId = indexarPorId(disciplinas);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // Marca / desmarca um pré-requisito
  function alternarPrerequisito(id) {
    const lista = form.prerequisitos.includes(id)
      ? form.prerequisitos.filter((p) => p !== id)
      : [...form.prerequisitos, id];
    setForm({ ...form, prerequisitos: lista });
  }

  function editar(disciplina) {
    setEditandoId(disciplina.id);
    setForm({
      codigo: disciplina.codigo,
      nome: disciplina.nome,
      prerequisitos: disciplina.prerequisitos || [],
    });
    setErro('');
    setMensagem('');
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErro('');
  }

  function validar(codigo) {
    const repetido = disciplinas.some((d) => d.codigo === codigo && d.id !== editandoId);
    if (repetido) return `Já existe uma disciplina com o código ${codigo}.`;
    if (editandoId && geraCiclo(editandoId, form.prerequisitos, porId)) {
      return 'Esses pré-requisitos criam um ciclo (uma disciplina acabaria exigindo ela mesma).';
    }
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setMensagem('');
    const dados = {
      codigo: form.codigo.trim().toUpperCase(),
      nome: form.nome.trim(),
      prerequisitos: form.prerequisitos,
    };
    const problema = validar(dados.codigo);
    if (problema) {
      setErro(problema);
      return;
    }
    try {
      if (editandoId) {
        await updateDoc(doc(db, 'disciplinas', editandoId), dados);
        setMensagem('Disciplina atualizada.');
      } else {
        await addDoc(collection(db, 'disciplinas'), dados);
        setMensagem('Disciplina cadastrada.');
      }
      cancelarEdicao();
    } catch (e) {
      console.error(e);
      setErro('Não foi possível salvar a disciplina.');
    }
  }

  async function excluir(disciplina) {
    setErro('');
    setMensagem('');
    if (turmas.some((t) => t.disciplinaId === disciplina.id)) {
      setErro(`${disciplina.codigo} tem turmas ofertadas. Exclua as turmas antes.`);
      return;
    }
    const dependente = disciplinas.find((d) => (d.prerequisitos || []).includes(disciplina.id));
    if (dependente) {
      setErro(`${disciplina.codigo} é pré-requisito de ${dependente.codigo}. Remova essa ligação antes.`);
      return;
    }
    if (!window.confirm(`Excluir a disciplina ${disciplina.codigo}?`)) return;
    try {
      await deleteDoc(doc(db, 'disciplinas', disciplina.id));
      if (editandoId === disciplina.id) cancelarEdicao();
      setMensagem('Disciplina excluída.');
    } catch (e) {
      console.error(e);
      setErro('Não foi possível excluir a disciplina.');
    }
  }

  // Na edição, a própria disciplina não aparece como opção de pré-requisito
  const opcoesPrerequisito = disciplinas.filter((d) => d.id !== editandoId);

  return (
    <>
      <h2 className="mb-4">Disciplinas</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">{editandoId ? 'Editar disciplina' : 'Nova disciplina'}</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Código</label>
                  <input name="codigo" className="form-control" placeholder="Ex.: INF101" required
                    value={form.codigo} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nome</label>
                  <input name="nome" className="form-control" placeholder="Ex.: Algoritmos I" required
                    value={form.nome} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pré-requisitos</label>
                  {opcoesPrerequisito.length === 0 && (
                    <p className="text-muted small mb-0">Nenhuma outra disciplina cadastrada.</p>
                  )}
                  {opcoesPrerequisito.map((d) => (
                    <div className="form-check" key={d.id}>
                      <input type="checkbox" className="form-check-input" id={`pre-${d.id}`}
                        checked={form.prerequisitos.includes(d.id)}
                        onChange={() => alternarPrerequisito(d.id)} />
                      <label className="form-check-label" htmlFor={`pre-${d.id}`}>
                        {d.codigo} - {d.nome}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary">{editandoId ? 'Salvar' : 'Cadastrar'}</button>
                  {editandoId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={cancelarEdicao}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="table-responsive">
            <table className="table table-hover bg-white align-middle shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Pré-requisitos</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {disciplinas.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-muted">Nenhuma disciplina cadastrada.</td></tr>
                )}
                {disciplinas.map((d) => (
                  <tr key={d.id}>
                    <td className="fw-bold">{d.codigo}</td>
                    <td>{d.nome}</td>
                    <td>
                      {(d.prerequisitos || []).length === 0 && <span className="text-muted">-</span>}
                      {(d.prerequisitos || []).map((pre) => (
                        <span key={pre} className="badge bg-secondary me-1">{porId[pre]?.codigo || '?'}</span>
                      ))}
                    </td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editar(d)}>Editar</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(d)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Disciplinas;
