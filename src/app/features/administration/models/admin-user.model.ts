/** Administration -> User Setup models (Feature scoped) */
export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

export interface CreateAdminUserPayload {
  username: string;
  fullName: string;
  email: string;
}
