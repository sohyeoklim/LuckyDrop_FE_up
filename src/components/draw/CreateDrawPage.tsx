import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Calendar, Ticket, Users, Package, DollarSign, Tag, Truck } from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";
import axios from "axios";
import type { DrawCreateRequest } from "../../types/draw";

function toLocalDateTimeString(value: string) {
  if (!value) return "";
  return value.length === 16 ? `${value}:00` : value;
}

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

  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("accessToken");
    console.log("token =", token);

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
        retailPrice: formData.retailPrice ? Number(formData.retailPrice) : 0,
        shippable: formData.shippable,
        images: [
          {
            imageUrl: "https://picsum.photos/800/600",
            sortOrder: 0,
          },
        ],
      },
    };

    await axios.post(
      "http://localhost:8080/api/draws/create",
      requestBody,
      {
        withCredentials: true,
        }
    );

    alert("드로우 생성 완료");
    navigate("/draws");
  } catch (error) {
    console.error("드로우 생성 실패:", error);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">뒤로가기</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">새로운 드로우 생성</h1>
          <p className="text-gray-600">새로운 럭키드로우 이벤트를 만들어 보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Upload className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">상품 이미지</h2>
            </div>
            
            <div className="space-y-4">
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-base font-medium text-gray-700 mb-1">
                    클릭하여 이미지 선택
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF (최대 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-white text-gray-900 rounded-lg px-4 py-2 font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      이미지 삭제
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Draw Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Ticket className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">드로우 기본 정보</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  드로우 이름
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="예: 에어조던 1 레트로 하이 OG"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  드로우 설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="드로우 이벤트에 대한 상세한 설명을 작성해주세요."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[120px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="winnerCount" className="block text-sm font-medium text-gray-700 mb-2">
                    당첨자 수
                  </label>
                  <input
                    id="winnerCount"
                    name="winnerCount"
                    type="number"
                    value={formData.winnerCount}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="ticketCostEntry" className="block text-sm font-medium text-gray-700 mb-2">
                    1회 응모 티켓 수
                  </label>
                  <input
                    id="ticketCostEntry"
                    name="ticketCostEntry"
                    type="number"
                    value={formData.ticketCostEntry}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 mb-2">
                    응모 시작 시간
                  </label>
                  <input
                    id="startAt"
                    name="startAt"
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 mb-2">
                    응모 마감 시간
                  </label>
                  <input
                    id="endAt"
                    name="endAt"
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">상품 정보</h2>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                    상품명
                  </label>
                  <input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="예: Air Jordan 1 Retro High OG"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    maxLength={80}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    브랜드
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="예: Nike"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    maxLength={80}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  상품 설명
                </label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  placeholder="상품의 특징, 사양, 구성품 등을 자세히 설명해주세요."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[120px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원)
                  </label>
                  <input
                    id="retailPrice"
                    name="retailPrice"
                    type="number"
                    value={formData.retailPrice}
                    onChange={handleInputChange}
                    placeholder="250000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="shippable" className="block text-sm font-medium text-gray-700 mb-2">
                    배송 유형
                  </label>
                  <select
                    id="shippable"
                    name="shippable"
                    value={formData.shippable.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippable: e.target.value === "true" }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="true">배송 상품</option>
                    <option value="false">비배송 상품 (쿠폰, 디지털 등)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
            >
              드로우 생성하기
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
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