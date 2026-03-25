import apiClient from "@/api/client";
import type { AdminDrawSummaryResponse, ForceCancelDrawRequest } from "@/types/admin";


export async function getAdminForceCancelDraws() {
  const response = await apiClient.get<AdminDrawSummaryResponse[]>(
    "/api/admin/draws"
  );
  return response.data;
}


export async function forceCancelDraw(
  drawId: number,
  body: ForceCancelDrawRequest
) {
  await apiClient.post(`/api/admin/draws/${drawId}/force-cancel`, body);
}

// ── User ──
export interface AdminUserResDto {
  id: string;
  nickname: string;
  email: string;
  role: string;
  joinedAt: string;
  currentTickets: number;
}

export const getAdminUsers = async (query?: string): Promise<AdminUserResDto[]> => {
  const params = query ? `?query=${encodeURIComponent(query)}` : '';
  const res = await apiClient.get<AdminUserResDto[]>(`/api/user${params}`);
  return res.data;
};

export const changeUserRole = async (userId: string, role: string): Promise<void> => {
  await apiClient.patch(`/api/user/${userId}/role`, { role });
};