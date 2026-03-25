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