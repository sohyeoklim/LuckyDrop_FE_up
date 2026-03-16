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

export interface DrawDetailResponse {
  hostUserId: number;
  drawId: number;
  title: string;
  description: string;
  ticketCostEntry: number;
  winnerCount: number;
  startAt: string;
  endAt: string;
  status: DrawStatus;
  myTicketBalance: number;

  isBookmarked: boolean;
  participantCount: number;
  bookmarkCount: number;

  productName: string;
  brand: string;
  productDescription: string;
  price: number;
  images: string[];

  endAtChanged: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}


export interface DrawCreateRequest {
  title: string;
  description?: string;
  ticketCostEntry: number;
  winnerCount: number;
  startAt: string;
  endAt: string;

  product: {
    name: string;
    brand: string;
    description?: string;
    retailPrice?: number;
    shippable: boolean;

    images: {
      imageUrl: string;
      sortOrder?: number;
    }[];
  };
}