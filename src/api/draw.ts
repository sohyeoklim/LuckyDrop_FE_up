import { api } from "@/lib/axios";
import type { DrawCardResponse, PageResponse, DrawDetailResponse } from "@/types/draw";

export type DrawTab = "ALL" | "UPCOMING" | "ONGOING" | "CLOSED";
export type DrawSort = "LATEST" | "BOOKMARK";

export interface HotBannerResponse {
  drawId: number;
  reason: string;
  title: string;
  productName: string;
  images: string[];
  isBookmarked: boolean;
  ticketCostEntry: number;
  endAt: string;
  startAt: string;
}

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
  const response = await api.get<DrawDetailResponse>(`/api/draws/${drawId}`);
  return response.data;
}

export async function bookmarkDraw(drawId: number | string): Promise<void> {
  await api.post(`/api/draws/${drawId}/bookmark`);
}

export async function unbookmarkDraw(drawId: number | string): Promise<void> {
  await api.delete(`/api/draws/${drawId}/bookmark`);
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


export async function getHotBanner(): Promise<HotBannerResponse> {
  const response = await api.get<HotBannerResponse>("/api/draws/hot-banner");
  return response.data;
}