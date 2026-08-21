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