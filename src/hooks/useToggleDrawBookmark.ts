import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkDraw, unbookmarkDraw } from '@/api/draw';
import type { DrawDetailResponse } from '@/types/draw';

interface ToggleDrawBookmarkParams {
  drawId: string;
  isBookmarked: boolean;
}

export function useToggleDrawBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ drawId, isBookmarked }: ToggleDrawBookmarkParams) => {
      if (isBookmarked) {
        await unbookmarkDraw(drawId);
        return { isBookmarked: false };
      }

      await bookmarkDraw(drawId);
      return { isBookmarked: true };
    },

    onMutate: async ({ drawId, isBookmarked }) => {
      await queryClient.cancelQueries({ queryKey: ['drawDetail', drawId] });

      const previousDraw = queryClient.getQueryData<DrawDetailResponse>([
        'drawDetail',
        drawId,
      ]);

      if (previousDraw) {
        queryClient.setQueryData<DrawDetailResponse>(['drawDetail', drawId], {
          ...previousDraw,
          isBookmarked: !isBookmarked,
          bookmarkCount: isBookmarked
            ? Math.max(0, previousDraw.bookmarkCount - 1)
            : previousDraw.bookmarkCount + 1,
        });
      }

      return { previousDraw, drawId };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousDraw && context.drawId) {
        queryClient.setQueryData(['drawDetail', context.drawId], context.previousDraw);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drawDetail', variables.drawId] });

      // 목록 캐시 키가 ['draws'] 계열이면 이걸로 충분
      queryClient.invalidateQueries({ queryKey: ['draws'] });
    },
  });
}