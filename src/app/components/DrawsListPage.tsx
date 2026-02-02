import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Clock, Ticket, Heart, Users, TrendingUp } from 'lucide-react';

type SortOption = 'latest' | 'deadline' | 'popular';

interface Draw {
  id: number;
  title: string;
  description: string;
  image: string;
  ticketCost: number;
  timeLeft: string;
  timeLeftMinutes: number;
  status: 'OPEN' | 'LOCKED';
  totalEntries: number;
  winners: number;
  liked: boolean;
  likeCount: number;
  createdAt: string;
}

export function DrawsListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);

  const [draws, setDraws] = useState<Draw[]>([
    {
      id: 1,
      title: 'Apple Watch Ultra',
      description: '최신 스마트워치의 끝판왕',
      image: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?w=600',
      ticketCost: 5,
      timeLeft: '23:45:12',
      timeLeftMinutes: 1425,
      status: 'OPEN',
      totalEntries: 342,
      winners: 1,
      liked: false,
      likeCount: 156,
      createdAt: '2026-01-28',
    },
    {
      id: 2,
      title: 'iPhone 15 Pro',
      description: '최신 아이폰',
      image: 'https://images.unsplash.com/photo-1699265837122-7636e128b4b0?w=600',
      ticketCost: 3,
      timeLeft: '12:30:00',
      timeLeftMinutes: 750,
      status: 'OPEN',
      totalEntries: 521,
      winners: 1,
      liked: true,
      likeCount: 234,
      createdAt: '2026-01-27',
    },
    {
      id: 3,
      title: 'Sony WH-1000XM5',
      description: '최고의 노이즈 캔슬링',
      image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=600',
      ticketCost: 2,
      timeLeft: '18:15:30',
      timeLeftMinutes: 1095,
      status: 'OPEN',
      totalEntries: 234,
      winners: 2,
      liked: true,
      likeCount: 189,
      createdAt: '2026-01-26',
    },
    {
      id: 4,
      title: 'Canon EOS R6',
      description: '전문가용 카메라',
      image: 'https://images.unsplash.com/photo-1580978021179-edb8cd69dbd1?w=600',
      ticketCost: 10,
      timeLeft: '06:45:20',
      timeLeftMinutes: 405,
      status: 'OPEN',
      totalEntries: 178,
      winners: 1,
      liked: false,
      likeCount: 98,
      createdAt: '2026-01-28',
    },
    {
      id: 5,
      title: 'MacBook Pro 16',
      description: 'M3 Max 칩 탑재',
      image: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=600',
      ticketCost: 15,
      timeLeft: '48:00:00',
      timeLeftMinutes: 2880,
      status: 'OPEN',
      totalEntries: 789,
      winners: 1,
      liked: false,
      likeCount: 345,
      createdAt: '2026-01-25',
    },
    {
      id: 6,
      title: 'PlayStation 5',
      description: '차세대 게임 콘솔',
      image: 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?w=600',
      ticketCost: 8,
      timeLeft: '08:20:45',
      timeLeftMinutes: 500,
      status: 'OPEN',
      totalEntries: 567,
      winners: 3,
      liked: true,
      likeCount: 278,
      createdAt: '2026-01-27',
    },
    {
      id: 7,
      title: 'iPad Pro 12.9',
      description: 'M2 칩 탑재 태블릿',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
      ticketCost: 12,
      timeLeft: '응모 마감',
      timeLeftMinutes: 0,
      status: 'LOCKED',
      totalEntries: 432,
      winners: 1,
      liked: false,
      likeCount: 156,
      createdAt: '2026-01-20',
    },
    {
      id: 8,
      title: 'AirPods Pro',
      description: '액티브 노이즈 캔슬링',
      image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=600',
      ticketCost: 2,
      timeLeft: '응모 마감',
      timeLeftMinutes: 0,
      status: 'LOCKED',
      totalEntries: 891,
      winners: 2,
      liked: false,
      likeCount: 412,
      createdAt: '2026-01-18',
    },
  ]);

  const handleLike = (drawId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setDraws((prev) =>
      prev.map((draw) =>
        draw.id === drawId
          ? { 
              ...draw, 
              liked: !draw.liked,
              likeCount: draw.liked ? draw.likeCount - 1 : draw.likeCount + 1
            }
          : draw
      )
    );
  };

  // 필터링
  let filteredDraws = draws.filter((draw) => {
    const matchesSearch = draw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         draw.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !showOnlyOpen || draw.status === 'OPEN';
    return matchesSearch && matchesStatus;
  });

  // 정렬
  filteredDraws = [...filteredDraws].sort((a, b) => {
    switch (sortOption) {
      case 'latest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'deadline':
        return a.timeLeftMinutes - b.timeLeftMinutes;
      case 'popular':
        return b.likeCount - a.likeCount;
      default:
        return 0;
    }
  });

  const stats = {
    total: draws.length,
    open: draws.filter((d) => d.status === 'OPEN').length,
    totalLikes: draws.reduce((sum, d) => sum + d.likeCount, 0),
  };

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
            <h1 className="text-xl font-bold text-gray-900">전체 드로우</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600">전체 드로우</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}개</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">진행중</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.open}개</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-600">총 찜</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.totalLikes}</p>
          </div>
        </div>

        {/* 검색, 필터, 정렬 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="드로우 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 정렬 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="latest">최신순</option>
                <option value="deadline">마감 임박순</option>
                <option value="popular">인기순 (찜 기준)</option>
              </select>
            </div>

            {/* 상태 필터 */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyOpen}
                  onChange={(e) => setShowOnlyOpen(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">진행중인 드로우만 보기</span>
              </label>
            </div>
          </div>
        </div>

        {/* 드로우 리스트 */}
        {filteredDraws.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDraws.map((draw) => (
              <Link
                key={draw.id}
                to={`/draw/${draw.id}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="relative">
                  <img
                    src={draw.image}
                    alt={draw.title}
                    className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${
                      draw.status === 'LOCKED' ? 'grayscale' : ''
                    }`}
                  />
                  <button
                    onClick={(e) => handleLike(draw.id, e)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        draw.liked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                      }`}
                    />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        draw.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {draw.status === 'OPEN' ? '응모 가능' : '응모 마감'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{draw.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{draw.description}</p>

                  <div className="space-y-2">
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

                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{draw.totalEntries}명 응모</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <Heart className="w-4 h-4" />
                        <span>{draw.likeCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">검색 결과가 없습니다</h2>
            <p className="text-gray-600">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}
      </main>
    </div>
  );
}
