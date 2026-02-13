export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  userId?: string;
  userName?: string;
}
