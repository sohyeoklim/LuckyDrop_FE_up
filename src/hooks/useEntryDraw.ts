import { useMutation } from '@tanstack/react-query';
import { entryDraw } from '@/api/draw';

type EntryDrawParams = {
  drawId: number;
  count: number;
  idempotencyKey: string;
};

export const useEntryDraw = () => {
  return useMutation({
    mutationFn: ({ drawId, count, idempotencyKey }: EntryDrawParams) =>
      entryDraw(drawId, count, idempotencyKey),
  });
};