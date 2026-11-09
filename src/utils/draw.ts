import type { DrawStatus } from "../types/draw";

type DrawDisplayState =
  | "BEFORE_START"
  | "OPEN"
  | "DRAWING"
  | "CLOSE"
  | "CANCEL";

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

export function getDrawDisplayState(
  status: DrawStatus,
  startAt: string,
  endAt: string
): DrawDisplayState {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (status === "CANCEL") return "CANCEL";
  if (status === "DRAWING") return "DRAWING";
  if (status === "CLOSE") return "CLOSE";

  if (status === "DRAFT") return "BEFORE_START";

  if (status === "ACTIVE") {
    if (now < start) return "BEFORE_START";
    if (now >= start && now < end) return "OPEN";
    return "CLOSE";
  }

  if (now < start) return "BEFORE_START";
  if (now >= start && now < end) return "OPEN";
  return "CLOSE";
}

export function getDrawStatusStyle(
  status: DrawStatus,
  startAt: string,
  endAt: string
) {
  const displayState = getDrawDisplayState(status, startAt, endAt);

  switch (displayState) {
    case "OPEN":
      return {
        label: "응모 가능",
        className: "bg-green-100 text-green-800",
      };
    case "BEFORE_START":
      return {
        label: "응모 대기",
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
  endAt: string,
  now = Date.now()
) => {
  const displayState = getDrawDisplayState(status, startAt, endAt);

  if (displayState === "BEFORE_START") {
    const diff = new Date(startAt).getTime() - now;
    if (diff > 0) return `시작까지 ${formatDiff(diff)}`;
    return "응모 시작 처리 중";
    return "시작 전";
  }

  if (displayState === "OPEN") {
    const diff = new Date(endAt).getTime() - now;
    return formatDiff(diff);
  }

  if (displayState === "DRAWING") return "추첨 진행중";
  if (displayState === "CLOSE") return "응모 마감";
  if (displayState === "CANCEL") return "취소됨";

  return "";
};

export function isOpenDraw(
  status: DrawStatus,
  startAt: string,
  endAt: string
) {
  return getDrawDisplayState(status, startAt, endAt) === "OPEN";
}

export function getTimeLeftMinutesForSort(
  status: DrawStatus,
  startAt: string,
  endAt: string
) {
  const displayState = getDrawDisplayState(status, startAt, endAt);

  if (displayState !== "OPEN") return Number.MAX_SAFE_INTEGER;

  const now = Date.now();
  const end = new Date(endAt).getTime();
  const diff = end - now;

  if (diff <= 0) return 0;
  return Math.floor(diff / 1000 / 60);
}
