import apiClient from './client';

export type EntryStatus = 'OPEN' | 'LOCKED' | 'DRAWING' | 'DONE' | 'WON' | 'LOST';

export interface RecentEntry {
  id: number;
  drawId: number;
  drawTitle: string;
  drawImage: string;
  entryDate: string;
  ticketUsed: number;
  entryCount: number;
  status: EntryStatus;
  resultDate?: string;
  isWinner: boolean;
}

interface MyEntryResponseDto {
  id: number;
  drawId: number;
  drawTitle: string;
  drawImage: string;
  entryDate: string;
  ticketUsed: number;
  entryCount: number;
  status: string;
  resultDate?: string;
  isWinner: number; // 0 or 1
}

interface MyEntryPageResponse {
  content: MyEntryResponseDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 최근 응모내역 3개
export async function fetchRecentEntries(page = 0, size = 3): Promise<RecentEntry[]> {
  const { data } = await apiClient.get<MyEntryPageResponse>('/api/draws/my-entries', {
    params: { page, size },
  });

  return data.content.map((item) => ({
    id: item.id,
    drawId: item.drawId,
    drawTitle: item.drawTitle,
    drawImage: item.drawImage ? `http://localhost:8080${item.drawImage}` : '/placeholder.jpg',
    entryDate: item.entryDate,
    ticketUsed: item.ticketUsed,
    entryCount: item.entryCount,
    status: item.status as EntryStatus,
    resultDate: item.resultDate,
    isWinner: !!item.isWinner, // number → boolean
  }));
}