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
  hostNickname?: string;
  
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
  totalEntryCount: number;
  bookmarkCount: number;

  productName: string;
  brand: string;
  productDescription: string;
  price: number;
  shippable: boolean;
  images: string[];

  endAtChanged: boolean;

  isEntered: boolean;
  entryCount: number;
  verification?: DrawVerificationResponse;
}

export interface DrawVerificationResponse {
  status: 'PENDING' | 'VERIFIED' | 'LEGACY';
  algorithm?: string;
  commitment?: string;
  revealedCode?: string;
  participantSnapshotHash?: string;
  drawnAt?: string;
}

export type DrawWinnerItem = {
  nickname: string;
  usedTicketCount: number;
};

export type DrawWinnerResponse = {
  drawId: number;
  winners: DrawWinnerItem[];
};

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export type HostWinnerInfoResponse = {
  winnerId: number;
  winnerUserId: number;
  name: string;
  nickname: string;
  phone: string;
  address: string;
  fulfillmentStatus: "ADDRESS_REQUIRED" | "ADDRESS_SUBMITTED" | "PENDING" | "PROCESSING" | "COMPLETED" | "EXPIRED" | "REWARD_PENDING" | "REWARD_DELIVERED";
  fulfillmentNote?: string | null;
  deliveryCarrier?: string | null;
  trackingNumber?: string | null;
  rewardTitle?: string | null;
  rewardDeliveryType?: "CODE" | "MESSAGE" | "IMAGE" | null;
  rewardDeliveredAt?: string | null;
};

export type MyDeliveryResponse = {
  winnerId: number;
  phone: string | null;
  address: string | null;
  addressDeadlineAt: string | null;
  fulfillmentStatus: HostWinnerInfoResponse['fulfillmentStatus'];
  deliveryCarrier?: string | null;
  trackingNumber?: string | null;
};

export type MyRewardResponse = {
  winnerId: number;
  rewardId: number;
  deliveryType: "CODE" | "MESSAGE" | "IMAGE";
  title: string;
  content: string | null;
  imageAvailable: boolean;
  deliveredAt: string;
  confirmedAt: string | null;
  fulfillmentStatus: HostWinnerInfoResponse['fulfillmentStatus'];
};

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

    images: {
      imageUrl: string;
      sortOrder?: number;
    }[];
  };
}
