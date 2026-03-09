import { api } from "@/lib/axios";
import type { DrawCardResponse, PageResponse, DrawDetailResponse } from "@/types/draw";

export type DrawTab = "ALL" | "UPCOMING" | "ONGOING" | "CLOSED";
export type DrawSort = "LATEST" | "BOOKMARK";

export interface GetDrawCardParams {
  tab?: DrawTab;
  sort?: DrawSort;
  page?: number;
  size?: number;
}

export async function getDraws(params: GetDrawCardParams) {
  const response = await api.get<PageResponse<DrawCardResponse>>("/api/draws", {
    params,
  });

  return response.data;
}

export async function getDrawDetail(drawId: number | string): Promise<DrawDetailResponse> {
  console.log('getDrawDetail drawId =', drawId);
  const response = await api.get<DrawDetailResponse>(`/api/draws/${drawId}`);
  console.log('detail response =', response.data);
  return response.data;
}

export async function entryDraw(
  drawId: number,
  count: number,
  idempotencyKey: string
) {
  const response = await api.post(
    `/api/draws/${drawId}/entry`,
    { count },
    {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    }
  );

  return response.data;
}