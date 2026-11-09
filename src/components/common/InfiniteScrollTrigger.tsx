import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

type InfiniteScrollTriggerProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  endMessage?: string;
};

/** 마지막 목록 항목 근처에 오면 다음 페이지를 자동 요청한다. */
export function InfiniteScrollTrigger({
  hasMore,
  isLoading,
  onLoadMore,
  endMessage = "마지막 목록입니다.",
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const canRequestRef = useRef(true);

  useEffect(() => {
    const target = triggerRef.current;
    if (!target || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 한 번 요청한 뒤에는 감지 영역이 화면 밖으로 나갔다가 다시 들어올 때만
        // 다음 페이지를 요청한다. 짧은 목록을 한 번 스크롤했을 때 전부 로드되는 것을 막는다.
        if (!entry.isIntersecting) {
          canRequestRef.current = true;
          return;
        }
        if (canRequestRef.current) {
          canRequestRef.current = false;
          onLoadMore();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div ref={triggerRef} className="flex min-h-16 items-center justify-center py-6 text-sm text-gray-500">
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-purple-600" /> : hasMore ? "더 불러오는 중..." : endMessage}
    </div>
  );
}
