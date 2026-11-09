import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export function useDrawStatusEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/draws/events`, {
      withCredentials: true,
    });

    const handleStatusChanged = () => {
      void queryClient.invalidateQueries({ queryKey: ["draws"] });
      void queryClient.invalidateQueries({ queryKey: ["draw"] });
      void queryClient.invalidateQueries({ queryKey: ["draw-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["drawWinners"] });
    };

    eventSource.addEventListener("draw-status-changed", handleStatusChanged);

    return () => {
      eventSource.removeEventListener("draw-status-changed", handleStatusChanged);
      eventSource.close();
    };
  }, [queryClient]);
}
