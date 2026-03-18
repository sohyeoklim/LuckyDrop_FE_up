import { Link } from "react-router-dom";
import { Heart, Clock, Users, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

import type { DrawCardResponse } from "../../types/draw";
import { getDrawTimeText, getDrawStatusStyle } from "../../utils/draw";
import { getImageUrl } from "../../utils/image";
import { useToggleDrawBookmark } from "@/hooks/useToggleDrawBookmark";

interface DrawCardProps {
  draw: DrawCardResponse;
}

export function DrawCard({ draw }: DrawCardProps) {
  const { mutate: toggleBookmark, isPending } = useToggleDrawBookmark();

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

  const timeText = getDrawTimeText(draw.status, draw.startAt, draw.endAt);
  const { label, className } = getDrawStatusStyle(
    draw.status,
    draw.startAt,
    draw.endAt
  );

  return (
    <Link
      to={`/draws/${draw.drawId}`}
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group block"
    >
      <div className="relative">
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={getImageUrl(draw.imageUrl)}
            alt={draw.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes("/placeholder.png")) {
                target.src = "/placeholder.png";
              }
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleLike}
          disabled={isPending}
          className="absolute top-4 right-4 w-11 h-11 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Heart
            className={`w-6 h-6 ${
              draw.isBookmarked ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </button>

        <div className="absolute bottom-4 left-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${className}`}>
            {label}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1">
          {draw.productName}
        </h3>

        <p className="text-lg text-gray-600 mb-5 line-clamp-1">{draw.title}</p>

        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>{timeText}</span>
            </div>

            <div className="flex items-center gap-1 text-purple-600 font-semibold">
              <Ticket className="w-5 h-5" />
              <span>{draw.ticketCostEntry}T</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span>{draw.participantCount}명 응모</span>
            </div>

            <div className="flex items-center gap-1 text-red-500">
              <Heart className="w-5 h-5" />
              <span>{draw.bookmarkCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}