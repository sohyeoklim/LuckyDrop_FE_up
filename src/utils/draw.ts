import type { DrawStatus } from "../types/draw";

const formatDiff = (diff: number) => {
  if (diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

export const getDrawStatusLabel = (status: DrawStatus) => {
  switch (status) {
    case "DRAFT":
      return "응모 예정";
    case "ACTIVE":
      return "응모 가능";
    case "DRAWING":
      return "추첨 중";
    case "CLOSE":
      return "응모 종료";
    case "CANCEL":
      return "취소됨";
    default:
      return "";
  }
};

export const getDrawTimeText = (
  status: DrawStatus,
  startAt: string,
  endAt: string
) => {
  const now = Date.now();

  if (status === "DRAFT") {
    const diff = new Date(startAt).getTime() - now;
    return `시작까지 ${formatDiff(diff)}`;
  }

  if (status === "ACTIVE") {
    const diff = new Date(endAt).getTime() - now;
    return formatDiff(diff);
  }

  if (status === "DRAWING") return "추첨 진행중";
  if (status === "CLOSE") return "응모 종료";
  if (status === "CANCEL") return "취소됨";

  return "";
};