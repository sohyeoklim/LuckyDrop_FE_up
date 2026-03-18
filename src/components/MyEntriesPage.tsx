import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

type EntryStatus = 'OPEN' | 'LOCKED' | 'DRAWING' | 'DONE' | 'WON' | 'LOST';

interface Entry {
  id: number;
  drawId: number;
  drawTitle: string;
  drawImage: string;
  entryDate: string;
  ticketUsed: number;
  entryCount: number;
  status: EntryStatus;
  resultDate?: string;
  isWinner: number | boolean;
}

interface EntryStats {
  total: number;
  inProgress: number;
  won: number;
  totalTicketsUsed: number;
}

export function MyEntriesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<EntryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | EntryStatus>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const SIZE = 10;
  const abortControllerRef = useRef<AbortController | null>(null);

  // 👈 데모 스타일 상태 배지
  const getStatusBadge = (status: EntryStatus, isWinner: boolean) => {
    const badges = {
      OPEN: { text: '진행중', color: 'bg-green-100 text-green-800' },
      LOCKED: { text: '응모마감', color: 'bg-gray-100 text-gray-800' },
      DRAWING: { text: '추첨중', color: 'bg-yellow-100 text-yellow-800' },
      DONE: { text: '완료', color: 'bg-blue-100 text-blue-800' },
      WON: { text: '당첨 🎉', color: 'bg-red-100 text-red-800 font-bold' },
      LOST: { text: '미당첨', color: 'bg-gray-100 text-gray-600' },
    };
    const badge = badges[status] || badges.DONE;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const isEntryWinner = (entry: Entry): boolean => {
    return entry.isWinner === true || entry.isWinner === 1;
  };

  // ✅ 티켓 사용량 항상 양수로 반환 (백엔드 음수 처리)
  const getTicketUsedDisplay = (ticketUsed: number): number => {
    return Math.abs(ticketUsed || 0);
  };

  const refreshEntries = useCallback(async (reset = true) => {
    if (!user?.id || abortControllerRef.current) {
      abortControllerRef.current?.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    if (reset) {
      setLoading(true);
      setEntries([]);
      setCurrentPage(0);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params: any = {
        page: reset ? 0 : currentPage,
        size: SIZE,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchQuery.trim() && { search: searchQuery.trim() })
      };
      
      const { data } = await apiClient.get('/api/draws/my-entries', { 
        params,
        signal: abortController.signal 
      });
      
      if (reset) {
        setEntries(data.content || []);
      } else {
        setEntries(prev => [...prev, ...(data.content || [])]);
        setCurrentPage(prev => prev + 1);
      }
      setHasMore(!data.last);
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        console.error('❌ 응모 내역 불러오기 실패:', error);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      abortControllerRef.current = null;
    }
  }, [user?.id, filterStatus, searchQuery, currentPage]);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/draws/my-entries/stats');
      setStats(data);
    } catch (error) {
      console.error('통계 불러오기 실패:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadStats();
      refreshEntries(true);
    }
  }, [user?.id, loadStats, refreshEntries]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshEntries(true);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterStatus, refreshEntries]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    await refreshEntries(false);
  };

  // ✅ 완전 수정: Math.abs() 확실히 적용
  const calcStats = () => {
    if (!entries.length) return { total: 0, inProgress: 0, won: 0, totalTicketsUsed: 0 };
    
    const total = entries.length;
    const inProgress = entries.filter((e) => ['OPEN', 'LOCKED', 'DRAWING'].includes(e.status)).length;
    const won = entries.filter((e) => isEntryWinner(e)).length;
    const totalTicketsUsed = entries.reduce((sum, e) => {
      return sum + Math.abs(e.ticketUsed || 0); // ✅ 확실히 양수
    }, 0);
    
    return { total, inProgress, won, totalTicketsUsed };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
            로그인 하러가기 →
          </Link>
        </div>
      </div>
    );
  }

  const currentStats = stats 
  ? {
      total: stats.total,
      inProgress: stats.inProgress,
      won: stats.won,
      totalTicketsUsed: Math.abs(stats.totalTicketsUsed || 0)  // ✅ API 음수 → 양수
    }
  : calcStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 -m-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">응모 내역</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 - ✅ 이제 양수로 표시됨 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">총 응모</p>
            <p className="text-2xl font-bold text-gray-900">{currentStats.total}회</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">진행중</p>
            <p className="text-2xl font-bold text-green-600">{currentStats.inProgress}건</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">당첨</p>
            <p className="text-2xl font-bold text-red-600">{currentStats.won}회</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">사용 티켓</p>
            <p className="text-2xl font-bold text-purple-600">{currentStats.totalTicketsUsed}T</p>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 응모 내역 리스트 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p>응모 내역을 불러오는 중...</p>
            </div>
          ) : entries.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <Link
                  key={entry.id || entry.drawId}
                  to={`/draws/${entry.drawId}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    <img
                      src={entry.drawImage || '/placeholder.jpg'}
                      alt={entry.drawTitle}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">
                          {entry.drawTitle}
                        </h3>
                        {getStatusBadge(entry.status, isEntryWinner(entry))}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>응모일: {entry.entryDate}</p>
                        <p>
                          응모 횟수: <span className="font-medium">{entry.entryCount}회</span> (티켓{' '}
                          <span className="font-bold text-purple-600">{getTicketUsedDisplay(entry.ticketUsed)}개</span> 사용)
                        </p>
                        {entry.resultDate && (
                          <p>결과 발표: <span className="font-medium">{entry.resultDate}</span></p>
                        )}
                      </div>
                      
                      {isEntryWinner(entry) && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-sm font-medium text-red-600">
                            🎉 축하합니다! 당첨되셨습니다!
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            배송 정보 입력을 위해 고객센터로 연락주세요.
                          </p>
                        </div>
                      )}
                      {entry.status === 'DRAWING' && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
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

        {hasMore && entries.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              {loadingMore ? '불러오는 중...' : '더보기'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
