import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface ToggleDrawBookmarkParams {
  drawId: number | string;
  nextBookmarked: boolean;
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

    onSuccess: async (_data, variables) => {

  const drawId = String(variables.drawId)

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["draws"] }),
    queryClient.invalidateQueries({ queryKey: ["draw"] }),
    queryClient.invalidateQueries({ queryKey: ["hot-banner"] }),
  ])
},
  });
}