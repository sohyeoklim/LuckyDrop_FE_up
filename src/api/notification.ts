import apiClient from "@/api/client";

export type NotificationType = "DRAWING_STARTED" | "DRAW_WON" | "DRAW_NOT_WON";

export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  drawId: number | null;
  read: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  content: AppNotification[];
  unreadCount: number;
};

export async function getNotifications(): Promise<NotificationListResponse> {
  const response = await apiClient.get<NotificationListResponse>("/api/notifications");
  return response.data;
}

export async function markNotificationRead(notificationId: number) {
  await apiClient.patch(`/api/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead() {
  await apiClient.patch("/api/notifications/read-all");
}
