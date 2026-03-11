import { Link, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Ticket, Heart, ListChecks, History, Award, TrendingUp, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const stats = {
  totalEntries: 23,
  likedDraws: 8,
  wonDraws: 2,
  ticketUsed: 145,
};
const recentEntries = [
  { id: 1, drawTitle: 'Apple Watch Ultra', image: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?w=400', entryDate: '2026-01-19', ticketUsed: 5, status: 'OPEN' },
  { id: 2, drawTitle: 'iPhone 15 Pro', image: 'https://images.unsplash.com/photo-1699265837122-7636e128b4b0?w=400', entryDate: '2026-01-18', ticketUsed: 3, status: 'OPEN' },
  { id: 3, drawTitle: 'AirPods Pro', image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=400', entryDate: '2026-01-15', ticketUsed: 2, status: 'DONE' },
];
const likedDraws = [
  { id: 1, title: 'Sony WH-1000XM5', image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=400', timeLeft: '18:15:30', ticketCost: 2 },
  { id: 2, title: 'PlayStation 5', image: 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?w=400', timeLeft: '08:20:45', ticketCost: 8 },
];
const ticketHistory = [
  { id: 1, type: '지급', amount: 10, reason: '회원가입 보너스', date: '2026-01-19' },
  { id: 2, type: '사용', amount: -5, reason: 'Apple Watch 응모', date: '2026-01-19' },
  { id: 3, type: '지급', amount: 5, reason: '출석 체크', date: '2026-01-18' },
  { id: 4, type: '사용', amount: -3, reason: 'iPhone 15 응모', date: '2026-01-18' },
];

export function MyPage() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const isHost = user.role === 'HOST';

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
            <Link
              to="/my/edit"
              replace
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">정보수정</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 프로필 카드 */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white mb-8 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-12 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* 로그아웃 버튼 */}
          <div className="relative flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-sm"
              aria-label="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>

          {/* 중앙 정렬 프로필 */}
          <div className="relative flex flex-col items-center text-center mb-8">
            {/* 원형 아바타 */}
            <div className={`w-24 h-24 rounded-full backdrop-blur-sm border-4 flex items-center justify-center text-4xl font-extrabold shadow-xl mb-4 select-none ${
              isHost
                ? 'bg-yellow-400/30 border-yellow-300/60'
                : 'bg-white/25 border-white/40'
            }`}>
              {user.nickname?.charAt(0).toUpperCase()}
            </div>

            {/* 닉네임 + 역할 뱃지 */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{user.nickname}</h2>
              {isHost ? (
                <span className="text-xs bg-yellow-400/30 border border-yellow-300/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-semibold text-yellow-100">
                  🏆 호스트
                </span>
              ) : (
                <span className="text-xs bg-white/25 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-medium">
                  유저
                </span>
              )}
            </div>

            {/* 이메일 / 전화 / 주소 */}
            <p className="text-purple-100 text-sm mb-0.5">{user.email}</p>
            {user.phone && <p className="text-purple-200 text-xs">{user.phone}</p>}
            {user.address && <p className="text-purple-200 text-xs mt-0.5">{user.address}</p>}

            {/* 보유 티켓 */}
            <div className="flex items-center gap-2 mt-5 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
              <Ticket className="w-5 h-5 text-yellow-300" />
              <span className="text-sm opacity-90">보유 티켓</span>
              <span className="text-2xl font-extrabold ml-1">120</span>
              <span className="text-sm opacity-75">장</span>
            </div>
          </div>

          {/* 구분선 */}
          <div className="relative w-full h-px bg-white/20 mb-6" />

          {/* 통계 4개 */}
          <div className="relative grid grid-cols-4 gap-3">
            {[
              { icon: <ListChecks className="w-5 h-5" />, value: stats.totalEntries, label: '응모 횟수' },
              { icon: <Heart className="w-5 h-5" />, value: stats.likedDraws, label: '찜한 드로우' },
              { icon: <Award className="w-5 h-5" />, value: stats.wonDraws, label: '당첨 횟수' },
              { icon: <TrendingUp className="w-5 h-5" />, value: stats.ticketUsed, label: '사용 티켓' },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm rounded-2xl p-4 cursor-default"
              >
                <div className="mb-2 opacity-80">{stat.icon}</div>
                <p className="text-2xl font-bold leading-none mb-1">{stat.value}</p>
                <p className="text-xs opacity-75 text-center">{stat.label}</p>
              </div>
            ))}
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
                    <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        <img src={entry.image} alt={entry.drawTitle} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{entry.drawTitle}</h3>
                          <p className="text-sm text-gray-600 mb-2">{entry.entryDate}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">{entry.ticketUsed} 티켓 사용</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {entry.status === 'OPEN' ? '진행중' : '완료'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
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

          {/* 찜한 드로우 */}
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
                    <Link key={draw.id} to={`/draw/${draw.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        <img src={draw.image} alt={draw.title} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{draw.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">남은 시간: {draw.timeLeft}</p>
                          <span className="text-sm text-purple-600 font-medium">{draw.ticketCost} 티켓</span>
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
            {ticketHistory.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {ticketHistory.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          item.type === '지급' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {item.type === '지급' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.reason}</p>
                          <p className="text-sm text-gray-600">{item.date}</p>
                        </div>
                      </div>
                      <span className={`text-lg font-bold ${item.type === '지급' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount}T
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
          <Link
            to="/missions"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 text-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Ticket className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">티켓 받기</p>
            <p className="text-sm opacity-90">미션 완료하고 티켓 받기</p>
          </Link>
          <Link
            to="/draws"
            className="bg-white border-2 border-purple-600 text-purple-600 rounded-xl p-6 text-center hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
          >
            <Award className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">드로우 참여</p>
            <p className="text-sm opacity-90">진행 중인 드로우 보기</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
