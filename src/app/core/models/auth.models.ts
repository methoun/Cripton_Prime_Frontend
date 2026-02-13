export interface LoginRequest {
  company: string;
  office: string;
  username: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  loginTimeIso?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}
