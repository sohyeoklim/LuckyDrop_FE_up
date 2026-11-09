import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Ticket,
  Heart,
  Users,
  AlertCircle,
  ShieldCheck,
  Pencil,
  Trash2,
} from "lucide-react";
import Slider from "react-slick";
import toast from "react-hot-toast";
import { getImageUrl } from "@/utils/image";
import { useEntryDraw } from "@/hooks/useEntryDraw";
import { useToggleDrawBookmark } from "@/hooks/useToggleDrawBookmark";
import { useDrawDetail } from "@/hooks/useDrawDetail";
import { useDrawWinners } from "@/hooks/useDrawWinners";
import type { DrawStatus } from "@/types/draw";
import type { HostWinnerInfoResponse, MyDeliveryResponse, MyRewardResponse } from "@/types/draw";
import apiClient, { getMe } from "@/api/client";
import { useCurrentTime } from "@/hooks/useCurrentTime";

function getStatusBadge(status: DrawStatus) {
  const badges = {
    DRAFT: { text: "응모 대기", color: "bg-gray-100 text-gray-800" },
    ACTIVE: { text: "응모 가능", color: "bg-green-100 text-green-800" },
    DRAWING: { text: "추첨 중", color: "bg-yellow-100 text-yellow-800" },
    CLOSE: { text: "종료", color: "bg-blue-100 text-blue-800" },
    CANCEL: { text: "취소됨", color: "bg-red-100 text-red-800" },
  };

  const badge = badges[status];

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
      {badge.text}
    </span>
  );
}

