import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { TopAppBar } from "@/components/TopAppBar";
import { HeroSection } from "@/components/HeroSection";
import { DrawCard } from "@/components/draw/DrawCard";
import { getDraws } from "@/api/draw";
import { useAuth } from "@/contexts/AuthContext";
import type { DrawCardResponse } from "@/types/draw";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const heroDrawData = {
  id: 1,
  title: "Apple Watch Ultra",
  description: "최신 스마트워치의 끝판왕",
  images: [
    "https://images.unsplash.com/photo-1670177257750-9b47927f68eb?w=800",
    "https://images.unsplash.com/photo-1699265837122-7636e128b4b0?w=800",
  ],
  ticketCost: 5,
  timeLeft: "23:45:12",
  liked: false,
};

export function MainPage() {
  const [userTickets] = useState(120);
  const [ongoingDraws, setOngoingDraws] = useState<DrawCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDraws({ tab: "ONGOING", page: 0, size: 6 });
        setOngoingDraws(data.content);
      } catch (err) {
        console.error(err);
        setError("드로우 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDraws();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopAppBar tickets={userTickets} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <HeroSection draw={heroDrawData} userTickets={userTickets} />

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
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2026 Luckydrop. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* HOST 전용 FAB */}
      {user?.role === 'HOST' && (
        <Link
          to="/draws/create"
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3.5 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-xl transition-all duration-200 group"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-sm font-semibold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            드로우 생성
          </span>
        </Link>
      )}
    </div>
  );
}
