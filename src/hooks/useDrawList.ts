import { useQuery } from "@tanstack/react-query";
import { getDraws, type GetDrawCardParams } from "../api/draw";

export const useDrawList = (params: GetDrawCardParams) => {
  return useQuery({
    queryKey: ["drawList", params],
    queryFn: () => getDraws(params),
  });
};