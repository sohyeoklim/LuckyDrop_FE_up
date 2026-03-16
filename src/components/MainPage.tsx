import { useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { TopAppBar } from "@/components/TopAppBar";
import { HeroSection } from "@/components/draw/HeroSection";
import { DrawCard } from "@/components/draw/DrawCard";
import { useAuth } from "@/contexts/AuthContext";
import { useHotBanner } from "@/hooks/useHotBanner";
import { useOngoingDraws } from "@/hooks/useOngoingDraws";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export function MainPage() {
  const [userTickets] = useState(120);
  const { user } = useAuth();

  const {
    data: hotBanner,
    isLoading: hotBannerLoading,
    isError: isHotBannerError,
  } = useHotBanner();

  const {
    data: ongoingData,
    isLoading: ongoingLoading,
    isError: isOngoingError,
  } = useOngoingDraws();

  const ongoingDraws = ongoingData?.content ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopAppBar tickets={userTickets} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {hotBannerLoading && (
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <p className="text-gray-500">핫 배너 불러오는 중...</p>
          </div>
        )}

        {!hotBannerLoading && isHotBannerError && (
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <p className="text-red-500">핫 배너를 불러오지 못했습니다.</p>
          </div>
        )}

        {!hotBannerLoading && !isHotBannerError && hotBanner && (
          <HeroSection draw={hotBanner} userTickets={userTickets} />
        )}

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">진행 중인 드로우</h2>
            <Link
              to="/draws"
              className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
            >
              전체보기 →
            </Link>
          </div>

          {ongoingLoading && <p>불러오는 중...</p>}

          {!ongoingLoading && isOngoingError && (
            <p className="text-red-500">메인 화면 데이터를 불러오지 못했습니다.</p>
          )}

          {!ongoingLoading && !isOngoingError && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ongoingDraws.map((draw) => (
                <DrawCard key={draw.drawId} draw={draw} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2026 Luckydrop. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {user?.role === "HOST" && (
        <Link
          to="/draws/create"
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3.5 text-white shadow-lg transition-all duration-200 group hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-xs">
            드로우 생성
          </span>
        </Link>
      )}
    </div>
  );
}