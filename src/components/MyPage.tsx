import { Link, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Ticket, Heart, ListChecks, History, Award, TrendingUp, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTicketWallet, getTicketLedger } from '../api/client'; 
import { fetchMyLikedDraws, LikedDraw } from '../api/bookmark';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import apiClient from '../api/client';
type TicketType = 'EARN' | 'USE' | 'REFUND' | 'ADJUST';

interface LedgerEntry {
  id: string;
  type: TicketType;
  amount: number;
  reason: string;
  createdAt: string;
}

interface Wallet {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

type EntryStatus = 'OPEN' | 'LOCKED' | 'DRAWING' | 'DONE' | 'WON' | 'LOST';

interface RecentEntry {
  drawId: number;
  drawTitle: string;
  drawImage: string;
  entryDate: string;
  ticketUsed: number;
  status: EntryStatus;
}

const typeLabelMap: Record<TicketType, string> = {
  EARN: '지급',
  USE: '사용',
  REFUND: '환불',
  ADJUST: '관리자 조정',
};

const getTypeColor = (type: TicketType): string => {
  const colors: Record<TicketType, string> = {
    EARN: 'bg-green-100 text-green-600',
    USE: 'bg-red-100 text-red-600',
    REFUND: 'bg-blue-100 text-blue-600',
    ADJUST: 'bg-amber-100 text-amber-600',
  };
  return colors[type];
};

const getAmountSign = (type: TicketType): 1 | -1 => {
  switch (type) {
    case 'EARN':
    case 'REFUND':
      return 1;
    case 'USE':
    case 'ADJUST':
      return -1;
    default:
      return 1;
  }
};

const mapBackendStatus = (backendStatus: string): EntryStatus => {
  switch (backendStatus) {
    case 'OPEN':
    case 'ACTIVE': return 'OPEN';
    case 'DRAWING': return 'DRAWING';
    case 'WON': return 'WON';
    case 'LOST': return 'LOST';
    case 'COMPLETED':
    case 'DONE':
    case 'CLOSE': return 'DONE';
    default: return 'LOCKED';
  }
};

const getDisplayAmount = (type: TicketType, amount: number): string => {
  const sign = getAmountSign(type);
  return `${sign === 1 ? '+' : ''}${amount}T`;
};

const getStatusBadge = (status: EntryStatus) => {
  const badges = {
    OPEN: { text: '진행중', color: 'bg-green-100 text-green-800' },
    LOCKED: { text: '응모마감', color: 'bg-gray-100 text-gray-800' },
    DRAWING: { text: '추첨중', color: 'bg-yellow-100 text-yellow-800' },
    DONE: { text: '완료', color: 'bg-blue-100 text-blue-800' },
    WON: { text: '당첨 🎉', color: 'bg-red-100 text-red-800 font-bold' },
    LOST: { text: '미당첨', color: 'bg-gray-200 text-gray-600' },
  };
  const badge = badges[status] || badges.DONE;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
      {badge.text}
    </span>
  );
};

const formatTicketUsed = (ticketUsed: number) => Math.abs(ticketUsed);

