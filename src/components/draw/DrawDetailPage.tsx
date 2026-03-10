import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Ticket, Heart, Users, AlertCircle } from 'lucide-react';
import { useEntryDraw } from '@/hooks/useEntryDraw';
import Slider from 'react-slick';
import toast from 'react-hot-toast';

import { useDrawDetail } from '@/hooks/useDrawDetail';
import type { DrawStatus } from '@/types/draw';

function getTimeLeftText(status: DrawStatus, endAt: string) {
  if (status !== 'ACTIVE') {
    if (status === 'DRAFT') return '시작 전';
    if (status === 'DRAWING') return '추첨 중';
    if (status === 'CLOSE') return '종료';
    if (status === 'CANCEL') return '취소됨';
    return '-';
  }

  const now = new Date();
  const end = new Date(endAt);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return '종료';

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}일 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusBadge(status: DrawStatus) {
  const badges = {
    DRAFT: { text: '응모 대기', color: 'bg-gray-100 text-gray-800' },
    ACTIVE: { text: '응모 가능', color: 'bg-green-100 text-green-800' },
    DRAWING: { text: '추첨 중', color: 'bg-yellow-100 text-yellow-800' },
    CLOSE: { text: '종료', color: 'bg-blue-100 text-blue-800' },
    CANCEL: { text: '취소됨', color: 'bg-red-100 text-red-800' },
  };

  const badge = badges[status];

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
      {badge.text}
    </span>
  );
}

export function DrawDetailPage() {
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [entryCount, setEntryCount] = useState(1);
  const [userTickets] = useState(120);

  const { data: draw, isLoading, isError } = useDrawDetail(id);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const handleLike = () => {
    toast('북마크 토글 API 연결 예정');
  };

  const { mutate: entry } = useEntryDraw();
  const handleEntry = () => {
  if (!draw || !id) return;

  if (draw.status !== 'ACTIVE') {
    toast.error('현재 응모할 수 없는 드로우입니다.');
    return;
  }

  const totalCost = draw.ticketCostEntry * entryCount;

  if (userTickets < totalCost) {
    toast.error('티켓이 부족합니다.');
    return;
  }

  const idempotencyKey = crypto.randomUUID();

  entry(
    {
      drawId:Number(id),
      count: entryCount,
      idempotencyKey
    }, 
    {
    onSuccess: () => {
      toast.success(`${entryCount}회 응모 완료! (${totalCost} 티켓 사용)`);
      navigate('/my/entries');
    },
    onError: (error) => {
      console.error(error);
      toast.error('응모 실패');
    },
  });
};

  if (isError || !draw) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">드로우를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const totalCost = draw.ticketCostEntry * entryCount;
  const remainingTickets = userTickets - totalCost;
  const timeLeftText = getTimeLeftText(draw.status, draw.endAt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">돌아가기</span>
            </button>

            <button
              onClick={handleLike}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${
                  draw.isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 이미지 슬라이더 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Slider {...sliderSettings}>
              {draw.images.map((image, index) => (
                <div key={index} className="aspect-square">
                  <img
                    src={image || "/placeholder.png"}
                    alt={`${draw.productName} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("/placeholder.png")) { 
                        target.src = "/placeholder.png";
                      }
                    }}
                  />
                </div>
              ))}
            </Slider>
          </div>

          {/* 오른쪽: 드로우 정보 */}
          <div className="space-y-6">
            {/* 상태 배지 */}
            <div>{getStatusBadge(draw.status)}</div>

            {/* 제목 및 설명 */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{draw.title}</h1>
              <p className="text-gray-600">{draw.description}</p>
            </div>

            {/* 상품 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-sm text-gray-500 mb-1">{draw.brand}</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{draw.productName}</h2>
              <p className="text-sm text-gray-600">
                소비자 가격: {formatPrice(draw.price)}원
              </p>
            </div>

            {/* 통계 정보 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">남은 시간</p>
                <p className="text-lg font-bold text-gray-900">{timeLeftText}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">응모자 수</p>
                <p className="text-lg font-bold text-gray-900">{draw.participantCount}명</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Ticket className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">응모 비용</p>
                <p className="text-lg font-bold text-gray-900">{draw.ticketCostEntry}T</p>
              </div>
            </div>

            {/* 응모 카드 */}
            {draw.status === 'ACTIVE' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">응모하기</h3>

                <div className="mb-4 text-sm text-gray-600">
                  당첨 인원:{' '}
                  <span className="font-semibold text-gray-900">{draw.winnerCount}명</span>
                </div>

                {/* 응모 횟수 선택 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    응모 횟수
                  </label>
                  <div className="flex items-center gap-4">
                    <button
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
                      onClick={() => setEntryCount(entryCount + 1)}
                      className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 티켓 정보 */}
                <div className="bg-purple-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">보유 티켓</span>
                    <span className="text-sm font-medium text-gray-900">{userTickets}T</span>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">사용 티켓</span>
                    <span className="text-sm font-medium text-purple-600">{totalCost}T</span>
                  </div>

                  <div className="pt-2 border-t border-purple-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">남은 티켓</span>
                      <span className="text-sm font-bold text-gray-900">{remainingTickets}T</span>
                    </div>
                  </div>
                </div>

                {/* 응모 버튼 */}
                <button
                  onClick={handleEntry}
                  disabled={userTickets < totalCost}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {userTickets < totalCost ? '티켓이 부족합니다' : `${entryCount}회 응모하기`}
                </button>
              </div>
            )}

            {/* 상태별 안내 메시지 */}
            {draw.status !== 'ACTIVE' && (
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {draw.status === 'DRAFT' && '아직 응모 시작 전입니다.'}
                  {draw.status === 'DRAWING' && '추첨이 진행 중입니다.'}
                  {draw.status === 'CLOSE' && '드로우가 종료되었습니다.'}
                  {draw.status === 'CANCEL' && '드로우가 취소되었습니다. 티켓이 환불됩니다.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">상품</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{draw.productDescription}</p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">상세 정보</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-gray-600">
              <span className="text-purple-600 font-bold">•</span>
              <span>브랜드: {draw.brand}</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <span className="text-purple-600 font-bold">•</span>
              <span>상품명: {draw.productName}</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <span className="text-purple-600 font-bold">•</span>
              <span>당첨 인원: {draw.winnerCount}명</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <span className="text-purple-600 font-bold">•</span>
              <span>북마크 수: {draw.bookmarkCount}개</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <span className="text-purple-600 font-bold">•</span>
              <span>응모 시작: {formatDateTime(draw.startAt)}</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600">
              <span className="text-purple-600 font-bold">•</span>
              <span>응모 종료: {formatDateTime(draw.endAt)}</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}