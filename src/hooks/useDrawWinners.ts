import { useQuery } from "@tanstack/react-query";
import { getDrawWinners } from "@/api/draw";
import type { DrawWinnerResponse } from "@/types/draw";

export function useDrawWinners(drawId: number, enabled = true) {
  return useQuery<DrawWinnerResponse>({
    queryKey: ["drawWinners", drawId],
    queryFn: () => getDrawWinners(drawId),
    enabled: enabled && !!drawId,
  });
}