// Caso de uso 6 (Aluno): Informar as disciplinas já concluídas
// Fica salvo em "usuarios/{uid}.concluidas" e é usado para checar os pré-requisitos na matrícula.
import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ouvirColecao } from '../utils/firestore';

function Historico() {
  const { usuario, perfil, recarregarPerfil } = useAuth();
  const [disciplinas, setDisciplinas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [marcadas, setMarcadas] = useState(perfil?.concluidas || []);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => ouvirColecao('disciplinas', 'codigo', setDisciplinas), []);
  useEffect(() => ouvirColecao('turmas', 'horario', setTurmas), []);

  // Disciplinas em que o aluno está matriculado agora (não podem ser marcadas como concluídas)
  const emCurso = turmas
    .filter((t) => (t.alunos || []).includes(usuario.uid))
    .map((t) => t.disciplinaId);

  function alternar(id) {
    setMensagem('');
    setMarcadas(marcadas.includes(id) ? marcadas.filter((m) => m !== id) : [...marcadas, id]);
  }

  async function salvar() {
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), { concluidas: marcadas });
      await recarregarPerfil(); // atualiza o perfil do Context (usado na tela de ofertas)
      setMensagem('Histórico salvo.');
    } catch (e) {
      console.error(e);
      setErro('Não foi possível salvar o histórico.');
    }
    setSalvando(false);
  }

  return (
    <>
      <h2 className="mb-2">Histórico</h2>
      <p className="text-muted mb-4">
        Marque as disciplinas que você já concluiu. Elas liberam as disciplinas que têm pré-requisitos.
      </p>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="card shadow-sm" style={{ maxWidth: 600 }}>
        <ul className="list-group list-group-flush">
          {disciplinas.length === 0 && (
            <li className="list-group-item text-muted">Nenhuma disciplina cadastrada pela instituição.</li>
          )}
          {disciplinas.map((d) => {
            const cursando = emCurso.includes(d.id);
            return (
              <li className="list-group-item" key={d.id}>
                <div className="form-check mb-0">
                  <input type="checkbox" className="form-check-input" id={`conc-${d.id}`}
                    checked={marcadas.includes(d.id)} disabled={cursando}
                    onChange={() => alternar(d.id)} />
                  <label className="form-check-label" htmlFor={`conc-${d.id}`}>
                    <span className="fw-bold">{d.codigo}</span> - {d.nome}
                    {cursando && <span className="badge bg-info text-dark ms-2">Cursando agora</span>}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="card-body">
          <button className="btn btn-primary" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar histórico'}
          </button>
        </div>
      </div>
    </>
  );
}

export default Historico;
