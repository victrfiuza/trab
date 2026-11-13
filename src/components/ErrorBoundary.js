// Captura erros de renderização dos componentes filhos e mostra uma mensagem amigável
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { temErro: false };
  }

  static getDerivedStateFromError() {
    return { temErro: true };
  }

  componentDidCatch(erro, info) {
    console.error(erro, info);
  }

  render() {
    if (this.state.temErro) {
      return (
        <div className="alert alert-danger m-4">
          <h4>Algo deu errado...</h4>
          <p className="mb-0">Recarregue a página e tente novamente.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