export function MyPage() {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();

  // API 상태
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ticketHistory, setTicketHistory] = useState<LedgerEntry[]>([]);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [likedDraws, setLikedDraws] = useState<LikedDraw[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // ✅ 이미지 변환 포함한 최근 응모 내역 로드
  const fetchRecentEntries = async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await apiClient.get('/api/draws/my-entries', { 
        params: { page: 0, size: 3 }
      });
      
      // ✅ 백엔드 → 프론트엔드 데이터 변환 (이미지/상태 처리)
      const transformedEntries = (data.content || []).map((item: any) => ({
        drawId: item.drawId,
        drawTitle: item.drawTitle,
        drawImage: item.drawImage && item.drawImage !== '' && item.drawImage !== '/images/default-draw.jpg'
          ? `http://localhost:8080${item.drawImage}`
          : '/placeholder.jpg',
        entryDate: item.entryDate,
        ticketUsed: Math.abs(item.ticketUsed || 0),
        status: mapBackendStatus(item.status),
      }));
      
      setRecentEntries(transformedEntries);
    } catch (error) {
      console.error('최근 응모 내역 로드 실패:', error);
    }
  };

  // 찜한 드로우 최근 2개
  const fetchRecentLikedDraws = async () => {
    try {
      const res = await fetchMyLikedDraws(0, 2);
      setLikedDraws(res.items);
    } catch (error) {
      console.error('찜한 드로우 로드 실패:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setApiLoading(true);
      setApiError(null);
      try {
        const [walletData, ledgerData, likedRes] = await Promise.all([
          getTicketWallet(user.id.toString()),
          getTicketLedger(user.id.toString()),
          fetchMyLikedDraws(0, 2), // ✅ 실제 API 호출
        ]);

        setWallet(walletData);
        
        const recentLedger = ledgerData
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
        setTicketHistory(recentLedger);

        setLikedDraws(likedRes.items); // ✅ 실제 찜 데이터 설정

        await fetchRecentEntries();
      } catch (err) {
        console.error('마이페이지 데이터 로드 실패:', err);
        setApiError('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setApiLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || apiLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const isHost = user.role === 'HOST';
  const isAdmin = user.role === 'ADMIN';

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
            <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-bold">관리자</span>
                </Link>
              )}
              <Link
                to="/my/edit"
                replace
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">정보수정</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 프로필 카드 - 통계 제거 */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white mb-8 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-12 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full backdrop-blur-sm border-4 flex items-center justify-center text-4xl font-extrabold shadow-xl mb-4 select-none ${
              isAdmin ? 'bg-purple-400/30 border-purple-300/60' : isHost ? 'bg-yellow-400/30 border-yellow-300/60' : 'bg-white/25 border-white/40'
            }`}>
              {user.nickname?.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{user.nickname}</h2>
              {isAdmin ? (
                <span className="text-xs bg-purple-900/40 border border-purple-300/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-semibold text-purple-100">
                  🛡️ 관리자
                </span>
              ) : isHost ? (
                <span className="text-xs bg-yellow-400/30 border border-yellow-300/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-semibold text-yellow-100">
                  🏆 호스트
                </span>
              ) : (
                <span className="text-xs bg-white/25 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-medium">
                  유저
                </span>
              )}
            </div>
            <p className="text-purple-100 text-sm mb-0.5">{user.email}</p>
            {user.phone && <p className="text-purple-200 text-xs">{user.phone}</p>}
            {user.address && <p className="text-purple-200 text-xs mt-0.5">{user.address}</p>}
            <div className="flex items-center gap-2 mt-5 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
              <Ticket className="w-5 h-5 text-yellow-300" />
              <span className="text-sm opacity-90">보유 티켓</span>
              <span className="text-2xl font-extrabold ml-1">{wallet?.balance ?? 0}</span>
              <span className="text-sm opacity-75">장</span>
            </div>
          </div>
        </div>

        {/* 콘텐츠 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 응모 내역 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">최근 응모 내역</h2>
              <Link to="/my/entries" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                전체보기 →
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {recentEntries.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentEntries.map((entry) => (
                    <Link 
                      key={entry.drawId}
                      to={`/draws/${entry.drawId}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        <img 
                          src={entry.drawImage || '/placeholder.jpg'} 
                          alt={entry.drawTitle} 
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{entry.drawTitle}</h3>
                          <p className="text-sm text-gray-600 mb-2">{entry.entryDate}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">
                              {formatTicketUsed(entry.ticketUsed)}T 사용
                            </span>
                            {getStatusBadge(entry.status)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <ListChecks className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>아직 응모한 드로우가 없습니다.</p>
                </div>
              )}
            </div>
          </section>

          {/* 찜한 드로우 - 실제 API 데이터 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">찜한 드로우</h2>
              <Link to="/my/liked" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                전체보기 →
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {likedDraws.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {likedDraws.map((draw) => (
                    <Link key={draw.id} to={`/draws/${draw.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        <img src={draw.image} alt={draw.title} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{draw.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">남은 시간: {draw.timeLeft}</p>
                          <span className="text-sm text-purple-600 font-medium">{draw.ticketCost}T</span>
                        </div>
                        <Heart className="w-5 h-5 fill-red-500 text-red-500 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>아직 찜한 드로우가 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 티켓 내역 */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">티켓 내역</h2>
            <Link to="/my/tickets" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              전체보기 →
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {apiError ? (
              <div className="p-8 text-center text-red-500">{apiError}</div>
            ) : ticketHistory.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {ticketHistory.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getTypeColor(item.type)}`}>
                          {getAmountSign(item.type) === 1 ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.reason}</p>
                          <p className="text-sm text-gray-600">{format(new Date(item.createdAt), 'yyyy-MM-dd')}</p>
                        </div>
                      </div>
                      <span className={`text-lg font-bold ${getAmountSign(item.type) === 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {getDisplayAmount(item.type, item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>티켓 사용 내역이 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        {/* 퀵 액션 버튼 */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link to="/missions" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 text-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl">
            <Ticket className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">티켓 받기</p>
            <p className="text-sm opacity-90">미션 완료하고 티켓 받기</p>
          </Link>
          <Link to="/draws" className="bg-white border-2 border-purple-600 text-purple-600 rounded-xl p-6 text-center hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl">
            <Award className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">드로우 참여</p>
            <p className="text-sm opacity-90">진행 중인 드로우 보기</p>
          </Link>
        </div>
      </main>
    </div>
  );
}