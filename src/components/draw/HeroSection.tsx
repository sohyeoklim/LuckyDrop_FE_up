import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { Heart, Clock, Ticket } from "lucide-react";
import { useToggleDrawBookmark } from "@/hooks/useToggleDrawBookmark";
import { getImageUrl } from "@/utils/image";
import { useLoginRequired } from "@/components/providers/LoginRequiredProvider";
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
  draw?: HotBannerResponse;
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
  const navigate = useNavigate();
  const { requireLogin } = useLoginRequired();
  const { mutate: toggleBookmark, isPending } = useToggleDrawBookmark();
  const hasHotDraw = !!draw?.drawId;

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

  const handleGoDraws = () => {
    navigate("/draws");
  };

  const handleGoDetail = () => {
    if (!draw) return;

    const detailPath = `/draws/${draw.drawId}`;
    if (!requireLogin(detailPath)) return;
    navigate(detailPath);
  };

  const handleEntry = () => {
    if (!draw) return;

    const detailPath = `/draws/${draw.drawId}`;
    if (!requireLogin(detailPath)) return;
    navigate(detailPath);
  };

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!draw) return;

    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    const detailPath = `/draws/${draw.drawId}`;
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
            requireLogin(detailPath);
            return;
          }

          toast.error("북마크 처리 실패");
        },
      }
    );
  };

  const timeLeft = draw ? getTimeLeft(draw.endAt) : "";
  const imageList =
    draw && draw.images && draw.images.length > 0
      ? draw.images.map((img) => getImageUrl(img))
      : ["/placeholder.png"];

  return (
    <div className="space-y-6">
      {/* 항상 보이는 기본 히어로 */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-8 py-10 lg:px-12 lg:py-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold mb-4">
              🎁 LuckyDrop
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
              티켓으로 참여하고,
              <br />
              행운의 주인공이 되어봐
            </h1>

            <p className="text-white/90 text-base lg:text-lg mb-6 leading-relaxed">
              다양한 상품 드로우에 응모하고 당첨 기회를 잡아봐.
              <br />
              지금 진행 중인 이벤트와 인기 드로우를 한눈에 확인할 수 있어.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleGoDraws}
                className="px-6 py-3 rounded-xl bg-white text-purple-600 font-bold shadow-md hover:scale-105 transition-transform"
              >
                드로우 보러가기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 핫 드로우가 있을 때만 추가 노출 */}
      {hasHotDraw  && (
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
                    draw.isBookmarked
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600"
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
                <button
                  type="button"
                  onClick={handleGoDetail}
                  className="px-6 py-4 rounded-xl font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  상세 보기
                </button>

                <button
                  type="button"
                  onClick={handleEntry}
                  disabled={userTickets < draw.ticketCostEntry}
                  className={`flex-1 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all text-center ${
                    userTickets < draw.ticketCostEntry
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 hover:shadow-xl"
                  }`}
                >
                  지금 응모하기
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}