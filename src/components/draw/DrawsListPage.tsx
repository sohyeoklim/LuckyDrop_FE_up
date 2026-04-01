import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginRequired } from "@/components/providers/LoginRequiredProvider";
import { useToggleDrawBookmark } from "@/hooks/useToggleDrawBookmark";
import toast from "react-hot-toast";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  Filter,
  Clock,
  Ticket,
  Heart,
  Users,
  TrendingUp,
} from "lucide-react";
import { useDrawList } from "@/hooks/useDrawList";
import type { DrawSort } from "@/api/draw";
import type { DrawCardResponse } from "@/types/draw";
import { getImageUrl } from "@/utils/image";
import {
  getDrawStatusStyle,
  getDrawTimeText,
  isOpenDraw,
  getTimeLeftMinutesForSort,
} from "@/utils/draw";

type SortOption = "latest" | "deadline" | "popular" | "participant";

export function DrawsListPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);

  const serverSort: DrawSort = (() => {
    switch (sortOption) {
      case "latest":
        return "LATEST";
      case "deadline":
        return "ENDING_SOON";
      case "popular":
        return "BOOKMARK";
      case "participant":
        return "PARTICIPANT";
      default:
        return "LATEST";
    }
  })();

  const { data, isLoading, isError } = useDrawList({
    tab: "ALL",
    page: 0,
    size: 12,
    sort: serverSort,
  });

  const draws = data?.content ?? [];

  const filteredDraws = useMemo(() => {
    const keyword = searchQuery.toLowerCase().trim();

    let result = draws.filter((draw: DrawCardResponse) => {
      const matchesSearch =
        keyword === "" ||
        draw.title.toLowerCase().includes(keyword) ||
        draw.productName.toLowerCase().includes(keyword);

      const matchesStatus =
        !showOnlyOpen ||
        isOpenDraw(draw.status, draw.startAt, draw.endAt);

      return matchesSearch && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case "latest":
          return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
        case "deadline":
          return (
            getTimeLeftMinutesForSort(a.status, a.startAt, a.endAt) -
            getTimeLeftMinutesForSort(b.status, b.startAt, b.endAt)
          );
        case "popular":
          return b.bookmarkCount - a.bookmarkCount;
        case "participant":
          return b.participantCount - a.participantCount;
        default:
          return 0;
      }
    });

    return result;
  }, [draws, searchQuery, showOnlyOpen, sortOption]);

  const stats = useMemo(() => {
    return {
      total: draws.length,
      open: draws.filter((draw) =>
        isOpenDraw(draw.status, draw.startAt, draw.endAt)
      ).length,
      totalLikes: draws.reduce((sum, draw) => sum + draw.bookmarkCount, 0),
    };
  }, [draws]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-10">로딩중...</div>;
  }

  if (isError) {
    return <div className="min-h-screen bg-gray-50 p-10">에러 발생</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">전체 드로우</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600">전체 드로우</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}개</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">진행중</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.open}개</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-600">총 찜</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {stats.totalLikes}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="드로우 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="latest">최신순</option>
                <option value="deadline">마감 임박순</option>
                <option value="popular">인기순 (찜 기준)</option>
                <option value="participant">인기순 (응모자 기준)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyOpen}
                  onChange={(e) => setShowOnlyOpen(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  진행중인 드로우만 보기
                </span>
              </label>
            </div>
          </div>
        </div>

        {filteredDraws.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDraws.map((draw) => (
              <DrawListCardItem key={draw.drawId} draw={draw} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h2>
            <p className="text-gray-600">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function DrawListCardItem({ draw }: { draw: DrawCardResponse }) {
  const navigate = useNavigate();
  const { requireLogin } = useLoginRequired();
  const { mutate: toggleBookmark, isPending } = useToggleDrawBookmark();

  const detailPath = `/draws/${draw.drawId}`;

  const handleCardClick = () => {
    if (!requireLogin(detailPath)) return;
    navigate(detailPath);
  };

  const timeLeftText = getDrawTimeText(draw.status, draw.startAt, draw.endAt);
  const { label, className } = getDrawStatusStyle(
    draw.status,
    draw.startAt,
    draw.endAt
  );

  const handleBookmark = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    const nextBookmarked = !draw.isBookmarked;

    toggleBookmark(
      {
        drawId: draw.drawId,
        nextBookmarked,
      },
      {
        onSuccess: () => {
          toast.success(nextBookmarked ? "북마크 추가" : "북마크 해제");
        },
        onError: (error) => {
          console.error(error);

          if (axios.isAxiosError(error) && error.response?.status === 401) {
            toast.error("로그인이 필요한 서비스입니다.");
            return;
          }

          toast.error("북마크 처리 실패");
        },
      }
    );
  };

  return (
  <div
    role="button"
    tabIndex={0}
    onClick={handleCardClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick();
      }
    }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
  >
    <div className="relative">
      <img
        src={getImageUrl(draw.imageUrl)}
        alt={draw.title}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes("/placeholder.png")) {
            target.src = "/placeholder.png";
          }
        }}
      />

      <button
        type="button"
        onClick={handleBookmark}
        disabled={isPending}
        className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Heart
          className={`w-4 h-4 ${
            draw.isBookmarked ? "fill-red-500 text-red-500" : "text-gray-400"
          }`}
        />
        <span className="text-xs font-semibold text-gray-800">
          {draw.bookmarkCount}
        </span>
      </button>

      <div className="absolute bottom-3 left-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}
        >
          {label}
        </span>
      </div>
    </div>

    <div className="p-4">
      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
        {draw.title}
      </h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {draw.productName || "드로우 상품"}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{timeLeftText}</span>
          </div>

          <div className="flex items-center gap-1 text-purple-600 font-medium">
            <Ticket className="w-4 h-4" />
            <span>{draw.ticketCostEntry}T</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{draw.participantCount}명 응모</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}