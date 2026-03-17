// utils/image.ts
import apiClient from "@/api/client";

const BASE_URL = apiClient.defaults.baseURL!;

export function getImageUrl(path?: string) {
  if (!path) return "/placeholder.png";

  if (path.startsWith("http")) return path;

  return BASE_URL + path;
}