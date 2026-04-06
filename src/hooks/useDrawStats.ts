import { useQuery } from "@tanstack/react-query";
import { getDrawStats } from "@/api/draw";

export function useDrawStats() {
  return useQuery({
    queryKey: ["draw-stats"],
    queryFn: getDrawStats,
  });
}