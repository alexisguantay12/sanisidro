import type {
  ReactNode,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "./AuthContext";


interface Props {
  children: ReactNode;
}


export default function FinanzasRoute({
  children,
}: Props) {

  const {
    esFinanzas,
    loadingUser,
  } = useAuth();


  if (loadingUser) {
    return null;
  }


  if (!esFinanzas) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return children;
}