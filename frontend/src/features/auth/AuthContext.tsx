import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  loadCurrentUser,
} from "./authUser";

import type {
  CurrentUser,
} from "./authUser";

import {
  getAccessToken,
} from "./authStorage";


interface AuthContextType {
  user: CurrentUser | null;
  loadingUser: boolean;

  esAdministracion: boolean;
  esOperaciones: boolean;
  esFinanzas: boolean;  

  reloadUser: () => Promise<void>;
}


const AuthContext =
  createContext<AuthContextType | null>(
    null
  );


interface Props {
  children: ReactNode;
}


export function AuthProvider({
  children,
}: Props) {

  const [
    user,
    setUser,
  ] = useState<CurrentUser | null>(
    null
  );

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);


  async function reloadUser() {

    const token =
      getAccessToken();

    if (!token) {
      setUser(null);
      return;
    }

    try {

      const data =
        await loadCurrentUser();

      setUser(data);

    } catch (error) {

      console.error(
        "No se pudo cargar el usuario",
        error
      );

      setUser(null);

    }
  }


  useEffect(() => {

    async function initialize() {

      try {

        const token =
          getAccessToken();

        if (token) {
          await reloadUser();
        } else {
          setUser(null);
        }

      } finally {

        setLoadingUser(false);

      }
    }

    initialize();

  }, []);


  const esAdministracion =
    !!user &&
    (
      user.is_superuser ||
      user.groups.includes(
        "ADMINISTRACION"
      )
    );

  const esFinanzas =
  !!user &&
  (
    user.is_superuser ||
    user.groups.includes(
      "FINANZAS"
    )
  );  

  const esOperaciones =
    !!user &&
    (
      user.is_superuser ||
      user.groups.includes(
        "OPERACIONES"
      )
    );


  return (
    <AuthContext.Provider
      value={{
        user,
        loadingUser,
        esAdministracion,
        esOperaciones,
        esFinanzas,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}