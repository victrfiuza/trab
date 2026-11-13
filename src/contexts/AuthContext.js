// Contexto global com o usuário logado e o seu perfil (instituição ou aluno).
// Qualquer componente pode ler esses dados com: const { usuario, perfil } = useAuth();
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function AuthProvider(props) {
  const [usuario, setUsuario] = useState(null); // usuário do Firebase Auth
  const [perfil, setPerfil] = useState(null); // documento "usuarios/{uid}" do Firestore
  const [carregando, setCarregando] = useState(true);

  // Busca (ou recarrega) o perfil do usuário no Firestore
  async function carregarPerfil(uid) {
    const snap = await getDoc(doc(db, 'usuarios', uid));
    setPerfil(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }

  useEffect(() => {
    // Observa login / logout
    const cancelar = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      if (user) {
        try {
          await carregarPerfil(user.uid);
        } catch (erro) {
          console.error(erro);
          setPerfil(null);
        }
      } else {
        setPerfil(null);
      }
      setCarregando(false);
    });
    return cancelar;
  }, []);

  function sair() {
    return signOut(auth);
  }

  const valor = {
    usuario,
    perfil,
    carregando,
    sair,
    // usa auth.currentUser para funcionar logo após o cadastro
    recarregarPerfil: () => auth.currentUser && carregarPerfil(auth.currentUser.uid),
  };

  return <AuthContext.Provider value={valor}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
