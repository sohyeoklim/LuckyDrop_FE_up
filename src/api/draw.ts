import { api } from "@/lib/axios";
import type { DrawCardResponse, PageResponse } from "@/types/draw";

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