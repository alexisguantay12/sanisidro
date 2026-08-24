import api from "../../api/axios";


export interface CurrentUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  groups: string[];
}


let currentUser: CurrentUser | null = null;


export async function loadCurrentUser() {

  const response = await api.get<CurrentUser>(
    "/me/"
  );

  currentUser = response.data;

  return currentUser;
}


export function getCurrentUser() {
  return currentUser;
}


export function clearCurrentUser() {
  currentUser = null;
}


export function isAdministracion(
  user: CurrentUser | null
) {

  if (!user) {
    return false;
  }

  if (user.is_superuser) {
    return true;
  }

  return user.groups.includes(
    "ADMINISTRACION"
  );
}


export function isOperaciones(
  user: CurrentUser | null
) {

  if (!user) {
    return false;
  }

  if (user.is_superuser) {
    return true;
  }

  return user.groups.includes(
    "OPERACIONES"
  );
}