// Tabela dia × turno com as turmas em cada horário.
// Usada pela instituição (grade de ofertas) e pelo aluno (minha grade).
// Props: turmas (lista com o campo "horario") e renderTurma (o que mostrar de cada turma).
import { DIAS, TURNOS } from '../utils/horarios';

function GradeHorarios({ turmas, renderTurma }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered text-center align-middle bg-white mb-0">
        <thead className="table-light">
          <tr>
            <th>Turno</th>
            {Object.entries(DIAS).map(([numero, nome]) => <th key={numero}>{nome}</th>)}
          </tr>
        </thead>
        <tbody>
          {Object.entries(TURNOS).map(([turno, nomeTurno]) => (
            <tr key={turno}>
              <th className="table-light">{nomeTurno}</th>
              {Object.keys(DIAS).map((dia) => {
                const naCelula = turmas.filter((t) => t.horario === dia + turno);
                return (
                  <td key={dia} className="celula-grade">
                    {naCelula.map((t) => (
                      <div key={t.id} className="small border rounded bg-primary-subtle p-1 mb-1">
                        {renderTurma(t)}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GradeHorarios;
