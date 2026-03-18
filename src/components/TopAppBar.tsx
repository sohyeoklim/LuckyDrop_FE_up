import { Ticket, Heart, User, Menu, LogOut, ListChecks } from 'lucide-react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import apiClient from '../api/client';  // 기존 apiClient 직접 import

interface TicketWallet {
  balance: number;
}

export function TopAppBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setTickets(0);
      setLoading(false);
      return;
    }
    
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/ticket/wallet/${user.id}`);
        setTickets(response.data.balance);
      } catch (error) {
        console.error('티켓 불러오기 실패:', error);
        setTickets(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user?.id]);

  const handleLogout =  async() => {
    try {
    logout(); // AuthContext의 logout 호출
    navigate('/login'); // ✅ 로그인 페이지로 강제 이동
    } catch (error) {
    console.error('로그아웃 실패:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LuckyDrop
            </h1>
          </Link>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {/* 티켓 */}
                  <Link
                    to="/my/tickets"
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full hover:from-purple-200 hover:to-pink-200 transition-colors"
                  >
                    <Ticket className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-purple-900">
                      {loading ? '...' : tickets}
                    </span>
                  </Link>

                  {/* 미션 */}
                  <div className="relative group">
                    <Link
                      to="/missions"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                      aria-label="미션"
                    >
                      <ListChecks className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </Link>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      미션
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                    </div>
                  </div>

                  {/* 찜한 목록 */}
                  <div className="relative group">
                    <Link
                      to="/my/liked"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                      aria-label="찜한 목록"
                    >
                      <Heart className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </Link>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      찜한 목록
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                    </div>
                  </div>

                  {/* 마이페이지 */}
                  <div className="relative group">
                    <Link
                      to="/my"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                      aria-label="마이페이지"
                    >
                      <User className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </Link>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      마이페이지
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                    </div>
                  </div>

                  <span className="text-sm text-gray-700">{user.nickname}님 환영합니다.</span>

                  {/* 로그아웃 */}
                  <div className="relative group">
                    <button
                      onClick={handleLogout}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                      aria-label="로그아웃"
                    >
                      <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      로그아웃
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>

            {/* 모바일 메뉴 */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
