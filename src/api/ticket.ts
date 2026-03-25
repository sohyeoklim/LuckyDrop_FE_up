import apiClient from './client';

export interface TicketAdjustmentRequest {
  userId: string;
  amount: number;
  reason: string;
  adminId: string;
  idempotencyKey: string;
}

export const adjustTicket = async (data: TicketAdjustmentRequest) => {
  const response = await apiClient.post('/api/ticket/adjust', data);
  return response.data;
};
