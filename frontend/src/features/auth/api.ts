import api from "../../api/axios";
import type {
  LoginData,
  TokenResponse,
} from "./types";


export async function login(
  data: LoginData
): Promise<TokenResponse> {

  const response = await api.post<TokenResponse>(
    "token/",
    data
  );

  return response.data;
}
 

interface CambiarPasswordPayload {
  password_actual: string;
  password_nueva: string;
  password_nueva_confirmacion: string;
}


export async function cambiarPassword(
  data: CambiarPasswordPayload
) {
  const response =
    await api.post(
      "cambiar-password/",
      data
    );

  return response.data;
}