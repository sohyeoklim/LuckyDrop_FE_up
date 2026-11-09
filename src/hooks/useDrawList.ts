import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getDraws, type GetDrawCardParams } from "../api/draw";

export const useDrawList = (params: GetDrawCardParams) => {
  return useQuery({
    queryKey: ["draws", params],
    queryFn: () => getDraws(params),
  });
};

export const useInfiniteDrawList = (params: GetDrawCardParams) => {
  const { page: _page, ...baseParams } = params;
  return useInfiniteQuery({
    queryKey: ["draws", "infinite", baseParams],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getDraws({ ...baseParams, page: pageParam }),
    // The API returns `page` and `totalPages` (not Spring's `number`/`last` fields).
    // Using the missing `number` field produced `undefined + 1`, which Axios
    // serialized as `page=NaN` on the next infinite-scroll request.
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
};
