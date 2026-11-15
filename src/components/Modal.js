// Modal reutilizável com o visual do Bootstrap, controlado pelo React (sem o JS do Bootstrap).
// Uso:
//   <Modal aberto={aberto} titulo="Nova disciplina" onFechar={fechar} rodape={<botões />}>
//     ...conteúdo...
//   </Modal>
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';

function Modal({ aberto, titulo, onFechar, rodape, tamanho, children }) {
  // Guarda a função mais recente sem precisar recriar os listeners a cada render
  const onFecharRef = useRef(onFechar);
  onFecharRef.current = onFechar;

  useEffect(() => {
    if (!aberto) return undefined;
    function aoTeclar(event) {
      if (event.key === 'Escape') onFecharRef.current();
    }
    document.addEventListener('keydown', aoTeclar);
    document.body.classList.add('modal-open'); // trava a rolagem da página por trás
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.classList.remove('modal-open');
    };
  }, [aberto]);

  if (!aberto) return null;

  // Fecha só se o clique começou no fundo escuro (e não dentro da caixa do modal)
  function aoClicarFundo(event) {
    if (event.target === event.currentTarget) onFechar();
  }

  const classeTamanho = tamanho ? `modal-${tamanho}` : '';

  return createPortal(
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true"
        onMouseDown={aoClicarFundo}>
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable modal-animado ${classeTamanho}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>
              <button type="button" className="btn btn-link text-secondary p-0 ms-auto"
                aria-label="Fechar" onClick={onFechar}>
                <X size={22} />
              </button>
            </div>
            <div className="modal-body">{children}</div>
            {rodape && <div className="modal-footer">{rodape}</div>}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default Modal;
