import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Ticket, Package, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import apiClient, { getMe } from "@/api/client";

interface DrawDetailResponse {
  hostUserId: number;
  drawId: number;
  title: string;
  description: string;
  ticketCostEntry: number;
  winnerCount: number;
  startAt: string;
  endAt: string;
  status: "DRAFT" | "ACTIVE" | "DRAWING" | "CLOSE" | "CANCEL";
  isBookmarked: boolean;
  participantCount: number;
  bookmarkCount: number;
  productName: string;
  brand: string;
  productDescription: string;
  price: number;
  images: string[];
  endAtChanged: boolean;
}

export function EditDrawPage() {
  const navigate = useNavigate();
  const { drawId } = useParams<{ drawId: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [originalDraw, setOriginalDraw] = useState<DrawDetailResponse | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    winnerCount: "",
    ticketCostEntry: "",
    startAt: "",
    endAt: "",
    productName: "",
    brand: "",
    productDescription: "",
    retailPrice: "",
    shippable: true,
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);

        const [drawResponse, meResponse] = await Promise.all([
          apiClient.get<DrawDetailResponse>(`/api/draws/${drawId}`),
          getMe(),
        ]);

        const data = drawResponse.data;

        setOriginalDraw(data);
        setCurrentUserId(meResponse.id);

        setFormData({
          title: data.title ?? "",
          description: data.description ?? "",
          winnerCount: String(data.winnerCount ?? ""),
          ticketCostEntry: String(data.ticketCostEntry ?? ""),
          startAt: formatDateTimeLocal(data.startAt),
          endAt: formatDateTimeLocal(data.endAt),
          productName: data.productName ?? "",
          brand: data.brand ?? "",
          productDescription: data.productDescription ?? "",
          retailPrice: String(data.price ?? 0),
          shippable: true, // detail 응답에 아직 없어서 임시값
        });

        setImagePreviews(data.images ?? []);
      } catch (error) {
        console.error("수정 페이지 초기 데이터 조회 실패:", error);
        toast.error("드로우 정보를 불러오지 못했습니다.");
        navigate("/draws");
      } finally {
        setLoading(false);
      }
    };

    if (drawId) {
      fetchPageData();
    }
  }, [drawId, navigate]);

  const isEditable = useMemo(() => {
    if (!originalDraw || currentUserId === null) return false;

    const now = new Date();
    const startAt = new Date(originalDraw.startAt);

    if (originalDraw.hostUserId !== currentUserId) return false;
    if (originalDraw.status !== "DRAFT") return false;
    if (now >= startAt) return false;
    if (originalDraw.participantCount > 0) return false;

    return true;
  }, [originalDraw, currentUserId]);

  const canEditEndAt = useMemo(() => {
    if (!originalDraw) return false;
    if (!isEditable) return false;
    return !originalDraw.endAtChanged;
  }, [originalDraw, isEditable]);

  const originalDescription = (originalDraw?.description ?? "").trim();
  const nextDescription = formData.description.trim();

  const originalEndAtLocal = originalDraw
    ? formatDateTimeLocal(originalDraw.endAt)
    : "";

  const hasDescriptionChanged = nextDescription !== originalDescription;
  const hasEndAtChanged = canEditEndAt && formData.endAt !== originalEndAtLocal;
  const hasChanges = hasDescriptionChanged || hasEndAtChanged;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEndAt = () => {
    if (!originalDraw) return true;

    const nextEndAt = new Date(formData.endAt);
    const startAt = new Date(originalDraw.startAt);
    const currentEndAt = new Date(originalDraw.endAt);

    if (Number.isNaN(nextEndAt.getTime())) {
      toast.error("올바른 종료 시간을 입력해주세요.");
      return false;
    }

    if (nextEndAt <= startAt) {
      toast.error("종료 시간은 시작 시간 이후여야 합니다.");
      return false;
    }

    if (nextEndAt <= currentEndAt) {
      toast.error("종료 시간은 기존 종료 시간보다 뒤로만 연장할 수 있습니다.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drawId || !originalDraw) return;

    if (!isEditable) {
      toast.error("이 드로우는 수정할 수 없습니다.");
      return;
    }

    try {
      setSubmitting(true);

      const requestBody: { description?: string; endAt?: string } = {};

      if (hasDescriptionChanged) {
        requestBody.description = nextDescription;
      }

      if (hasEndAtChanged) {
        if (!validateEndAt()) return;
        requestBody.endAt = `${formData.endAt}:00`;
      }

      if (Object.keys(requestBody).length === 0) {
        toast("변경된 내용이 없습니다.");
        return;
      }

      await apiClient.patch(`/api/draws/${drawId}`, requestBody);

      toast.success("드로우 수정 완료");
      navigate(`/draws/${drawId}`);
    } catch (error: any) {
      console.error("드로우 수정 실패:", error);

      const message =
        error?.response?.data?.message || "드로우 수정에 실패했습니다.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getBlockedReason = () => {
    if (!originalDraw) return null;
    if (currentUserId === null) return "로그인 정보를 확인할 수 없습니다.";
    if (originalDraw.hostUserId !== currentUserId) {
      return "본인이 생성한 드로우만 수정할 수 있습니다.";
    }
    if (originalDraw.status !== "DRAFT") {
      return "응모 시작 전(DRAFT) 상태의 드로우만 수정할 수 있습니다.";
    }
    if (new Date() >= new Date(originalDraw.startAt)) {
      return "응모 시작 시간이 지난 드로우는 수정할 수 없습니다.";
    }
    if (originalDraw.participantCount > 0) {
      return "응모자가 발생한 드로우는 수정할 수 없습니다.";
    }
    return null;
  };

  const blockedReason = getBlockedReason();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">드로우 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (!originalDraw) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">드로우 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/draws")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">뒤로가기</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">드로우 수정</h1>
          <p className="text-gray-600">수정 가능한 항목만 변경할 수 있습니다</p>
        </div>

        {!isEditable && blockedReason && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">현재 이 드로우는 수정할 수 없습니다.</div>
                <div className="mt-1 text-sm">{blockedReason}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Upload className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">상품 이미지</h2>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-base font-medium text-gray-500 mb-1">
                  수정 페이지에서는 이미지 변경이 불가능합니다
                </p>
                <p className="text-sm text-gray-400">
                  등록된 이미지를 확인만 할 수 있습니다
                </p>
              </div>

              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    등록된 이미지 {imagePreviews.length}장
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={`${preview}-${index}`}
                        className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                      >
                        <img
                          src={preview}
                          alt={`preview-${index}`}
                          className="w-full h-48 object-cover"
                        />

                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index === 0 ? "대표" : `${index + 1}번`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Ticket className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">드로우 기본 정보</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  드로우 이름
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  드로우 설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  placeholder="드로우 이벤트에 대한 상세한 설명을 작성해주세요."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[120px] resize-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="winnerCount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    당첨자 수
                  </label>
                  <input
                    id="winnerCount"
                    name="winnerCount"
                    type="number"
                    value={formData.winnerCount}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ticketCostEntry"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    1회 응모 티켓 수
                  </label>
                  <input
                    id="ticketCostEntry"
                    name="ticketCostEntry"
                    type="number"
                    value={formData.ticketCostEntry}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="startAt"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    응모 시작 시간
                  </label>
                  <input
                    id="startAt"
                    name="startAt"
                    type="datetime-local"
                    value={formData.startAt}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endAt"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    응모 마감 시간
                  </label>
                  <input
                    id="endAt"
                    name="endAt"
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={handleInputChange}
                    disabled={!canEditEndAt}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  />

                  {originalDraw.endAtChanged && (
                    <p className="mt-2 text-sm text-red-500">
                      종료 시간은 이미 1회 수정되어 더 이상 변경할 수 없습니다.
                    </p>
                  )}

                  {!originalDraw.endAtChanged && isEditable && (
                    <p className="mt-2 text-sm text-gray-500">
                      종료 시간은 기존 종료 시간보다 뒤로만 1회 연장할 수 있습니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">상품 정보</h2>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="productName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    상품명
                  </label>
                  <input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="brand"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    브랜드
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="productDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  상품 설명
                </label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  value={formData.productDescription}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 min-h-[120px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="retailPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    가격 (원)
                  </label>
                  <input
                    id="retailPrice"
                    name="retailPrice"
                    type="number"
                    value={formData.retailPrice}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shippable"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    배송 유형
                  </label>
                  <input
                    id="shippable"
                    name="shippable"
                    value={formData.shippable ? "배송 상품" : "비배송 상품"}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/draws")}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !isEditable || !hasChanges}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm disabled:bg-purple-300"
            >
              {submitting ? "수정 중..." : "드로우 수정하기"}
            </button>
          </div>
        </form>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2026 Luckydrop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatDateTimeLocal(dateString: string) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}