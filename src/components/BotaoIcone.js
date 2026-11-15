// Botão só com ícone (sem borda) e tooltip com o nome da ação.
// Uso:
//   <BotaoIcone icone={Pencil} texto="Editar" onClick={...} />
//   <BotaoIcone icone={Trash} texto="Excluir" cor="danger" onClick={...} />
import Tooltip from './Tooltip';

function BotaoIcone({ icone: Icone, texto, cor = 'primary', onClick }) {
  return (
    <Tooltip texto={texto}>
      <button type="button" className={`btn btn-sm botao-icone text-${cor}`} aria-label={texto} onClick={onClick}>
        <Icone size={22} />
      </button>
    </Tooltip>
  );
}

export default BotaoIcone;
