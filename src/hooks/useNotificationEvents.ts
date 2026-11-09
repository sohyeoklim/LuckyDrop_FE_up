import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { AppNotification } from "@/api/notification";
import { notificationQueryKey } from "@/hooks/useNotifications";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export function useNotificationEvents() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    const eventSource = new EventSource(`${API_BASE_URL}/api/notifications/stream`, {
      withCredentials: true,
    });

    const handleNotification = (event: Event) => {
      const notification = JSON.parse((event as MessageEvent<string>).data) as AppNotification;
      toast(notification.title, { icon: "🔔" });
      void queryClient.invalidateQueries({ queryKey: notificationQueryKey });
    };

    eventSource.addEventListener("notification", handleNotification);
    return () => {
      eventSource.removeEventListener("notification", handleNotification);
      eventSource.close();
    };
  }, [isAuthenticated, queryClient]);
}
