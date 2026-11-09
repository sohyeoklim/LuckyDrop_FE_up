import apiClient from './client';

export interface MissionDto {
  code: string;
  title: string;
  description: string;
  type: 'ATTENDANCE' | 'AD' | 'EVENT' | 'INVITE';
  rewardTickets: number;
  progress: number;
  target: number;
  completed: boolean;
  claimable: boolean;
  adVerificationRequired: boolean;
}

export const getMyMissions = async (): Promise<MissionDto[]> =>
  (await apiClient.get<MissionDto[]>('/api/missions')).data;

export const checkIn = async () =>
  (await apiClient.post('/api/missions/attendance/check-in')).data;
