import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Ticket, Heart, Users, AlertCircle } from 'lucide-react';
import Slider from 'react-slick';
import toast from 'react-hot-toast';

// 드로우 상태 타입
type DrawStatus = 'OPEN' | 'LOCKED' | 'DRAWING' | 'DONE' | 'CANCEL';

interface DrawDetailData {
  id: number;
  title: string;
  description: string;
  images: string[];
  ticketCost: number;
  timeLeft: string;
  status: DrawStatus;
  totalEntries: number;
  winners: number;
  liked: boolean;
  detailedInfo: string;
  rules: string[];
}

// 모의 데이터
const mockDrawData: { [key: string]: DrawDetailData } = {
  '1': {
    id: 1,
    title: 'Apple Watch Ultra',
    description: '최신 스마트워치의 끝판왕',
    images: [
      'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?w=800',
      'https://images.unsplash.com/photo-1699265837122-7636e128b4b0?w=800',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
    ],
    ticketCost: 5,
    timeLeft: '23:45:12',
    status: 'OPEN',
    totalEntries: 342,
    winners: 1,
    liked: false,
    detailedInfo: 'Apple Watch Ultra는 가장 강력하고 다재다능한 Apple Watch입니다. 49mm 티타늄 케이스, 더 밝은 Retina 디스플레이, 최대 36시간의 배터리 사용 시간을 자랑합니다.',
    rules: [
      '1인당 최대 10회 응모 가능',
      '당첨자는 추첨 후 24시간 이내 공지',
      '경품 배송은 당첨 확정 후 3-5일 소요',
      '응모 후 취소 불가',
    ],
  },
  '2': {
    id: 2,
    title: 'iPhone 15 Pro',
    description: '최신 아이폰',
    images: [
      'https://images.unsplash.com/photo-1699265837122-7636e128b4b0?w=800',
      'https://images.unsplash.com/photo-1696446702183-cbd0674e6df9?w=800',
    ],
    ticketCost: 3,
    timeLeft: '12:30:00',
    status: 'OPEN',
    totalEntries: 521,
    winners: 1,
    liked: true,
    detailedInfo: 'iPhone 15 Pro는 티타늄 디자인과 강력한 A17 Pro 칩을 탑재했습니다.',
    rules: [
      '1인당 최대 15회 응모 가능',
      '당첨자는 추첨 후 24시간 이내 공지',
      '경품 배송은 당첨 확정 후 3-5일 소요',
    ],
  },
};

export function DrawDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [draw, setDraw] = useState<DrawDetailData | null>(
    id ? mockDrawData[id] || null : null
  );
  const [entryCount, setEntryCount] = useState(1);
  const [userTickets] = useState(120);

  if (!draw) {
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
    setDraw({ ...draw, liked: !draw.liked });
  };

  const handleEntry = () => {
    if (draw.status !== 'OPEN') {
      toast.error('현재 응모할 수 없는 드로우입니다.');
      return;
    }

    const totalCost = draw.ticketCost * entryCount;
    if (userTickets < totalCost) {
      toast.error('티켓이 부족합니다.');
      return;
    }

    // 실제로는 서버에 응모 요청
    toast.success(`${entryCount}회 응모 완료! (${totalCost} 티켓 사용)`);
    navigate('/my/entries');
  };

  const getStatusBadge = (status: DrawStatus) => {
    const badges = {
      OPEN: { text: '응모 가능', color: 'bg-green-100 text-green-800' },
      LOCKED: { text: '응모 마감', color: 'bg-gray-100 text-gray-800' },
      DRAWING: { text: '추첨 중', color: 'bg-yellow-100 text-yellow-800' },
      DONE: { text: '추첨 완료', color: 'bg-blue-100 text-blue-800' },
      CANCEL: { text: '취소됨', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

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
                  draw.liked ? 'fill-red-500 text-red-500' : 'text-gray-400'
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
                    src={image}
                    alt={`${draw.title} ${index + 1}`}
                    className="w-full h-full object-cover"
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

            {/* 통계 정보 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">남은 시간</p>
                <p className="text-lg font-bold text-gray-900">{draw.timeLeft}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">응모자 수</p>
                <p className="text-lg font-bold text-gray-900">{draw.totalEntries}명</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Ticket className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">응모 비용</p>
                <p className="text-lg font-bold text-gray-900">{draw.ticketCost}T</p>
              </div>
            </div>

            {/* 응모 카드 */}
            {draw.status === 'OPEN' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">응모하기</h3>

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
                      onChange={(e) => setEntryCount(Math.max(1, parseInt(e.target.value) || 1))}
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
                    <span className="text-sm font-medium text-purple-600">
                      {draw.ticketCost * entryCount}T
                    </span>
                  </div>
                  <div className="pt-2 border-t border-purple-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">남은 티켓</span>
                      <span className="text-sm font-bold text-gray-900">
                        {userTickets - draw.ticketCost * entryCount}T
                      </span>
                    </div>
                  </div>
                </div>

                {/* 응모 버튼 */}
                <button
                  onClick={handleEntry}
                  disabled={userTickets < draw.ticketCost * entryCount}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {userTickets < draw.ticketCost * entryCount
                    ? '티켓이 부족합니다'
                    : `${entryCount}회 응모하기`}
                </button>
              </div>
            )}

            {/* 상태별 안내 메시지 */}
            {draw.status !== 'OPEN' && (
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {draw.status === 'LOCKED' && '응모가 마감되었습니다.'}
                  {draw.status === 'DRAWING' && '추첨이 진행 중입니다.'}
                  {draw.status === 'DONE' && '추첨이 완료되었습니다.'}
                  {draw.status === 'CANCEL' && '드로우가 취소되었습니다. 티켓이 환불됩니다.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">상세 정보</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{draw.detailedInfo}</p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">응모 규칙</h3>
          <ul className="space-y-2">
            {draw.rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-600">
                <span className="text-purple-600 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
