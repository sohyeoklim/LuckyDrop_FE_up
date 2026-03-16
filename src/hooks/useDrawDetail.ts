import { useQuery } from '@tanstack/react-query';
import { getDrawDetail } from '@/api/draw';
import type { DrawDetailResponse } from '@/types/draw';

export function useDrawDetail(drawId?: string) {
  return useQuery<DrawDetailResponse>({
    queryKey: ['draw', String(drawId)],
    queryFn: () => getDrawDetail(drawId as string),
    enabled: !!drawId,
  });
}