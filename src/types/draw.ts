export type DrawStatus = 'DRAFT' | 'ACTIVE' | 'DRAWING' | 'CLOSE' | 'CANCEL';

export interface DrawCardResponse {
  drawId: number;
  productName: string;
  title: string;
  imageUrl: string | null;
  ticketCostEntry: number;
  status: DrawStatus;
  startAt: string;
  endAt: string;
  isBookmarked: boolean;
  participantCount: number;
  bookmarkCount: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}