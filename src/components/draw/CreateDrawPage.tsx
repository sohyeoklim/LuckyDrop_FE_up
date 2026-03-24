import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  Ticket,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export function CreateDrawPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const nowMin = formatDateTimeLocal(new Date());
  const endMin = formData.startAt || nowMin;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);

    const newPreviewPromises = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(newPreviewPromises).then((newPreviews) => {
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next.images;
      return next;
    });

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "startAt") {
        if (next.endAt && new Date(next.endAt) <= new Date(value)) {
          next.endAt = "";
        }
      }

      return next;
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];

      if (name === "startAt") {
        delete next.endAt;
      }

      return next;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "드로우 이름을 입력해주세요.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "드로우 설명을 입력해주세요.";
    }

    if (!formData.winnerCount) {
      newErrors.winnerCount = "당첨자 수를 입력해주세요.";
    } else if (Number(formData.winnerCount) < 1) {
      newErrors.winnerCount = "당첨자 수는 1명 이상이어야 합니다.";
    }

    if (!formData.ticketCostEntry) {
      newErrors.ticketCostEntry = "1회 응모 티켓 수를 입력해주세요.";
    } else if (Number(formData.ticketCostEntry) < 1) {
      newErrors.ticketCostEntry = "필요 티켓 수는 1장 이상이어야 합니다.";
    }

    if (!formData.startAt) {
      newErrors.startAt = "응모 시작 시간을 입력해주세요.";
    }

    if (!formData.endAt) {
      newErrors.endAt = "응모 마감 시간을 입력해주세요.";
    }

    if (formData.startAt) {
      const start = new Date(formData.startAt);
      const now = new Date();
      if (start <= now) {
        newErrors.startAt = "응모 시작 시간은 현재 이후여야 합니다.";
      }
    }

    if (formData.startAt && formData.endAt) {
      const start = new Date(formData.startAt);
      const end = new Date(formData.endAt);
      if (end <= start) {
        newErrors.endAt = "응모 종료 시간은 시작 시간보다 이후여야 합니다.";
      }
    }

    if (!formData.productName.trim()) {
      newErrors.productName = "상품명을 입력해주세요.";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "브랜드명을 입력해주세요.";
    }

    if (!formData.productDescription.trim()) {
      newErrors.productDescription = "상품 설명을 입력해주세요.";
    }

    if (formData.retailPrice === "") {
      newErrors.retailPrice = "상품 가격을 입력해주세요.";
    } else if (Number(formData.retailPrice) < 0) {
      newErrors.retailPrice = "상품 가격은 0 이상이어야 합니다.";
    }

    if (imageFiles.length === 0) {
      newErrors.images = "이미지를 1장 이상 등록해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitDraw = async () => {
    try {
      setSubmitting(true);

      let uploadedImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        const imageFormData = new FormData();

        imageFiles.forEach((file) => {
          imageFormData.append("images", file);
        });

        const uploadResponse = await axios.post(
          "http://localhost:8080/api/images",
          imageFormData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploadedImageUrls = uploadResponse.data.imageUrls;
      }

      const requestBody = {
        title: formData.title,
        description: formData.description,
        ticketCostEntry: Number(formData.ticketCostEntry),
        winnerCount: Number(formData.winnerCount),
        startAt: formData.startAt + ":00",
        endAt: formData.endAt + ":00",
        product: {
          name: formData.productName,
          brand: formData.brand,
          description: formData.productDescription,
          retailPrice: Number(formData.retailPrice),
          shippable: formData.shippable,
          images: uploadedImageUrls.map((url, index) => ({
            imageUrl: url,
            sortOrder: index,
          })),
        },
      };

      await axios.post("http://localhost:8080/api/draws/create", requestBody, {
        withCredentials: true,
      });

      toast.success("드로우 생성 완료");
      setShowConfirmModal(false);
      setConfirmChecked(false);
      navigate("/draws");
    } catch (error) {
      console.error("드로우 생성 실패:", error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        if (responseData?.errors) {
          setErrors(responseData.errors);
          toast.error(responseData.message || "입력값을 확인해주세요.");
          return;
        }

        toast.error(responseData?.message || "드로우 생성에 실패했습니다.");
        return;
      }

      toast.error("드로우 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setConfirmChecked(false);
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    if (!confirmChecked || submitting) {
      return;
    }

    await submitDraw();
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            새로운 드로우 생성
          </h1>
          <p className="text-gray-600">
            새로운 럭키드로우 이벤트를 만들어 보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Upload className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">상품 이미지</h2>
            </div>

            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 ${
                  errors.images ? "border-red-500" : "border-gray-300"
                }`}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-base font-medium text-gray-700 mb-1">
                  클릭하여 이미지 선택
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF / 여러 장 선택 가능
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />

              {errors.images && (
                <p className="mt-2 text-sm text-red-500">{errors.images}</p>
              )}

              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    선택된 이미지 {imagePreviews.length}장
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={`${preview}-${index}`}
                        className="relative rounded-lg overflow-hidden border border-gray-200 group bg-gray-100"
                      >
                        <img
                          src={preview}
                          alt={`preview-${index}`}
                          className="w-full h-48 object-cover"
                        />

                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index === 0 ? "대표" : `${index + 1}번`}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-white text-gray-900 rounded-full p-1 shadow hover:bg-gray-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
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
              <h2 className="text-xl font-bold text-gray-900">
                드로우 기본 정보
              </h2>
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
                  onChange={handleInputChange}
                  placeholder="예: 에어조던 1 레트로 하이 OG"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  maxLength={120}
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
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
                  placeholder="드로우 이벤트에 대한 상세한 설명을 작성해주세요."
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[120px] resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
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
                    onChange={handleInputChange}
                    placeholder="10"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.winnerCount ? "border-red-500" : "border-gray-300"
                    }`}
                    min="1"
                    required
                  />
                  {errors.winnerCount && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.winnerCount}
                    </p>
                  )}
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
                    onChange={handleInputChange}
                    placeholder="5"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.ticketCostEntry
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    min="1"
                    required
                  />
                  {errors.ticketCostEntry && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.ticketCostEntry}
                    </p>
                  )}
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
                    min={nowMin}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.startAt ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.startAt && (
                    <p className="mt-1 text-sm text-red-500">{errors.startAt}</p>
                  )}
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
                    min={endMin}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.endAt ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.endAt && (
                    <p className="mt-1 text-sm text-red-500">{errors.endAt}</p>
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
                    onChange={handleInputChange}
                    placeholder="예: Air Jordan 1 Retro High OG"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.productName ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={80}
                    required
                  />
                  {errors.productName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.productName}
                    </p>
                  )}
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
                    onChange={handleInputChange}
                    placeholder="예: Nike"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.brand ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={80}
                    required
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-500">{errors.brand}</p>
                  )}
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
                  onChange={handleInputChange}
                  placeholder="상품의 특징, 사양, 구성품 등을 자세히 설명해주세요."
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[120px] resize-none ${
                    errors.productDescription
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.productDescription && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.productDescription}
                  </p>
                )}
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
                    onChange={handleInputChange}
                    placeholder="250000"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.retailPrice
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    min="0"
                  />
                  {errors.retailPrice && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.retailPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="shippable"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    배송 유형
                  </label>
                  <select
                    id="shippable"
                    name="shippable"
                    value={formData.shippable.toString()}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        shippable: e.target.value === "true",
                      }));

                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.shippable;
                        return next;
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="true">배송 상품</option>
                    <option value="false">비배송 상품 (쿠폰, 디지털 등)</option>
                  </select>
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
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm disabled:bg-purple-300"
            >
              {submitting ? "생성 중..." : "드로우 생성하기"}
            </button>
          </div>
        </form>
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    드로우 생성 전 확인
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    생성 이후 수정 가능한 항목이 제한됩니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  생성 후 수정 가능한 항목
                </p>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  <li>• 드로우 설명</li>
                  <li>• 종료시간 1회 연장</li>
                </ul>
                <p className="mt-3 text-sm text-amber-800 leading-6">
                  그 외 항목인 상품 정보, 시작시간, 1회 응모 티켓 수, 당첨자 수
                  등은 수정할 수 없습니다.
                  또한 응모 시작 전 그리고 시작이 되더라도 응모자가 발생하지 않은
                  드로우만 취소가 가능합니다.
                </p>
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-xl border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 leading-6">
                  위 내용을 확인했고, 생성 후 수정 제한 사항, 삭제사항에 동의합니다.
                </span>
              </label>
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  if (submitting) return;
                  setShowConfirmModal(false);
                  setConfirmChecked(false);
                }}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleConfirmCreate}
                disabled={!confirmChecked || submitting}
                className="flex-1 rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                {submitting ? "생성 중..." : "확인 후 생성"}
              </button>
            </div>
          </div>
        </div>
      )}

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