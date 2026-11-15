// Menu do usuário no cabeçalho: um ícone que abre um dropdown com nome, tipo de perfil e "Sair".
// Controlado pelo React (sem o JS do Bootstrap): fecha ao clicar fora ou apertar Esc.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';

const TIPOS = {
  aluno: 'Aluno',
  instituicao: 'Instituição',
};

function MenuUsuario() {
  const { usuario, perfil, sair } = useAuth();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;
    function aoClicarFora(event) {
      if (ref.current && !ref.current.contains(event.target)) setAberto(false);
    }
    function aoTeclar(event) {
      if (event.key === 'Escape') setAberto(false);
    }
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  async function handleSair() {
    setAberto(false);
    await sair();
    navigate('/login');
  }

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="btn btn-link text-white p-1 botao-usuario"
        aria-label="Menu do usuário" aria-expanded={aberto} onClick={() => setAberto(!aberto)}>
        <UserCircle size={32} weight="duotone" />
      </button>

      {aberto && (
        <div className="dropdown-menu show shadow menu-usuario">
          <div className="px-3 py-2">
            <div className="fw-bold text-truncate">{perfil?.nome || 'Usuário'}</div>
            {perfil && (
              <span className="badge bg-primary-subtle text-primary-emphasis mt-1">{TIPOS[perfil.tipo]}</span>
            )}
            <div className="small text-muted text-truncate mt-1">{usuario?.email}</div>
          </div>
          <div className="dropdown-divider" />
          <button type="button" className="dropdown-item d-flex align-items-center gap-2 text-danger"
            onClick={handleSair}>
            <SignOut size={18} /> Sair
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuUsuario;
