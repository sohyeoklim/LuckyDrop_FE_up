import { Link } from "react-router-dom";
import Slider from "react-slick";
import { Heart, Clock, Ticket } from "lucide-react";
import { useToggleDrawBookmark } from "@/hooks/useToggleDrawBookmark";
import toast from "react-hot-toast";
import axios from "axios";

interface HotBannerResponse {
  drawId: number;
  reason: string;
  title: string;
  productName: string;
  images: string[];
  isBookmarked: boolean;
  ticketCostEntry: number;
  startAt: string;
  endAt: string;
}

interface HeroSectionProps {
  draw: HotBannerResponse;
  userTickets: number;
}

function getTimeLeft(endAt: string) {
  const now = new Date();
  const end = new Date(endAt);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "응모 마감";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

export function HeroSection({ draw, userTickets }: HeroSectionProps) {
  const { mutate: toggleBookmark, isPending } = useToggleDrawBookmark();

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const reasonTextMap: Record<string, string> = {
    UPCOMING_BOOKMARK: "🔥 시작 전부터 기대 폭발 중 🔥",
    ENDING_SOON: "⏰ 마감 임박! 마지막 기회! ⏰",
    POPULAR: "🔥 지금 제일 핫한 드로우 🔥",
  };

  const timeLeft = getTimeLeft(draw.endAt);
  const imageList =
    draw.images && draw.images.length > 0 ? draw.images : ["/placeholder.png"];

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
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
          toast.dismiss("bookmark");
          toast.success(nextBookmarked ? "북마크 추가" : "북마크 해제", {
            id: "bookmark",
          });
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
    <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative">
          <Slider {...sliderSettings}>
            {imageList.map((image, index) => (
              <div key={index} className="relative">
                <div className="aspect-square lg:aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100">
                  <img
                    src={image}
                    alt={`${draw.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("/placeholder.png")) {
                        target.src = "/placeholder.png";
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </Slider>

          <button
            type="button"
            onClick={handleLike}
            disabled={isPending}
            className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                draw.isBookmarked ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4 w-fit">
            🔥 HOT EVENT
          </div>

          {draw.reason && (
            <p className="text-sm text-pink-500 font-medium mb-2">
            {reasonTextMap[draw.reason] ?? draw.reason}
            </p>
          )}

          <p className="text-sm text-gray-500 mb-1">{draw.productName}</p>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            {draw.title}
          </h2>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">남은 시간</p>
                <p className="font-bold text-purple-600">{timeLeft}</p>
              </div>
            </div>

            <div className="h-10 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">필요 티켓</p>
                <p className="font-bold text-purple-600">
                  {draw.ticketCostEntry}장
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to={`/draws/${draw.drawId}`}
              className={`flex-1 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:scale-105 text-center ${
                userTickets < draw.ticketCostEntry
                  ? "bg-gray-400 cursor-not-allowed pointer-events-none"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl"
              }`}
            >
              지금 응모하기
            </Link>

            <div className="text-sm text-gray-600">
              보유 티켓:{" "}
              <span className="font-bold text-purple-600">{userTickets}장</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}