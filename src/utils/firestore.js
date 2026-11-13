// Funções auxiliares para ler coleções do Firestore
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

// Escuta uma coleção em tempo real: sempre que algo muda no banco,
// "callback" recebe a lista atualizada no formato [{ id, ...campos }].
// Retorna a função que cancela a escuta (usada no retorno do useEffect).
export function ouvirColecao(nomeColecao, campoOrdem, callback) {
  const consulta = query(collection(db, nomeColecao), orderBy(campoOrdem));
  return onSnapshot(
    consulta,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (erro) => console.error(`Erro ao ler "${nomeColecao}":`, erro)
  );
}

// Transforma uma lista em um objeto indexado pelo id: { id1: item1, id2: item2 }
export function indexarPorId(lista) {
  return Object.fromEntries(lista.map((item) => [item.id, item]));
}
