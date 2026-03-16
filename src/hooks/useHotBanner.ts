import { useQuery } from "@tanstack/react-query";
import { getHotBanner } from "@/api/draw";

export function useHotBanner() {
  return useQuery({
    queryKey: ["hot-banner"],
    queryFn: getHotBanner,
  });
}