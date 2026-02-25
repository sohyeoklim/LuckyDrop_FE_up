import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Ticket, CheckCircle, ArrowLeft } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email Verification, 2: New Password
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 이메일 인증 상태
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [showAuthCodeInput, setShowAuthCodeInput] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3분
  const countdownIntervalRef = useRef<NodeJS.Timeout>();

  // 인증번호 발송
  const handleSendAuthCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('올바른 이메일을 입력해주세요.');
      return;
    }

    setIsSendingEmail(true);
    try {
      // 실제 API 엔드포인트는 백엔드 스펙에 맞춰 수정 필요
      await apiClient.post('/api/user/forgot-password', { email });
      toast.success('인증번호가 발송되었습니다!');
      setShowAuthCodeInput(true);
      setAuthCode('');
      setCountdown(180); // 3분
      
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      countdownIntervalRef.current = interval;
    } catch (error: any) {
      toast.error(error.response?.data?.message || '발송 실패. 등록된 이메일인지 확인해주세요.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 인증번호 확인
  const handleVerifyAuthCode = async () => {
    if (!authCode.trim()) {
      toast.error('인증번호를 입력해주세요.');
      return;
    }

    setIsVerifyingCode(true);
    try {
      await apiClient.post('/api/user/verify-reset-code', { 
        email, 
        authNum: authCode.trim()
      });
      setIsEmailVerified(true);
      setShowAuthCodeInput(false);
      toast.success('인증이 완료되었습니다!');
      // 인증 완료 후 다음 단계로 이동
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '인증 실패');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // 비밀번호 재설정 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (password.length < 8) {
        toast.error('비밀번호는 8자 이상이어야 합니다.');
        return;
    }

    try {
      await apiClient.post('/api/user/reset-password', {
        email,
        authNum: authCode.trim(),
        newPassword: password,
      });
      toast.success('비밀번호가 성공적으로 변경되었습니다!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '비밀번호 변경 실패');
    }
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

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
          <p className="text-gray-600">비밀번호 찾기</p>
        </div>

        {/* 카드 컨텐츠 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => step === 1 ? navigate('/login') : setStep(1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 ? '이메일 인증' : '새 비밀번호 설정'}
            </h2>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <p className="text-gray-600 text-sm">
                가입하신 이메일 주소를 입력하시면 인증번호를 보내드립니다.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendAuthCode}
                      disabled={isSendingEmail || !email}
                      className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:from-gray-400 disabled:to-gray-500 whitespace-nowrap"
                    >
                      {isSendingEmail ? '발송중...' : '인증번호'}
                    </button>
                  </div>
                </div>

                {showAuthCodeInput && (
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Ticket className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={authCode}
                          onChange={(e) => setAuthCode(e.target.value)}
                          placeholder="인증번호 6자리"
                          maxLength={6}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {countdown > 0 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-purple-600">
                            {Math.floor(countdown/60)}:{(countdown%60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyAuthCode}
                        disabled={isVerifyingCode || !authCode}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:from-gray-400 disabled:to-gray-500"
                      >
                        {isVerifyingCode ? '확인중...' : '확인'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      이메일로 발송된 6자리 인증번호를 입력해주세요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-gray-600 text-sm">
                새로운 비밀번호를 설정해주세요. (8자 이상)
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 비밀번호
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl mt-4"
                >
                  비밀번호 변경 완료
                </button>
              </div>
            </form>
          )}

          {/* 하단 링크 */}
          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
              로그인 화면으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
