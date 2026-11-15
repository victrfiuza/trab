import { cloneElement, useEffect, useRef } from 'react';
import { Tooltip as BsTooltip } from 'bootstrap';

function Tooltip({ texto, posicao = 'top', children }) {
  const ref = useRef(null);

  useEffect(() => {
    // trigger 'hover': não fica preso na tela depois do clique (ex.: ao abrir um modal ou confirm)
    const tooltip = new BsTooltip(ref.current, { title: texto, placement: posicao, trigger: 'hover' });
    return () => tooltip.dispose();
  }, [texto, posicao]);

  return cloneElement(children, { ref });
}

export default Tooltip;
