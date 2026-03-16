import { useQuery } from "@tanstack/react-query";
import { getDraws } from "@/api/draw";

export function useOngoingDraws() {
  return useQuery({
    queryKey: ["draws", "ongoing", 0, 6],
    queryFn: () =>
      getDraws({
        tab: "ONGOING",
        page: 0,
        size: 6,
      }),
  });
}