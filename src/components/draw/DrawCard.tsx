import { useNavigate } from "react-router-dom";
import { Heart, Clock, Users, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

import type { DrawCardResponse } from "../../types/draw";
import { getDrawTimeText, getDrawStatusStyle } from "../../utils/draw";
import { getImageUrl } from "../../utils/image";
import { useToggleDrawBookmark } from "@/hooks/useToggleDrawBookmark";
import { useLoginRequired } from "@/components/providers/LoginRequiredProvider";
import { useCurrentTime } from "@/hooks/useCurrentTime";

interface DrawCardProps {
  draw: DrawCardResponse;
}

export function DrawCard({ draw }: DrawCardProps) {
  const navigate = useNavigate();
  const { requireLogin } = useLoginRequired();
  const { mutate: toggleBookmark, isPending } = useToggleDrawBookmark();
  const now = useCurrentTime();

  const detailPath = `/draws/${draw.drawId}`;

  const handleCardClick = () => {
    if (!requireLogin(detailPath)) return;
    navigate(detailPath);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

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
            requireLogin(detailPath);
            return;
          }

          toast.error("북마크 처리 실패");
        },
      }
    );
  };

  const timeText = getDrawTimeText(draw.status, draw.startAt, draw.endAt, now);
  const { label, className } = getDrawStatusStyle(
    draw.status,
    draw.startAt,
    draw.endAt
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="overflow-hidden rounded-2xl border border-[#30344b] bg-[#191b2b] shadow-lg shadow-black/20 transition-all hover:-translate-y-1 hover:border-[#00d68a]/60 hover:shadow-[0_16px_40px_rgba(0,0,0,.32)] group block cursor-pointer"
    >
      <div className="relative">
        <div className="aspect-[4/3] bg-[#23263a] overflow-hidden">
          <img
            src={getImageUrl(draw.imageUrl)}
            alt={draw.title}
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
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
          className="absolute top-4 right-4 h-10 min-w-10 px-3 bg-[#10121f]/95 border border-white/40 rounded-xl flex items-center justify-center gap-1.5 text-white shadow-md hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Heart
            className={`w-6 h-6 ${
              draw.isBookmarked ? "fill-red-400 text-red-400" : "text-white"
            }`}
          />
          <span className="text-sm font-black text-white tabular-nums">
            {draw.bookmarkCount}
          </span>
        </button>

        <div className="absolute bottom-4 left-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${className}`}>
            {label}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-black text-white mb-2 line-clamp-1">
          {draw.productName}
        </h3>

        <p className="text-sm text-[#aeb4c7] mb-5 line-clamp-1">{draw.title}</p>

        <div className="space-y-3 border-t border-[#30344b] pt-4">
          <div className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2 text-[#aeb4c7]">
              <Clock className="w-5 h-5" />
              <span>{timeText}</span>
            </div>

            <div className="flex items-center gap-1 text-[#00d68a] font-black">
              <Ticket className="w-5 h-5" />
              <span>{draw.ticketCostEntry}T</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2 text-[#aeb4c7]">
              <Users className="w-5 h-5" />
              <span>{draw.participantCount}명 응모</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
