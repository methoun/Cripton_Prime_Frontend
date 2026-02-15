export interface LoginRequest {
  companyname: string;
  officename: string;
  companyId: string;
  officeId: string;
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
