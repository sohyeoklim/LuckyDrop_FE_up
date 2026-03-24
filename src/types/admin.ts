export type DrawStatus = "DRAFT" | "ACTIVE" | "DRAWING" | "CLOSE" | "CANCEL";

export interface AdminDrawSummaryResponse {
  drawId: number;
  title: string;
  hostNickname: string;
  status: DrawStatus;
  participantCount: number;
}

export interface ForceCancelDrawRequest {
  reasonCode?: string;
  reasonDetail?: string;
}