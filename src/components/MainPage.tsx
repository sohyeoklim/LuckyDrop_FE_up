import { useEffect, useState } from "react";
import { TopAppBar } from "@/components/TopAppBar";
import { HeroSection } from "@/components/draw/HeroSection";
import { DrawCard } from "@/components/draw/DrawCard";
import { TicketHistoryPreview } from "@/components/TicketHistoryPreview";
import { DrawResultCard } from "@/components/draw/DrawResultCard";
import { getDraws, getHotBanner } from "@/api/draw";
import type { DrawCardResponse } from "@/types/draw";
import type { TicketHistoryItem } from "@/components/TicketHistoryPreview";
import type { DrawResultItem } from "@/components/draw/DrawResultCard";
import type { HotBannerResponse } from "@/api/draw";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ticketHistory: TicketHistoryItem[] = [
  { id: 1, type: "지급", amount: 10, reason: "회원가입 보너스", date: "2026-01-19" },
  { id: 2, type: "사용", amount: -5, reason: "Apple Watch 응모", date: "2026-01-19" },
  { id: 3, type: "지급", amount: 5, reason: "출석 체크", date: "2026-01-18" },
  { id: 4, type: "사용", amount: -3, reason: "iPhone 15 응모", date: "2026-01-18" },
];

const drawResults: DrawResultItem[] = [
  {
    id: 1,
    title: "AirPods Pro",
    status: "당첨",
    message: "축하합니다! 🎉",
    date: "2026-01-15",
    image: "https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=400",
  },
  {
    id: 2,
    title: "Galaxy Buds",
    status: "미당첨",
    message: "다음 기회에 도전하세요!",
    date: "2026-01-12",
    image: "https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=400",
  },
];

export function MainPage() {
  const [userTickets] = useState(120);

  const [hotBanner, setHotBanner] = useState<HotBannerResponse | null>(null);
  const [ongoingDraws, setOngoingDraws] = useState<DrawCardResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [hotBannerLoading, setHotBannerLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [hotBannerError, setHotBannerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMainData = async () => {
      try {
        setLoading(true);
        setHotBannerLoading(true);
        setError(null);
        setHotBannerError(null);

        const [drawsData, hotBannerData] = await Promise.all([
          getDraws({
            tab: "ONGOING",
            page: 0,
            size: 6,
          }),
          getHotBanner(),
        ]);

        setOngoingDraws(drawsData.content);
        setHotBanner(hotBannerData);
      } catch (err) {
        console.error(err);
        setError("메인 화면 데이터를 불러오지 못했습니다.");
        setHotBannerError("핫 배너를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setHotBannerLoading(false);
      }
    };

    fetchMainData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopAppBar tickets={userTickets} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {hotBannerLoading && (
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <p className="text-gray-500">핫 배너 불러오는 중...</p>
          </div>
        )}

        {!hotBannerLoading && hotBannerError && (
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <p className="text-red-500">{hotBannerError}</p>
          </div>
        )}

        {!hotBannerLoading && !hotBannerError && hotBanner && (
          <HeroSection draw={hotBanner} userTickets={userTickets} />
        )}

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">진행 중인 드로우</h2>
            <button className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700">
              전체보기 →
            </button>
          </div>

          {loading && <p>불러오는 중...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ongoingDraws.map((draw) => (
                <DrawCard key={draw.drawId} draw={draw} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">티켓 내역</h2>
              <button className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700">
                전체보기 →
              </button>
            </div>
            <TicketHistoryPreview history={ticketHistory} />
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">최근 결과</h2>
              <button className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700">
                전체보기 →
              </button>
            </div>
            <div className="space-y-4">
              {drawResults.map((result) => (
                <DrawResultCard key={result.id} result={result} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2026 Luckydrop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}