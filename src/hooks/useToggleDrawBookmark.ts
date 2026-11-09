import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { DrawCardResponse, DrawDetailResponse, PageResponse } from "@/types/draw";

interface ToggleDrawBookmarkParams {
  drawId: number | string;
  nextBookmarked: boolean;
}

type DrawPage = PageResponse<DrawCardResponse>;

function updateDrawCard(
  draw: DrawCardResponse,
  drawId: string,
  nextBookmarked: boolean
): DrawCardResponse {
  if (String(draw.drawId) !== drawId) return draw;

  return {
    ...draw,
    isBookmarked: nextBookmarked,
    bookmarkCount: Math.max(0, draw.bookmarkCount + (nextBookmarked ? 1 : -1)),
  };
}

function updateDrawPage(
  page: DrawPage,
  drawId: string,
  nextBookmarked: boolean
): DrawPage {
  return {
    ...page,
    content: page.content.map((draw) => updateDrawCard(draw, drawId, nextBookmarked)),
  };
}

export function useToggleDrawBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ drawId, nextBookmarked }: ToggleDrawBookmarkParams) => {
      if (nextBookmarked) {
        await api.post(`/api/draws/${drawId}/bookmark`);
      } else {
        await api.delete(`/api/draws/${drawId}/bookmark`);
      }
    },

    onSuccess: (_data, variables) => {
      const drawId = String(variables.drawId);
      const { nextBookmarked } = variables;

      // 목록 데이터는 현재 배열 순서를 유지한 채 해당 카드만 갱신한다.
      // 북마크순 정렬은 다음 목록 조회(새로고침/재진입)부터 서버 결과를 따른다.
      queryClient.setQueriesData<DrawPage | { pages: DrawPage[] }>(
        { queryKey: ["draws"] },
        (cached) => {
          if (!cached) return cached;

          if ("pages" in cached) {
            return {
              ...cached,
              pages: cached.pages.map((page) =>
                updateDrawPage(page, drawId, nextBookmarked)
              ),
            };
          }

          return updateDrawPage(cached, drawId, nextBookmarked);
        }
      );

      queryClient.setQueriesData<DrawDetailResponse>(
        { queryKey: ["draw"] },
        (cached) => {
          if (!cached || String(cached.drawId) !== drawId) return cached;

          return {
            ...cached,
            isBookmarked: nextBookmarked,
            bookmarkCount: Math.max(
              0,
              cached.bookmarkCount + (nextBookmarked ? 1 : -1)
            ),
          };
        }
      );

      queryClient.setQueriesData<{ drawId: number; isBookmarked: boolean }>(
        { queryKey: ["hot-banner"] },
        (cached) =>
          cached && String(cached.drawId) === drawId
            ? { ...cached, isBookmarked: nextBookmarked }
            : cached
      );
    },
  });
}
