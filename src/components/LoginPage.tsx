import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Lock, Ticket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // On successful login, the user state will change,
      // and the component will re-render, triggering the <Navigate />
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.';
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
    window.location.assign(`${apiBaseUrl}/oauth2/authorization/google`);
  };

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get('oauthError');
    if (error) {
      toast.error(error);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">L</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Luckydrop
            </h1>
          </Link>
          <p className="text-gray-600">티켓으로 즐기는 럭키드로우</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path fill="#4285F4" d="M21.35 12.24c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.5h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z" />
              <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.5c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.59A9.75 9.75 0 0 0 12 21.75Z" />
              <path fill="#FBBC05" d="M6.54 13.79A5.87 5.87 0 0 1 6.24 12c0-.62.11-1.22.3-1.79V7.62H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.38l3.24-2.59Z" />
              <path fill="#EA4335" d="M12 6.18c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.27 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.37l3.24 2.59c.77-2.31 2.92-4.03 5.46-4.03Z" />
            </svg>
            Google로 로그인하기
          </button>

          {/* 추가 옵션 */}
          <div className="mt-6 text-center space-y-3">
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-gray-600">로그인 유지</span>
              </label>
              <Link to="/forgot-password" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                비밀번호 찾기
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                아직 회원이 아니신가요?{' '}
                <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                  회원가입
                </Link>
              </p>
            </div>
          </div>

          {/* 혜택 안내 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Ticket className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">회원가입 혜택</p>
                <p className="text-xs text-gray-600 mt-1">
                  지금 가입하고 무료 티켓 10개를 받으세요!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

