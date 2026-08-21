export interface LoginData {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}