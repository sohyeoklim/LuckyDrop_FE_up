import apiClient from '../api/client';

// ✅ 백엔드 DrawStatus와 완전 일치
export type DrawStatus = 'DRAFT' | 'ACTIVE' | 'DRAWING' | 'CLOSE' | 'CANCEL';

export interface LikedDraw {
  id: number;
  title: string;
  description: string;
  image: string;
  ticketCost: number;
  timeLeft: string;
  status: DrawStatus;
  totalEntries: number;
  likedDate: string;
}

interface MyBookmarkItemDto {
  drawId: number;
  title: string;
  status: string; // ACTIVE 등
  startAt: string;
  endAt: string;
  bookmarkCount: number;
  participants: number;
  thumbnailUrl: string | null;
  isBookmarked: boolean;
  bookmarkedAt: string;
  productName?: string; // ✅ 추가
  ticketCostEntry?: number; // ✅ 추가
}

interface MyBookmarkResponse {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: MyBookmarkItemDto[];
}

const calcTimeLeft = (endAt: string, status: string): string => {
  if (status !== 'ACTIVE' && status !== 'OPEN') return '응모 마감';
  const end = new Date(endAt).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return '응모 마감';

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export async function fetchMyLikedDraws(page = 0, size = 20): Promise<{
  items: LikedDraw[];
  page: number;
  totalPages: number;
}> {
  const res = await apiClient.get<MyBookmarkResponse>(`/api/draws/bookmarks`, {
    params: { page, size },
  });

  const data = res.data;
  const items: LikedDraw[] = data.items.map((item) => {
    // ✅ 백엔드 DrawStatus를 프론트엔드에 그대로 전달
    const backendStatus = item.status.toUpperCase() as DrawStatus;
    
    return {
      id: item.drawId,
      title: item.title,
      description: item.productName || '',
      image: item.thumbnailUrl ? `http://localhost:8080${item.thumbnailUrl}` : 'https://via.placeholder.com/400x300',
      ticketCost: item.ticketCostEntry || 0,
      timeLeft: calcTimeLeft(item.endAt, item.status),
      status: backendStatus, // ✅ 매핑 제거, 백엔드 그대로
      totalEntries: item.participants,
      likedDate: item.bookmarkedAt.slice(0, 10),
    };
  });

  return {
    items,
    page: data.page,
    totalPages: data.totalPages,
  };
}

export async function unlikeDraw(drawId: number): Promise<void> {
  await apiClient.delete(`/api/draws/${drawId}/bookmark`);
}