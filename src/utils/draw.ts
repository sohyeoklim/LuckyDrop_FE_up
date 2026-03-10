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

export function getDrawStatusStyle(status: DrawStatus) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "응모 가능",
        className: "bg-green-100 text-green-800",
      };
    case "DRAFT":
      return {
        label: "응모 예정",
        className: "bg-blue-100 text-blue-800",
      };
    case "DRAWING":
      return {
        label: "추첨 중",
        className: "bg-yellow-100 text-yellow-800",
      };
    case "CLOSE":
      return {
        label: "응모 마감",
        className: "bg-gray-100 text-gray-800",
      };
    case "CANCEL":
      return {
        label: "취소됨",
        className: "bg-red-100 text-red-800",
      };
    default:
      return {
        label: "",
        className: "",
      };
  }
}

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