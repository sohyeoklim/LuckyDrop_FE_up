import { Ticket, Heart, User, Menu, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';

interface TopAppBarProps {
  tickets: number;
}

export function TopAppBar({ tickets }: TopAppBarProps) {
  const { user, logout } = useAuth();

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
              Luckydrop
            </h1>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              진행중인 드로우
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              당첨자 발표
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              이용 방법
            </a>
          </nav>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            {/* 티켓 수 */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
              <Ticket className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-900">{tickets}</span>
            </div>

            {/* 아이콘 메뉴 */}
            <div className="hidden md:flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 로그인/회원가입 또는 사용자 정보 */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-gray-700 font-medium">
                    환영합니다, {user.name}님!
                  </span>
                  <button
                    onClick={logout}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                  </button>
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