function getTimeLeftText(status: DrawStatus, startAt: string, endAt: string, now: number) {
  if (status === "DRAFT") {
    const diff = new Date(startAt).getTime() - now;
    if (diff <= 0) return "시작 처리 중";
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `시작까지 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  if (status !== "ACTIVE") {
    if (status === "DRAFT") return "시작 전";
    if (status === "DRAWING") return "추첨 중";
    if (status === "CLOSE") return "종료";
    if (status === "CANCEL") return "취소됨";
    return "-";
  }

  const end = new Date(endAt);
  const diff = end.getTime() - now;

  if (diff <= 0) return "종료";

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return `${hours}시간 ${minutes}분`;
}

export function DrawDetailPage() {
  const { drawId } = useParams<{ drawId: string }>();
  const navigate = useNavigate();

  const [entryCount, setEntryCount] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const now = useCurrentTime();

  const [hostWinnerInfo, setHostWinnerInfo] = useState<HostWinnerInfoResponse[]>([]);
  const [hostWinnersLoading, setHostWinnersLoading] = useState(false);
  const [hostWinnersError, setHostWinnersError] = useState(false);
  const [myDelivery, setMyDelivery] = useState<MyDeliveryResponse | null>(null);
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [myReward, setMyReward] = useState<MyRewardResponse | null>(null);
  const [rewardImageUrl, setRewardImageUrl] = useState<string | null>(null);
  const [rewardWinnerId, setRewardWinnerId] = useState<number | null>(null);
  const [rewardDeliveryType, setRewardDeliveryType] = useState<"CODE" | "MESSAGE" | "IMAGE">("CODE");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardContent, setRewardContent] = useState("");
  const [rewardImage, setRewardImage] = useState<File | null>(null);
  const [rewardConfirmOpen, setRewardConfirmOpen] = useState(false);
  const [rewardSubmitting, setRewardSubmitting] = useState(false);

  const { data: draw, isLoading, isError } = useDrawDetail(drawId);
  const { data: winnerData, isLoading: winnersLoading } = useDrawWinners(
  Number(drawId),
  draw?.status === "CLOSE" && showWinnerModal
  );
  const { mutate: entry } = useEntryDraw();
  const { mutate: toggleBookmark, isPending: isBookmarkPending } =
    useToggleDrawBookmark();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await getMe();
        setCurrentUserId(me.id);
      } catch (error) {
        console.error("내 정보 조회 실패:", error);
        setCurrentUserId(null);
      } finally {
        setMeLoaded(true);
      }
    };

    fetchMe();
  }, []);

  const isMine = !!currentUserId && currentUserId === draw?.hostUserId;
  
  useEffect(() => {
  const fetchHostWinnerInfo = async () => {
    if (!drawId || !showWinnerModal || !isMine || draw?.shippable || draw?.status !== "CLOSE") return;

    try {
      setHostWinnersLoading(true);
      setHostWinnersError(false);

      const response = await apiClient.get<HostWinnerInfoResponse[]>(
        `/api/host/draws/${drawId}/winners`
      );

      setHostWinnerInfo(response.data ?? []);
    } catch (error) {
      console.error("호스트용 당첨자 정보 조회 실패:", error);
      setHostWinnersError(true);
      setHostWinnerInfo([]);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("로그인이 필요한 서비스입니다.");
          return;
        }
        if (error.response?.status === 403) {
          toast.error("해당 드로우의 호스트만 조회할 수 있습니다.");
          return;
        }
      }

      toast.error("당첨자 정보를 불러오지 못했습니다.");
    } finally {
      setHostWinnersLoading(false);
    }
  };

  fetchHostWinnerInfo();
}, [drawId, draw?.status, isMine, showWinnerModal]);

  useEffect(() => {
    if (!drawId || !currentUserId || draw?.status !== "CLOSE" || !draw) return;
    if (!draw.shippable) {
      apiClient.get<MyRewardResponse>(`/api/draws/${drawId}/my-reward`)
        .then(({ data, status }) => setMyReward(status === 204 || !data ? null : data))
        .catch(() => setMyReward(null));
      return;
    }
    apiClient.get<MyDeliveryResponse>(`/api/draws/${drawId}/my-delivery`)
      .then(({ data, status }) => {
        if (status === 204 || !data) {
          setMyDelivery(null);
          return;
        }
        setMyDelivery(data);
        setDeliveryPhone(data.phone ?? "");
        setDeliveryAddress(data.address ?? "");
      })
      .catch(() => setMyDelivery(null));
  }, [drawId, draw?.status, draw?.shippable, currentUserId]);

  useEffect(() => {
    if (!myReward?.imageAvailable) {
      setRewardImageUrl(null);
      return;
    }
    let imageUrl: string | null = null;
    apiClient.get(`/api/rewards/${myReward.rewardId}/image`, { responseType: "blob" })
      .then(({ data }) => {
        imageUrl = URL.createObjectURL(data);
        setRewardImageUrl(imageUrl);
      })
      .catch(() => {
        setRewardImageUrl(null);
        toast.error("보상 이미지를 불러오지 못했습니다.");
      });
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [myReward?.rewardId, myReward?.imageAvailable]);

  const deliverReward = async () => {
    if (!drawId || !rewardWinnerId || rewardSubmitting) return;
    setRewardSubmitting(true);
    const formData = new FormData();
    formData.append("deliveryType", rewardDeliveryType);
    formData.append("title", rewardTitle);
    if (rewardDeliveryType === "IMAGE") {
      if (!rewardImage) {
        toast.error("기프티콘 이미지를 선택해주세요.");
        setRewardSubmitting(false);
        return;
      }
      formData.append("image", rewardImage);
    } else {
      formData.append("content", rewardContent);
    }
    try {
      await apiClient.post(`/api/host/draws/${drawId}/winners/${rewardWinnerId}/reward`, formData);
      const deliveredAt = new Date().toISOString();
      setHostWinnerInfo((current) => current.map((winner) => winner.winnerId === rewardWinnerId
        ? { ...winner, fulfillmentStatus: "REWARD_DELIVERED", rewardTitle, rewardDeliveryType, rewardDeliveredAt: deliveredAt }
        : winner));
      setRewardConfirmOpen(false);
      setRewardWinnerId(null);
      toast.success("보상을 전달했습니다. 이후에는 변경할 수 없습니다.");
    } catch {
      toast.error("보상을 전달하지 못했습니다.");
    } finally {
      setRewardSubmitting(false);
    }
  };

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

  const handleLike = () => {
    if (!drawId || !draw) return;
    if (isBookmarkPending) return;

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">불러오는 중...</p>
      </div>
    );
  }

  if (isError || !draw) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">드로우를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const canEdit =
    isMine &&
    draw.status === "DRAFT" &&
    new Date() < new Date(draw.startAt) &&
    draw.participantCount === 0;

  const canDelete =
    isMine &&
    (
      draw.status === "DRAFT" ||
      (draw.status === "ACTIVE" && draw.participantCount === 0)
    );

  const userTickets = draw.myTicketBalance ?? 0;
  const totalCost = draw.ticketCostEntry * entryCount;
  const remainingTickets = userTickets - totalCost;
  const timeLeftText = getTimeLeftText(draw.status, draw.startAt, draw.endAt, now);
  const imageList = draw.images?.length
    ? draw.images.map((img) => getImageUrl(img))
    : ["/placeholder.png"];

  const handleEntry = () => {
    if (!draw || !drawId) return;

    if (draw.status !== "ACTIVE") {
      toast.error("현재 응모할 수 없는 드로우입니다.");
      return;
    }

    if (entryCount < 1) {
      toast.error("응모 횟수는 1 이상이어야 합니다.");
      return;
    }

    const entryTotalCost = draw.ticketCostEntry * entryCount;

    if (userTickets < entryTotalCost) {
      toast.error("티켓이 부족합니다.");
      return;
    }

    const confirmed = window.confirm(
    `정말 ${entryCount}회 응모하시겠습니까?\n응모 후에는 취소할 수 없습니다.`
    );

     if (!confirmed) return;

    const idempotencyKey = crypto.randomUUID();

    entry(
      {
        drawId: Number(drawId),
        count: entryCount,
        idempotencyKey,
      },
      {
        onSuccess: () => {
          toast.success(`${entryCount}회 응모 완료! (${entryTotalCost} 티켓 사용)`);
          navigate("/my/entries");
        },
        onError: (error) => {
          console.error(error);

          if (axios.isAxiosError(error) && error.response?.status === 401) {
            toast.error("로그인이 필요한 서비스입니다.");
            return;
          }

          toast.error("응모 실패");
        },
      }
    );
  };

  const handleEdit = () => {
    if (!canEdit) {
      toast.error("현재 이 드로우는 수정할 수 없습니다.");
      return;
    }

    navigate(`/draws/${draw.drawId}/edit`);
  };

    const handleDelete = async () => {
    if (!canDelete) {
      toast.error("현재 이 드로우는 삭제할 수 없습니다.");
      return;
    }

    const confirmed = window.confirm(
      "정말 이 드로우를 삭제하시겠습니까?\n삭제 후에는 되돌릴 수 없습니다."
    );

    if (!confirmed) return;

    try {
      await apiClient.delete(`/api/draws/${draw.drawId}`);

      toast.success("드로우가 삭제되었습니다.");
      navigate("/draws");
    } catch (error) {
      console.error("드로우 삭제 실패:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("로그인이 필요한 서비스입니다.");
          return;
        }

        if (error.response?.status === 403) {
          toast.error("본인이 만든 드로우만 삭제할 수 있습니다.");
          return;
        }

        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || "삭제할 수 없는 드로우입니다.");
          return;
        }

        if (error.response?.status === 404) {
          toast.error("존재하지 않는 드로우입니다.");
          return;
        }
      }

      toast.error("드로우 삭제에 실패했습니다.");
    }
  };

  return (
  <div className="min-h-screen bg-gray-50">
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <button
            onClick={() => navigate("/draws")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">돌아가기</span>
          </button>
        </div>
      </div>
    </header>

    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
            <div className="absolute top-4 left-4 z-20">
              {getStatusBadge(draw.status)}
            </div>

            <button
              type="button"
              onClick={handleLike}
              disabled={isBookmarkPending}
              className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  draw.isBookmarked ? "fill-red-500 text-red-500" : "text-gray-400"
                }`}
              />
              <span className="text-sm font-semibold text-gray-800">
                {draw.bookmarkCount}
              </span>
            </button>

            <Slider {...sliderSettings}>
              {imageList.map((image, index) => (
                <div key={index}>
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={image}
                      alt={`${draw.productName} ${index + 1}`}
                      className="block w-full h-full object-cover"
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
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">남은 시간</p>
              <p className="text-lg font-bold text-gray-900 break-words [overflow-wrap:anywhere]">
                {timeLeftText}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">응모자 수</p>
              <p className="text-lg font-bold text-gray-900 break-words [overflow-wrap:anywhere]">
                {draw.participantCount}명
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
              <Ticket className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">총 응모권</p>
              <p className="text-lg font-bold text-gray-900 break-words [overflow-wrap:anywhere]">
                {draw.totalEntryCount.toLocaleString()}개
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
              <Ticket className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">응모 비용</p>
              <p className="text-lg font-bold text-gray-900 break-words [overflow-wrap:anywhere]">
                {draw.ticketCostEntry}T
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-1">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 break-words [overflow-wrap:anywhere]">
                  {draw.title}
                </h1>
              </div>
            </div>

            {draw.hostNickname && (
              <p className="mb-5 text-[12px] text-gray-500 break-words [overflow-wrap:anywhere]">
                DRAW BY {draw.hostNickname}
              </p>
            )}

            <p className="text-gray-600 break-words [overflow-wrap:anywhere]">
              {draw.description}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-sm text-gray-500 mb-1 break-words [overflow-wrap:anywhere]">
              {draw.brand}
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-2 break-words [overflow-wrap:anywhere]">
              {draw.productName}
            </h2>
            <p className="text-sm text-gray-600 break-words [overflow-wrap:anywhere]">
              소비자 가격: {new Intl.NumberFormat("ko-KR").format(draw.price)}원
            </p>
          </div>

          {draw.status === "ACTIVE" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">응모하기</h3>

              <div className="mb-4 text-sm text-gray-600">
                당첨 인원{" "}
                <span className="font-semibold text-gray-900">
                  {draw.winnerCount}명
                </span>
              </div>

              {draw.isEntered && (
                <div className="mb-4 rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
                  <p className="text-sm text-purple-700 font-medium break-words [overflow-wrap:anywhere]">
                    현재 해당 드로우에 {draw.entryCount}회 응모
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  응모 횟수
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setEntryCount(Math.max(1, entryCount - 1))}
                    className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    value={entryCount}
                    onChange={(e) =>
                      setEntryCount(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    className="w-20 text-center border border-gray-300 rounded-lg py-2"
                    min="1"
                  />

                  <button
                    type="button"
                    onClick={() => setEntryCount(entryCount + 1)}
                    className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2 gap-3">
                  <span className="text-sm text-gray-600 shrink-0">보유 티켓</span>
                  <span className="text-sm font-medium text-gray-900 break-words [overflow-wrap:anywhere] text-right">
                    {userTickets}T
                  </span>
                </div>

                <div className="flex justify-between items-center mb-2 gap-3">
                  <span className="text-sm text-gray-600 shrink-0">사용 티켓</span>
                  <span className="text-sm font-medium text-purple-600 break-words [overflow-wrap:anywhere] text-right">
                    {totalCost}T
                  </span>
                </div>

                <div className="pt-2 border-t border-purple-200">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 shrink-0">
                      남은 티켓
                    </span>
                    <span className="text-sm font-bold text-gray-900 break-words [overflow-wrap:anywhere] text-right">
                      {remainingTickets}T
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEntry}
                disabled={userTickets < totalCost}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed break-words [overflow-wrap:anywhere]"
              >
                {userTickets < totalCost
                  ? "티켓이 부족합니다"
                  : draw.isEntered
                  ? `${entryCount}회 추가 응모하기`
                  : `${entryCount}회 응모하기`}
              </button>
            </div>
          )}

          {draw.status !== "ACTIVE" && (
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />

            <p className="text-gray-600 break-words [overflow-wrap:anywhere]">
              {draw.status === "DRAFT" && "아직 응모 시작 전입니다."}
              {draw.status === "DRAWING" && "추첨이 진행 중입니다."}
              {draw.status === "CLOSE" && "드로우가 종료되었습니다."}
             {draw.status === "CANCEL" && "드로우가 취소되었습니다. 티켓이 환불됩니다."}
            </p>

          {draw.status === "CLOSE" && (
            <button
              onClick={() => setShowWinnerModal(true)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              당첨자 목록 확인하기
            </button>
          )}
        </div>
      )}

        {draw.status !== "CANCEL" && (
          <section className="hidden mt-5 rounded-2xl border border-[#00d68a]/30 bg-[#00d68a]/10 p-5">
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-xl bg-[#00d68a]/15 p-2 text-[#00d68a]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                {draw.status === "CLOSE" ? (
                  <>
                    <h3 className="font-bold text-gray-900">자동 공정 추첨 완료</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600">총 {draw.participantCount.toLocaleString()}명의 참여를 기준으로 시스템이 자동 추첨했어요.</p>
                    <p className="mt-2 text-xs text-gray-500">응모 마감 시각 · {new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(draw.endAt))}</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-gray-900">자동 공정 추첨</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600">마감 후 시스템이 무작위로 당첨자를 선정합니다. 운영자는 결과를 직접 변경할 수 없어요.</p>
                  </>
                )}
                <details className="mt-3 text-sm text-[#00d68a]">
                  <summary className="cursor-pointer font-semibold">추첨 방식 보기</summary>
                  <p className="mt-2 leading-6 text-gray-600">모든 응모는 동일한 기준으로 반영되며, 마감 이후에 자동 추첨과 결과 기록이 진행됩니다.</p>
                </details>
              </div>
            </div>
          </section>
        )}
        </div>
      </div>

      {draw.status !== "CANCEL" && (
        <section className="mt-8 rounded-2xl border border-[#00d68a]/30 bg-[#00d68a]/10 p-5 sm:p-6">
          <div className="flex gap-3 sm:gap-4">
            <div className="shrink-0 rounded-xl bg-[#00d68a]/15 p-2.5 text-[#00d68a]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              {draw.verification?.status === "VERIFIED" ? (
                <>
                  <h2 className="text-lg font-black text-gray-900">검증 가능한 공정 추첨 완료</h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">응모 마감 전에 고정된 기준으로 총 {draw.participantCount.toLocaleString()}명, {draw.totalEntryCount.toLocaleString()}개 응모권을 자동 추첨했어요.</p>
                  <p className="mt-2 text-xs text-gray-500">추첨 완료 · {draw.verification.drawnAt ? new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(draw.verification.drawnAt)) : "기록됨"}</p>
                </>
              ) : draw.verification?.status === "PENDING" ? (
                <>
                  <h2 className="text-lg font-black text-gray-900">검증 가능한 공정 추첨</h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">응모 마감 전에 추첨 기준을 고정했습니다. 마감 후에는 그 기준으로 자동 추첨돼요.</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-black text-gray-900">자동 공정 추첨</h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">마감 후 시스템이 무작위로 당첨자를 선정합니다. 운영자는 결과를 직접 변경할 수 없어요.</p>
                </>
              )}
              <details className="mt-3 text-sm text-[#00d68a]">
                <summary className="cursor-pointer font-semibold">검증 정보 보기</summary>
                <p className="mt-2 leading-6 text-gray-600">응모 횟수에 비례한 가중 무작위 추첨으로, 한 사용자는 한 번만 당첨될 수 있어요.</p>
                {draw.verification?.status === "PENDING" && draw.verification.commitment && (
                  <p className="mt-2 text-xs text-gray-500 break-all">추첨 전 고정값: {draw.verification.commitment}</p>
                )}
                {draw.verification?.status === "VERIFIED" && (
                  <div className="mt-3 space-y-2 text-xs text-gray-500 break-all">
                    <p>추첨 전 고정값: {draw.verification.commitment}</p>
                    <p>추첨 재현용 코드: {draw.verification.revealedCode}</p>
                    <p>참여 기록 검증값: {draw.verification.participantSnapshotHash}</p>
                  </div>
                )}
                {(!draw.verification || draw.verification.status === "LEGACY") && (
                  <p className="mt-2 text-xs text-gray-500">이 드로우는 검증 기능 도입 전에 생성되어, 추첨 전 고정값을 제공하지 않습니다.</p>
                )}
              </details>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">상품</h2>
        
        <p className="text-gray-600 leading-relaxed mb-6 break-words [overflow-wrap:anywhere]">
          {draw.productDescription}
        </p>

        <h3 className="text-xl font-bold text-gray-900 mb-3">상세 정보</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-gray-600">
            <span className="text-purple-600 font-bold">•</span>
            <span className="break-words [overflow-wrap:anywhere]">
              브랜드: {draw.brand}
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-600">
            <span className="text-purple-600 font-bold">•</span>
            <span className="break-words [overflow-wrap:anywhere]">
              상품명: {draw.productName}
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-600">
            <span className="text-purple-600 font-bold">•</span>
            <span className="break-words [overflow-wrap:anywhere]">
              당첨 인원: {draw.winnerCount}명
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-600">
            <span className="text-purple-600 font-bold">•</span>
            <span className="break-words [overflow-wrap:anywhere]">
              응모 시작:{" "}
              {new Intl.DateTimeFormat("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(draw.startAt))}
            </span>
          </li>
          <li className="flex items-start gap-2 text-gray-600">
            <span className="text-purple-600 font-bold">•</span>
            <span className="break-words [overflow-wrap:anywhere]">
              응모 종료:{" "}
              {new Intl.DateTimeFormat("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(draw.endAt))}
            </span>
          </li>
        </ul>
      </div>
        {(canEdit || canDelete) && (
          <div className="fixed bottom-10 right-[calc((100vw-1152px)/2-80px)] z-50 flex flex-col gap-2">
    
          {canEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors"
            >
              <Pencil className="w-4 h-4" />
               수정
              </button>
          )}
          {canDelete && (
           <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors"
            >
            <Trash2 className="w-4 h-4" />
             삭제
           </button>
          )}
        </div>
      )}   

      {rewardWinnerId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <form className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-xl" onKeyDown={(event) => {
            if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault();
          }} onSubmit={(event) => {
            event.preventDefault();
            if (rewardDeliveryType === "IMAGE") {
              if (!rewardImage) {
                toast.error("기프티콘 이미지를 선택해주세요.");
                return;
              }
            }
            setRewardConfirmOpen(true);
          }}>
            <div>
              <h3 className="text-lg font-bold">당첨 보상 전달</h3>
              <p className="mt-1 text-sm text-gray-500">전달 후 보상 내용은 변경할 수 없습니다.</p>
            </div>
            <select value={rewardDeliveryType} onChange={(event) => setRewardDeliveryType(event.target.value as "CODE" | "MESSAGE" | "IMAGE")} className="w-full rounded border px-3 py-2">
              <option value="CODE">쿠폰 코드</option>
              <option value="MESSAGE">안내문</option>
              <option value="IMAGE">이미지형 기프티콘</option>
            </select>
            <input required value={rewardTitle} onChange={(event) => setRewardTitle(event.target.value)} placeholder="보상명" className="w-full rounded border px-3 py-2" />
            {rewardDeliveryType === "IMAGE" ? (
              <input required type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(event) => setRewardImage(event.target.files?.[0] ?? null)} className="w-full text-sm" />
            ) : (
              <textarea required value={rewardContent} onChange={(event) => setRewardContent(event.target.value)} placeholder={rewardDeliveryType === "CODE" ? "쿠폰 코드를 입력하세요" : "당첨자에게 전달할 안내를 입력하세요"} className="min-h-28 w-full rounded border px-3 py-2" />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => { setRewardConfirmOpen(false); setRewardWinnerId(null); }} className="flex-1 rounded bg-gray-100 py-2">취소</button>
              <button type="submit" className="flex-1 rounded bg-purple-600 py-2 font-semibold text-white">전달 내용 확인</button>
            </div>
          </form>
          {rewardConfirmOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-xl">
                <div>
                  <h4 className="text-lg font-bold">정말 보상을 전달할까요?</h4>
                  <p className="mt-1 text-sm text-gray-600">전달 후에는 보상 내용과 이미지를 수정하거나 다시 보낼 수 없습니다.</p>
                </div>
                <dl className="space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">보상명</dt><dd className="font-medium text-right">{rewardTitle}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">유형</dt><dd className="font-medium">{rewardDeliveryType === "CODE" ? "쿠폰 코드" : rewardDeliveryType === "IMAGE" ? "이미지형 기프티콘" : "안내문"}</dd></div>
                </dl>
                <div className="flex gap-2">
                  <button type="button" disabled={rewardSubmitting} onClick={() => setRewardConfirmOpen(false)} className="flex-1 rounded bg-gray-100 py-2">돌아가기</button>
                  <button type="button" disabled={rewardSubmitting} onClick={deliverReward} className="flex-1 rounded bg-purple-600 py-2 font-semibold text-white disabled:bg-gray-400">{rewardSubmitting ? "전달 중..." : "확인 후 전달"}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showWinnerModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">

      <div className="flex justify-between items-center px-5 py-4 border-b">
        <h3 className="text-lg font-bold"> 
          {isMine && draw?.shippable ? "배송 처리 안내" : isMine ? "당첨자 상세 정보" : "당첨자 목록"}
        </h3>
        <button onClick={() => setShowWinnerModal(false)}>닫기</button>
      </div>

      <div className="max-h-[400px] overflow-y-auto px-5 py-4">
  {isMine && draw?.shippable ? (
    <div className="rounded-xl bg-purple-50 p-4 text-sm text-purple-900">
      <p className="font-semibold">배송 상품의 당첨 처리는 마이페이지에서 진행합니다.</p>
      <p className="mt-1 text-purple-700">마이페이지의 ‘내가 개설한 드로우’에서 ‘당첨 처리하기’를 눌러 택배사와 송장번호를 입력해주세요.</p>
      <button type="button" onClick={() => navigate('/my')} className="mt-3 rounded-lg bg-purple-600 px-3 py-2 font-semibold text-white">마이페이지로 이동</button>
    </div>
  ) : isMine ? (
    hostWinnersLoading ? (
      <p className="text-gray-500 text-sm">불러오는 중...</p>
    ) : hostWinnersError ? (
      <p className="text-red-500 text-sm">당첨자 정보를 불러오지 못했습니다.</p>
    ) : hostWinnerInfo.length > 0 ? (
      <ul className="space-y-3">
        {hostWinnerInfo.map((w) => (
          <li
            key={w.winnerUserId}
            className="border p-4 rounded-lg space-y-1"
          >
            <div className="flex items-center justify-between gap-3 border-b pb-2 mb-2">
              <span className="text-sm font-semibold text-purple-700">
                처리 상태: {w.fulfillmentStatus}
              </span>
              {!draw?.shippable ? (
                w.fulfillmentStatus === "REWARD_PENDING" ? (
                  <button
                    type="button"
                    className="rounded bg-purple-600 px-2 py-1 text-sm font-semibold text-white"
                    onClick={() => {
                      setRewardWinnerId(w.winnerId);
                      setRewardDeliveryType("CODE");
                      setRewardTitle("");
                      setRewardContent("");
                      setRewardImage(null);
                    }}
                  >
                    보상 전달
                  </button>
                ) : (
                  <span className="text-xs text-gray-500">{w.fulfillmentStatus === "COMPLETED" ? "수령 완료" : "보상 전달 완료"}</span>
                )
              ) : (w.fulfillmentStatus === "ADDRESS_SUBMITTED" || w.fulfillmentStatus === "PROCESSING") ? <select
                value={w.fulfillmentStatus}
                className="rounded border px-2 py-1 text-sm"
                onChange={async (event) => {
                  const fulfillmentStatus = event.target.value as HostWinnerInfoResponse["fulfillmentStatus"];
                  const fulfillmentNote = window.prompt(
                    "처리 메모를 입력하세요. (예: 기프티콘 문자 발송 완료)",
                    w.fulfillmentNote ?? ""
                  );

                  if (fulfillmentNote === null) return;
                  const trackingNumber = window.prompt(
                    "송장번호를 입력하세요. 배송 상품이 아니면 비워 두세요.",
                    w.trackingNumber ?? ""
                  );

                  if (trackingNumber === null) return;

                  try {
                    await apiClient.patch(
                      `/api/host/draws/${drawId}/winners/${w.winnerId}/fulfillment`,
                      { status: fulfillmentStatus, note: fulfillmentNote, trackingNumber }
                    );
                    setHostWinnerInfo((current) =>
                      current.map((winner) =>
                        winner.winnerId === w.winnerId
                          ? { ...winner, fulfillmentStatus, fulfillmentNote, trackingNumber }
                          : winner
                      )
                    );
                    toast.success("당첨 처리 상태를 변경했습니다.");
                  } catch (error) {
                    console.error("당첨 처리 상태 변경 실패:", error);
                    toast.error("당첨 처리 상태를 변경하지 못했습니다.");
                  }
                }}
              >
                <option value="PROCESSING">처리 중</option>
                <option value="COMPLETED">처리 완료</option>
              </select>
              : <span className="text-xs text-gray-400">배송 정보 제출 대기</span>}
            </div>
            {!draw?.shippable && w.rewardTitle && (
              <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-950">
                <p><span className="font-semibold">전달 보상:</span> {w.rewardTitle}</p>
                <p><span className="font-semibold">유형:</span> {w.rewardDeliveryType === "CODE" ? "쿠폰 코드" : w.rewardDeliveryType === "IMAGE" ? "이미지형 기프티콘" : "안내문"}</p>
                <p><span className="font-semibold">전달 시각:</span> {w.rewardDeliveredAt ? new Date(w.rewardDeliveredAt).toLocaleString("ko-KR") : "-"}</p>
              </div>
            )}
            <p className="text-sm">
              <span className="font-semibold text-gray-700">이름:</span> {w.name}
            </p>
            <p className="text-sm">
              <span className="font-semibold text-gray-700">닉네임:</span> {w.nickname}
            </p>
            {draw?.shippable && <>
              <p className="text-sm break-all">
                <span className="font-semibold text-gray-700">전화번호:</span> {w.phone}
              </p>
              <p className="text-sm break-words [overflow-wrap:anywhere]">
                <span className="font-semibold text-gray-700">주소:</span> {w.address}
              </p>
              <p className="text-sm break-all">
                <span className="font-semibold text-gray-700">송장번호:</span> {w.trackingNumber || "미입력"}
              </p>
            </>}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-sm">당첨자가 없습니다.</p>
    )
  ) : winnersLoading ? (
    <p className="text-gray-500 text-sm">불러오는 중...</p>
  ) : winnerData?.winners?.length ? (
    <>
      {!draw?.shippable && myReward && (
        <section className="mb-4 space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div>
            <h4 className="font-bold text-purple-800">당첨 보상</h4>
            <p className="text-xs text-gray-600">개설자가 전달한 보상은 변경할 수 없습니다.</p>
          </div>
          <p className="font-semibold text-gray-900">{myReward.title}</p>
          {myReward.deliveryType === "IMAGE" ? (
            rewardImageUrl ? <img src={rewardImageUrl} alt={myReward.title} className="max-h-80 w-full rounded-lg object-contain" />
              : <p className="text-sm text-gray-500">이미지를 불러오는 중...</p>
          ) : (
            <p className="whitespace-pre-wrap break-words rounded bg-white p-3 text-sm text-gray-800">{myReward.content}</p>
          )}
          <button type="button" disabled={myReward.fulfillmentStatus === "COMPLETED"} onClick={async () => {
            try {
              await apiClient.post(`/api/draws/${drawId}/winners/${myReward.winnerId}/reward/confirm`);
              setMyReward({ ...myReward, fulfillmentStatus: "COMPLETED", confirmedAt: new Date().toISOString() });
              toast.success("보상 수령을 완료했습니다.");
            } catch {
              toast.error("수령 완료 처리에 실패했습니다.");
            }
          }} className="w-full rounded bg-purple-600 py-2 text-sm font-bold text-white disabled:bg-gray-400">
            {myReward.fulfillmentStatus === "COMPLETED" ? "수령 완료" : "수령 완료하기"}
          </button>
        </section>
      )}
      {myDelivery && (
        <form className="mb-4 space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4" onSubmit={async (event) => {
          event.preventDefault();
          try {
            await apiClient.post(`/api/draws/${drawId}/winners/${myDelivery.winnerId}/delivery-address`, { phone: deliveryPhone, address: deliveryAddress });
            setMyDelivery({ ...myDelivery, phone: deliveryPhone, address: deliveryAddress, fulfillmentStatus: "ADDRESS_SUBMITTED" });
            toast.success("배송 정보를 제출했습니다.");
          } catch { toast.error("배송 정보를 제출하지 못했습니다."); }
        }}>
          <h4 className="font-bold text-purple-800">당첨 배송 정보</h4>
          <p className="text-xs text-gray-600">입력 기한: {myDelivery.addressDeadlineAt ? new Date(myDelivery.addressDeadlineAt).toLocaleString("ko-KR") : "-"}</p>
          <input required value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} placeholder="연락처" className="w-full rounded border px-3 py-2 text-sm" />
          <textarea required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="배송 주소" className="w-full rounded border px-3 py-2 text-sm" />
          <button type="submit" disabled={myDelivery.fulfillmentStatus !== "ADDRESS_REQUIRED"} className="w-full rounded bg-purple-600 py-2 text-sm font-bold text-white disabled:bg-gray-400">{myDelivery.fulfillmentStatus === "EXPIRED" ? "입력 기한 만료" : myDelivery.fulfillmentStatus === "ADDRESS_SUBMITTED" ? "배송 정보 제출 완료" : "배송 정보 제출"}</button>
        </form>
      )}
    <ul className="space-y-3">
      {winnerData.winners.map((w, i) => (
        <li
          key={i}
          className="flex justify-between border p-3 rounded-lg"
        >
          <span>{w.nickname}</span>
          <span>{w.usedTicketCount}T</span>
        </li>
      ))}
    </ul>
    </>
  ) : (
    <p className="text-gray-500 text-sm">당첨자가 없습니다.</p>
  )}
</div>

      <div className="p-4 border-t">
        <button
          onClick={() => setShowWinnerModal(false)}
          className="w-full bg-gray-100 py-2 rounded-lg"
        >
          확인
        </button>
      </div>

    </div>
  </div>
)}


      
    </main>
  </div>
  );
}
