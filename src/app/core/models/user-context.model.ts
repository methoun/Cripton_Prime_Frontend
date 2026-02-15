export interface UserContext {
  userId: string;
  userName: string;
  userRole?: string | null;

  companyId: string;
  companyName: string;

  areaId?: string | null;
  areaName?: string | null;

  userImageUrl?: string | null;

  loginTimeIso?: string | null;
  ipAddress?: string | null;
}
