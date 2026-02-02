import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Ticket, CheckCircle, Smartphone, Smile, Home } from 'lucide-react';
import apiClient from '../../api/client';

declare global {
  interface Window {
    daum: any;
  }
}

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAgreements(prev => ({ ...prev, [name]: checked }));
  };

  const handleAllAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setAgreements({
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };
  
  const allRequiredAgreed = agreements.terms && agreements.privacy;

  const handleNextStep = () => {
    if (allRequiredAgreed) {
      setStep(2);
    } else {
      alert('필수 약관에 동의해주세요.');
    }
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        setPostcode(data.zonecode);
        setAddress(data.address);
      },
    }).open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    const payload = {
      name,
      nickname,
      phone: phoneNumber,
      email,
      password,
      address: `${postcode} ${address} ${addressDetail}`.trim(), // 하나의 문자열
      //agreements,
    };

    try {
      await apiClient.post('/api/member/create', payload);
      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (error: any) {
      console.error('Signup failed:', error);
      const errorMessage = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      alert(errorMessage);
    }
  };

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
          <p className="text-gray-600">무료 티켓 10개와 함께 시작하세요!</p>
        </div>

        {/* 회원가입 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h2>

          {/* 스텝 인디케이터 */}
          <div className="flex justify-center items-center mb-6">
            <div className={`flex items-center ${step === 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step === 1 ? 'border-purple-600' : 'border-gray-400'}`}>1</div>
              <span className="ml-2 font-medium">약관동의</span>
            </div>
            <div className="w-12 h-px bg-gray-300 mx-4"></div>
            <div className={`flex items-center ${step === 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step === 2 ? 'border-purple-600' : 'border-gray-400'}`}>2</div>
              <span className="ml-2 font-medium">정보입력</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={handleAllAgreementChange}
                    checked={agreements.terms && agreements.privacy && agreements.marketing}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 font-semibold text-gray-800">전체 동의</span>
                </label>
              </div>
              <div className="space-y-3 pl-2">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={agreements.terms}
                    onChange={handleAgreementChange}
                    className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">[필수] 이용약관</a>
                    에 동의합니다.
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="privacy"
                    checked={agreements.privacy}
                    onChange={handleAgreementChange}
                    className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">[필수] 개인정보처리방침</a>
                    에 동의합니다.
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="marketing"
                    checked={agreements.marketing}
                    onChange={handleAgreementChange}
                    className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">[선택] 마케팅 정보 수신</a>
                    에 동의합니다.
                  </span>
                </label>
              </div>
              <button
                onClick={handleNextStep}
                disabled={!allRequiredAgreed}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <div className="relative">
                  <User className="absolute h-5 w-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              {/* 닉네임 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
                <div className="relative">
                  <Smile className="absolute h-5 w-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="사용하실 닉네임을 입력하세요" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              {/* 핸드폰번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">핸드폰번호</label>
                <div className="relative">
                  <Smartphone className="absolute h-5 w-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="010-1234-5678" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              {/* 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">주소 (선택)</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={postcode} placeholder="우편번호" readOnly className="block w-1/3 px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none"/>
                  <button type="button" onClick={handleAddressSearch} className="w-2/3 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200">주소 검색</button>
                </div>
                <div className="relative">
                  <Home className="absolute h-5 w-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={address} placeholder="주소" readOnly className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none"/>
                </div>
                <div className="relative mt-2">
                  <input type="text" value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} placeholder="상세주소를 입력하세요" className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                </div>
              </div>
              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <div className="relative">
                  <Mail className="absolute h-5 w-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              {/* 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute h-5 w-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8자 이상 입력해주세요" required minLength={8} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                <div className="relative">
                  <Lock className="absolute h-5 w-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호를 다시 입력해주세요" required minLength={8} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
                >
                  이전
                </button>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  회원가입
                </button>
              </div>
            </form>
          )}

          {/* 로그인 링크 */}
          <div className="mt-6 text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
