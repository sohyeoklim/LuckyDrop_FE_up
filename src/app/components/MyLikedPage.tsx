import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Clock, Ticket } from 'lucide-react';

type DrawStatus = 'OPEN' | 'LOCKED' | 'DONE';

interface LikedDraw {
  id: number;
  title: string;
  description: string;
  image: string;
  ticketCost: number;
  timeLeft: string;
  status: DrawStatus;
  totalEntries: number;
  likedDate: string;
}

export function MyLikedPage() {
  const navigate = useNavigate();
  const [likedDraws, setLikedDraws] = useState<LikedDraw[]>([
    {
      id: 1,
      title: 'Sony WH-1000XM5',
      description: '최고의 노이즈 캔슬링 헤드폰',
      image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=600',
      ticketCost: 2,
      timeLeft: '18:15:30',
      status: 'OPEN',
      totalEntries: 234,
      likedDate: '2026-01-28',
    },
    {
      id: 2,
      title: 'PlayStation 5',
      description: '차세대 게임 콘솔',
      image: 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?w=600',
      ticketCost: 8,
      timeLeft: '08:20:45',
      status: 'OPEN',
      totalEntries: 567,
      likedDate: '2026-01-27',
    },
    {
      id: 3,
      title: 'MacBook Pro 16',
      description: 'M3 Max 칩 탑재',
      image: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=600',
      ticketCost: 15,
      timeLeft: '48:00:00',
      status: 'OPEN',
      totalEntries: 789,
      likedDate: '2026-01-26',
    },
    {
      id: 4,
      title: 'Canon EOS R6',
      description: '전문가용 미러리스 카메라',
      image: 'https://images.unsplash.com/photo-1580978021179-edb8cd69dbd1?w=600',
      ticketCost: 10,
      timeLeft: '응모 마감',
      status: 'LOCKED',
      totalEntries: 432,
      likedDate: '2026-01-25',
    },
    {
      id: 5,
      title: 'AirPods Pro',
      description: '액티브 노이즈 캔슬링 이어폰',
      image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=600',
      ticketCost: 2,
      timeLeft: '추첨 완료',
      status: 'DONE',
      totalEntries: 891,
      likedDate: '2026-01-20',
    },
    {
      id: 6,
      title: 'iPad Pro 12.9',
      description: 'M2 칩 탑재 태블릿',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
      ticketCost: 12,
      timeLeft: '02:15:00',
      status: 'OPEN',
      totalEntries: 345,
      likedDate: '2026-01-26',
    },
  ]);

  const handleUnlike = (drawId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (window.confirm('찜을 해제하시겠습니까?')) {
      setLikedDraws((prev) => prev.filter((draw) => draw.id !== drawId));
    }
  };

  const getStatusBadge = (status: DrawStatus) => {
    const badges = {
      OPEN: { text: '응모 가능', color: 'bg-green-100 text-green-800' },
      LOCKED: { text: '응모 마감', color: 'bg-gray-100 text-gray-800' },
      DONE: { text: '추첨 완료', color: 'bg-blue-100 text-blue-800' },
    };
    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const activeDraws = likedDraws.filter((draw) => draw.status === 'OPEN');
  const endedDraws = likedDraws.filter((draw) => draw.status !== 'OPEN');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">찜한 드로우</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {likedDraws.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">찜한 드로우가 없습니다</h2>
            <p className="text-gray-600 mb-6">관심 있는 드로우를 찜해보세요!</p>
            <Link
              to="/draws"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              드로우 보러가기
            </Link>
          </div>
        ) : (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm text-gray-600 mb-1">총 찜한 드로우</p>
                <p className="text-2xl font-bold text-gray-900">{likedDraws.length}개</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm text-gray-600 mb-1">응모 가능</p>
                <p className="text-2xl font-bold text-green-600">{activeDraws.length}개</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm text-gray-600 mb-1">종료된 드로우</p>
                <p className="text-2xl font-bold text-gray-600">{endedDraws.length}개</p>
              </div>
            </div>

            {/* 진행중인 드로우 */}
            {activeDraws.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">진행중인 드로우</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeDraws.map((draw) => (
                    <Link
                      key={draw.id}
                      to={`/draw/${draw.id}`}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                    >
                      <div className="relative">
                        <img
                          src={draw.image}
                          alt={draw.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => handleUnlike(draw.id, e)}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                        >
                          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                        </button>
                        <div className="absolute bottom-3 left-3">
                          {getStatusBadge(draw.status)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{draw.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {draw.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{draw.timeLeft}</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-600 font-medium">
                            <Ticket className="w-4 h-4" />
                            <span>{draw.ticketCost}T</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                          찜한 날짜: {draw.likedDate}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 종료된 드로우 */}
            {endedDraws.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">종료된 드로우</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {endedDraws.map((draw) => (
                    <Link
                      key={draw.id}
                      to={`/draw/${draw.id}`}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group opacity-75 hover:opacity-100"
                    >
                      <div className="relative">
                        <img
                          src={draw.image}
                          alt={draw.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 grayscale group-hover:grayscale-0"
                        />
                        <button
                          onClick={(e) => handleUnlike(draw.id, e)}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                        >
                          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                        </button>
                        <div className="absolute bottom-3 left-3">
                          {getStatusBadge(draw.status)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{draw.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {draw.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-gray-600">{draw.timeLeft}</div>
                          <div className="flex items-center gap-1 text-purple-600 font-medium">
                            <Ticket className="w-4 h-4" />
                            <span>{draw.ticketCost}T</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                          찜한 날짜: {draw.likedDate}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
