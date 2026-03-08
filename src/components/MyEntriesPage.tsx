import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter } from 'lucide-react';

type EntryStatus = 'OPEN' | 'LOCKED' | 'DRAWING' | 'DONE' | 'WON' | 'LOST';

interface Entry {
  id: number;
  drawId: number;
  drawTitle: string;
  image: string;
  entryDate: string;
  ticketUsed: number;
  entryCount: number;
  status: EntryStatus;
  resultDate?: string;
}

export function MyEntriesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | EntryStatus>('all');

  const [entries] = useState<Entry[]>([
    {
      id: 1,
      drawId: 1,
      drawTitle: 'Apple Watch Ultra',
      image: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?w=400',
      entryDate: '2026-01-28',
      ticketUsed: 5,
      entryCount: 1,
      status: 'OPEN',
    },
    {
      id: 2,
      drawId: 2,
      drawTitle: 'iPhone 15 Pro',
      image: 'https://images.unsplash.com/photo-1699265837122-7636e128b4b0?w=400',
      entryDate: '2026-01-27',
      ticketUsed: 9,
      entryCount: 3,
      status: 'OPEN',
    },
    {
      id: 3,
      drawId: 3,
      drawTitle: 'Sony WH-1000XM5',
      image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=400',
      entryDate: '2026-01-26',
      ticketUsed: 4,
      entryCount: 2,
      status: 'DRAWING',
    },
    {
      id: 4,
      drawId: 4,
      drawTitle: 'AirPods Pro',
      image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=400',
      entryDate: '2026-01-25',
      ticketUsed: 2,
      entryCount: 1,
      status: 'WON',
      resultDate: '2026-01-26',
    },
    {
      id: 5,
      drawId: 5,
      drawTitle: 'Galaxy Buds',
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
      entryDate: '2026-01-24',
      ticketUsed: 6,
      entryCount: 3,
      status: 'LOST',
      resultDate: '2026-01-25',
    },
    {
      id: 6,
      drawId: 6,
      drawTitle: 'MacBook Pro 16',
      image: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=400',
      entryDate: '2026-01-23',
      ticketUsed: 15,
      entryCount: 1,
      status: 'LOCKED',
    },
    {
      id: 7,
      drawId: 7,
      drawTitle: 'PlayStation 5',
      image: 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?w=400',
      entryDate: '2026-01-22',
      ticketUsed: 16,
      entryCount: 2,
      status: 'LOST',
      resultDate: '2026-01-23',
    },
    {
      id: 8,
      drawId: 8,
      drawTitle: 'Canon EOS R6',
      image: 'https://images.unsplash.com/photo-1580978021179-edb8cd69dbd1?w=400',
      entryDate: '2026-01-21',
      ticketUsed: 10,
      entryCount: 1,
      status: 'DONE',
      resultDate: '2026-01-22',
    },
  ]);

  const getStatusBadge = (status: EntryStatus) => {
    const badges = {
      OPEN: { text: '진행중', color: 'bg-green-100 text-green-800' },
      LOCKED: { text: '응모마감', color: 'bg-gray-100 text-gray-800' },
      DRAWING: { text: '추첨중', color: 'bg-yellow-100 text-yellow-800' },
      DONE: { text: '완료', color: 'bg-blue-100 text-blue-800' },
      WON: { text: '당첨 🎉', color: 'bg-red-100 text-red-800 font-bold' },
      LOST: { text: '미당첨', color: 'bg-gray-100 text-gray-600' },
    };
    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.drawTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: entries.length,
    inProgress: entries.filter((e) => ['OPEN', 'LOCKED', 'DRAWING'].includes(e.status)).length,
    won: entries.filter((e) => e.status === 'WON').length,
    totalTicketsUsed: entries.reduce((sum, e) => sum + e.ticketUsed, 0),
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
            <h1 className="text-xl font-bold text-gray-900">응모 내역</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">총 응모</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}회</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">진행중</p>
            <p className="text-2xl font-bold text-green-600">{stats.inProgress}건</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">당첨</p>
            <p className="text-2xl font-bold text-red-600">{stats.won}회</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">사용 티켓</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalTicketsUsed}T</p>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="드로우 제목 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 필터 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="all">모든 상태</option>
                <option value="OPEN">진행중</option>
                <option value="LOCKED">응모마감</option>
                <option value="DRAWING">추첨중</option>
                <option value="WON">당첨</option>
                <option value="LOST">미당첨</option>
                <option value="DONE">완료</option>
              </select>
            </div>
          </div>
        </div>

        {/* 응모 내역 리스트 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredEntries.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/draw/${entry.drawId}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    <img
                      src={entry.image}
                      alt={entry.drawTitle}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{entry.drawTitle}</h3>
                        {getStatusBadge(entry.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>응모일: {entry.entryDate}</p>
                        <p>
                          응모 횟수: {entry.entryCount}회 (티켓 {entry.ticketUsed}개 사용)
                        </p>
                        {entry.resultDate && <p>결과 발표: {entry.resultDate}</p>}
                      </div>
                      {entry.status === 'WON' && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-600">
                            🎉 축하합니다! 당첨되셨습니다!
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            배송 정보 입력을 위해 고객센터로 연락주세요.
                          </p>
                        </div>
                      )}
                      {entry.status === 'DRAWING' && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm font-medium text-yellow-600">
                            ⏳ 추첨이 진행 중입니다. 곧 결과가 발표됩니다!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">응모 내역이 없습니다.</p>
              <p className="text-sm">검색어나 필터를 변경해보세요.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
