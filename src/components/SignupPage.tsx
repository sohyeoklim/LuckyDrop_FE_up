import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Ticket, CheckCircle, Smartphone, Smile, Home, Users, Check, X } from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

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
  const [referredByCode, setReferredByCode] = useState('');
 
  // 이메일 인증 상태 - 3분 타이머
  const [authCode, setAuthCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [showAuthCodeInput, setShowAuthCodeInput] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3분
  const [canResendEmail, setCanResendEmail] = useState(true); // 재발송 가능 여부
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 이메일 중복 체크 상태
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [emailError, setEmailError] = useState('');
  const emailDebounceRef = useRef<NodeJS.Timeout>();

  // 닉네임 중복 체크 상태
  const [nicknameStatus, setNicknameStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'tooShort'>('idle');
  const [nicknameError, setNicknameError] = useState('');
  const nicknameDebounceRef = useRef<NodeJS.Timeout>();

  // 핸드폰 번호 유효성 검사 상태
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [phoneError, setPhoneError] = useState('');
  const phoneDebounceRef = useRef<NodeJS.Timeout>();

  // 이름 유효성 검사 상태 (추가)
  const [nameStatus, setNameStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [nameError, setNameError] = useState('');

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
      toast.error('필수 약관에 동의해주세요.');
    }
  };

  // 이름 입력 - 실시간 필터링 제거, 제출시만 검사
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  // 이름 유효성 검사 (제출시 호출)
  const validateName = (nameValue: string) => {
    if (!nameValue.trim()) {
      setNameStatus('invalid');
      setNameError('이름을 입력해주세요.');
      return false;
    }
    // 한글/영어만 허용 (백엔드에서 최종 검사)
    const nameRegex = /^[가-힣a-zA-Z\s]+$/;
    if (!nameRegex.test(nameValue.trim())) {
      setNameStatus('invalid');
      setNameError('한글 또는 영어만 입력 가능합니다.');
      return false;
    }
    setNameStatus('valid');
    setNameError('');
    return true;
  };

  // 핸드폰 번호 실시간 유효성 검사
  const checkPhoneNumber = useCallback((phoneValue: string) => {
    // 한국 핸드폰 번호 정규표현식: 010-XXXX-XXXX 형식 (하이픈 포함/미포함 모두 허용)
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{4})-?([0-9]{4})$/;
    
    if (!phoneValue) {
      setPhoneStatus('idle');
      setPhoneError('');
      return;
    }

    if (phoneRegex.test(phoneValue.replace(/-/g, ''))) {
      setPhoneStatus('valid');
      setPhoneError('');
    } else {
      setPhoneStatus('invalid');
      setPhoneError('올바른 핸드폰 번호 형식이 아닙니다. (010-XXXX-XXXX)');
    }
  }, []);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
      .replace(/[^0-9]/g, '') // 숫자만 남기기
      .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, '$1-$2-$3'); // 하이픈 자동 추가

    // 11자리까지만 허용
    value = value.slice(0, 13);
    setPhoneNumber(value);

    // 이전 debounce 취소
    if (phoneDebounceRef.current) {
      clearTimeout(phoneDebounceRef.current);
    }

    // 300ms 후에 유효성 검사
    phoneDebounceRef.current = setTimeout(() => {
      checkPhoneNumber(value);
    }, 300);
  };

  // 이메일 실시간 중복 체크
  const checkEmail = useCallback(async (emailValue: string) => {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setEmailStatus('idle');
      setEmailError('');
      return;
    }

    if (emailStatus === 'checking') return;

    setEmailStatus('checking');
    setEmailError('');

    try {
      const response = await apiClient.post('/api/user/check-email', { email: emailValue });
      if (response.data.available) {
        setEmailStatus('valid');
      } else {
        setEmailStatus('invalid');
        setEmailError('이미 사용중인 이메일입니다.');
      }
    } catch (error: any) {
      setEmailStatus('invalid');
      setEmailError(error.response?.data?.message || '이메일 확인 실패');
    }
  }, [emailStatus]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // 이전 debounce 취소
    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current);
    }

    // 500ms 후에 중복 체크
    emailDebounceRef.current = setTimeout(() => {
      checkEmail(value);
    }, 500);
  };

  // 닉네임 실시간 중복 체크
  const checkNickname = useCallback(async (nicknameValue: string) => {
    if (nicknameValue.length < 2) {
      setNicknameStatus('tooShort');
      setNicknameError('닉네임은 2글자 이상 입력해주세요.');
      return;
    }

    if (nicknameStatus === 'checking') return;

    setNicknameStatus('checking');
    setNicknameError('');

    try {
      const response = await apiClient.post('/api/user/check-nickname', { nickname: nicknameValue });
      if (response.data.available) {
        setNicknameStatus('valid');
      } else {
        setNicknameStatus('invalid');
        setNicknameError('이미 사용중인 닉네임입니다.');
      }
    } catch (error: any) {
      setNicknameStatus('invalid');
      setNicknameError(error.response?.data?.message || '닉네임 확인 실패');
    }
  }, [nicknameStatus]);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);

    // 이전 debounce 취소
    if (nicknameDebounceRef.current) {
      clearTimeout(nicknameDebounceRef.current);
    }

    // 500ms 후에 중복 체크
    nicknameDebounceRef.current = setTimeout(() => {
      checkNickname(value);
    }, 500);
  };

  // 인증번호 발송 - 중복 체크 완료된 이메일만 발송 가능
  const handleSendAuthCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('올바른 이메일을 입력해주세요.');
      return;
    }

    if (emailStatus !== 'valid') {
      toast.error('이메일 중복 확인 후 인증번호를 발송해주세요.');
      return;
    }

    if (!canResendEmail) {
      toast.error('3분 후에 다시 발송할 수 있습니다.');
      return;
    }

    setIsSendingEmail(true);
    try {
      await apiClient.post('/api/signup/email', { email });
      toast.success('인증번호가 발송되었습니다!');
      setShowAuthCodeInput(true);
      setAuthCode('');
      setCountdown(180); // 3분
      setCanResendEmail(false); // 재발송 불가
      
      const interval = setInterval(() => {
        setCountdown(prev => {
         if (prev <= 1) {
           clearInterval(interval);
           setCanResendEmail(true); // 3분 후 재발송 가능
           return 0;
         }
         return prev - 1;
        });
      }, 1000);
      intervalRef.current = interval;
    } catch (error: any) {
      toast.error(error.response?.data?.message || '발송 실패');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 인증번호 확인 (authNum 사용)
  const handleVerifyAuthCode = async () => {
    if (!authCode.trim()) {
      toast.error('인증번호를 입력해주세요.');
      return;
    }

    setIsVerifyingCode(true);
    try {
      await apiClient.post('/api/signup/emailAuth', { 
        email, 
        authNum: authCode.trim()
      });
      setIsEmailVerified(true);
      setShowAuthCodeInput(false);
      setCanResendEmail(true); // 인증 완료 시 재발송 가능하게
      toast.success('인증이 완료되었습니다!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '인증 실패');
    } finally {
      setIsVerifyingCode(false);
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
    
    // 이름 유효성 검사
    if (!validateName(name)) {
      toast.error(nameError);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isEmailVerified) {
      toast.error('이메일 인증을 완료해주세요.');
      return;
    }
    if (emailStatus !== 'valid') {
      toast.error('이메일 중복 확인을 완료해주세요.');
      return;
    }
    if (nicknameStatus !== 'valid') {
      toast.error('닉네임 중복 확인을 완료해주세요.');
      return;
    }
    if (phoneStatus !== 'valid') {
      toast.error('올바른 핸드폰 번호를 입력해주세요.');
      return;
    }

    const payload = {
      name: name.trim(), 
      nickname, 
      phone: phoneNumber, // 하이픈 제거 후 백엔드 전송
      email, 
      password,
      address: `${postcode} ${address} ${addressDetail}`.trim(),
      referredByCode: referredByCode.trim() || null,
    };

    try {
      await apiClient.post('/api/user/create', payload);
      toast.success('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '회원가입 실패');
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
      if (nicknameDebounceRef.current) clearTimeout(nicknameDebounceRef.current);
      if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);
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
         <p className="text-gray-600">무료 티켓 10개와 함께 시작하세요!</p>
        </div>

        {/* 회원가입 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
         <h2 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h2>

         {/* 스텝 인디케이터 */}
         <div className="flex items-center justify-center mb-8">
           <div className={`flex items-center ${step === 1 ? 'text-purple-600' : 'text-gray-400'}`}>
             <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step === 1 ? 'border-purple-600 bg-purple-50' : 'border-gray-400 bg-gray-100'}`}>1</div>
             <span className="ml-2 font-medium">약관</span>
           </div>
           <div className="w-12 h-px bg-gray-300 mx-4"></div>
           <div className={`flex items-center ${step === 2 ? 'text-purple-600' : 'text-gray-400'}`}>
             <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step === 2 ? 'border-purple-600 bg-purple-50' : 'border-gray-400 bg-gray-100'}`}>2</div>
             <span className="ml-2 font-medium">정보입력</span>
           </div>
         </div>

         {step === 1 && (
           <div className="space-y-4 mb-8">
             <div className="border border-gray-200 rounded-xl p-4 mb-4">
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
                 <input type="checkbox" name="terms" checked={agreements.terms} onChange={handleAgreementChange} className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                 <span className="ml-3 text-sm text-gray-600">
                   <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">[필수] 이용약관</a> 동의
                 </span>
               </label>
               <label className="flex items-start">
                 <input type="checkbox" name="privacy" checked={agreements.privacy} onChange={handleAgreementChange} className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                 <span className="ml-3 text-sm text-gray-600">
                   <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">[필수] 개인정보처리방침</a> 동의
                 </span>
               </label>
               <label className="flex items-start">
                 <input type="checkbox" name="marketing" checked={agreements.marketing} onChange={handleAgreementChange} className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                 <span className="ml-3 text-sm text-gray-600">
                   <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">[선택] 마케팅</a> 동의
                 </span>
               </label>
             </div>
             
             <button
               onClick={handleNextStep}
               disabled={!allRequiredAgreed}
               className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500"
             >
               다음
             </button>
           </div>
         )}

         {step === 2 && (
           <form onSubmit={handleSubmit} className="space-y-4">
             {/* 1. 이름 - 실시간 필터링 제거, 제출시만 검사 */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">이름 <span className="text-red-500">*</span></label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <User className="h-5 w-5 text-gray-400" />
                 </div>
                 <input
                   type="text"
                   value={name}
                   onChange={handleNameChange}
                   placeholder="홍길동"
                   maxLength={20}
                   className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                     nameStatus === 'valid' 
                       ? 'border-green-300 bg-green-50' 
                       : nameStatus === 'invalid' 
                       ? 'border-red-300 bg-red-50' 
                       : 'border-gray-300'
                   }`}
                 />
               </div>
               {/* 이름 상태 표시 */}
               {nameStatus !== 'idle' && (
                 <div className="mt-2 flex items-center gap-2">
                   {nameStatus === 'valid' && (
                     <Check className="h-4 w-4 text-green-500" />
                   )}
                   {nameStatus === 'invalid' && (
                     <X className="h-4 w-4 text-red-500" />
                   )}
                   <span className={`text-sm ${
                     nameStatus === 'valid' ? 'text-green-700 font-medium' :
                     nameStatus === 'invalid' ? 'text-red-700 font-medium' :
                     'text-gray-500'
                   }`}>
                     {nameStatus === 'valid' && '올바른 이름 형식입니다.'}
                     {nameStatus === 'invalid' && nameError}
                   </span>
                 </div>
               )}
             </div>

             {/* 2. 닉네임 - 실시간 중복 체크 */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">닉네임 <span className="text-red-500">*</span></label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Smile className="h-5 w-5 text-gray-400" />
                 </div>
                 <input
                   type="text"
                   value={nickname}
                   onChange={handleNicknameChange}
                   placeholder="닉네임"
                   maxLength={16}
                   className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                     nicknameStatus === 'valid' 
                       ? 'border-green-300 bg-green-50' 
                       : nicknameStatus === 'invalid' 
                       ? 'border-red-300 bg-red-50' 
                       : 'border-gray-300'
                   }`}
                 />
               </div>
               {/* 닉네임 상태 표시 */}
               {nicknameStatus !== 'idle' && (
                 <div className="mt-2 flex items-center gap-2">
                   {nicknameStatus === 'checking' && (
                     <div className="w-4 h-4 border border-purple-500 border-t-transparent rounded-full animate-spin" />
                   )}
                   {nicknameStatus === 'valid' && (
                     <Check className="h-4 w-4 text-green-500" />
                   )}
                   {nicknameStatus === 'invalid' && (
                     <X className="h-4 w-4 text-red-500" />
                   )}
                   <span className={`text-sm ${
                     nicknameStatus === 'valid' ? 'text-green-700 font-medium' :
                     nicknameStatus === 'invalid' || nicknameStatus === 'tooShort' ? 'text-red-700 font-medium' :
                     'text-gray-500'
                   }`}>
                     {nicknameStatus === 'checking' && '닉네임 확인중...'}
                     {nicknameStatus === 'valid' && '사용 가능한 닉네임입니다.'}
                     {nicknameStatus === 'invalid' && nicknameError}
                     {nicknameStatus === 'tooShort' && nicknameError}
                   </span>
                 </div>
               )}
             </div>

             {/* 3. 이메일 (실시간 중복 체크 + 인증) */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 이메일 <span className="text-red-500">*</span>
               </label>
               {isEmailVerified ? (
                 <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                   <div className="flex items-center gap-2">
                     <CheckCircle className="h-5 w-5 text-green-500" />
                     <span className="font-medium text-green-800">{email}</span>
                   </div>
                   <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">인증완료</span>
                 </div>
               ) : (
                 <>
                   <div className="flex gap-2 mb-2">
                     <div className="flex-1 relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <Mail className="h-5 w-5 text-gray-400" />
                       </div>
                       <input
                         type="email"
                         value={email}
                         onChange={handleEmailChange}
                         placeholder="your@email.com"
                         className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                           emailStatus === 'valid' 
                             ? 'border-green-300 bg-green-50' 
                             : emailStatus === 'invalid' 
                             ? 'border-red-300 bg-red-50' 
                             : 'border-gray-300'
                         }`}
                       />
                     </div>
                     <button
                       type="button"
                       onClick={handleSendAuthCode}
                       disabled={isSendingEmail || !email || emailStatus !== 'valid' || !canResendEmail}
                       className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
                       title={!canResendEmail ? '3분 후 재발송 가능' : emailStatus !== 'valid' ? '이메일 중복 확인 필요' : ''}
                     >
                       {isSendingEmail ? (
                         <>
                           <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                           발송중
                         </>
                       ) : (
                         '인증번호'
                       )}
                     </button>
                   </div>
                   
                   {/* 이메일 상태 표시 */}
                   {emailStatus !== 'idle' && !isEmailVerified && (
                     <div className="flex items-center gap-2 mb-2">
                       {emailStatus === 'checking' && (
                         <div className="w-4 h-4 border border-purple-500 border-t-transparent rounded-full animate-spin" />
                       )}
                       {emailStatus === 'valid' && (
                         <Check className="h-4 w-4 text-green-500" />
                       )}
                       {emailStatus === 'invalid' && (
                         <X className="h-4 w-4 text-red-500" />
                       )}
                       <span className={`text-sm ${
                         emailStatus === 'valid' ? 'text-green-700 font-medium' :
                         emailStatus === 'invalid' ? 'text-red-700 font-medium' :
                         'text-gray-500'
                       }`}>
                         {emailStatus === 'checking' && '이메일 확인중...'}
                         {emailStatus === 'valid' && '사용 가능한 이메일입니다.'}
                         {emailStatus === 'invalid' && emailError}
                       </span>
                     </div>
                   )}
                   
                   {showAuthCodeInput && (
                     <div className="p-3 bg-gray-50 border rounded-xl">
                       <div className="flex gap-2">
                         <div className="flex-1 relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Ticket className="h-5 w-5 text-gray-400" />
                           </div>
                           <input
                             type="text"
                             value={authCode}
                             onChange={(e) => setAuthCode(e.target.value)}
                             placeholder="000000"
                             maxLength={6}
                             className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                           />
                           {countdown > 0 && (
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
                               {Math.floor(countdown/60)}:{(countdown%60).toString().padStart(2, '0')}
                             </div>
                           )}
                         </div>
                         <button
                           type="button"
                           onClick={handleVerifyAuthCode}
                           disabled={isVerifyingCode || !authCode}
                           className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
                         >
                           {isVerifyingCode ? (
                             <>
                               <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                               확인중
                             </>
                           ) : (
                             '인증'
                           )}
                         </button>
                       </div>
                       <p className={`text-xs mt-1 ${countdown > 0 ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
                         {countdown > 0 ? '3분 이내 입력해주세요' : '인증번호가 만료되었습니다. 재발송하세요.'}
                       </p>
                     </div>
                   )}
                 </>
               )}
             </div>

             {/* 4. 핸드폰 - 실시간 유효성 검사 */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">핸드폰번호 <span className="text-red-500">*</span></label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Smartphone className="h-5 w-5 text-gray-400" />
                 </div>
                 <input
                   type="tel"
                   value={phoneNumber}
                   onChange={handlePhoneNumberChange}
                   placeholder="010-1234-5678"
                   maxLength={13}
                   className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                     phoneStatus === 'valid' 
                       ? 'border-green-300 bg-green-50' 
                       : phoneStatus === 'invalid' 
                       ? 'border-red-300 bg-red-50' 
                       : 'border-gray-300'
                   }`}
                 />
               </div>
               {/* 핸드폰 상태 표시 */}
               {phoneStatus !== 'idle' && (
                 <div className="mt-2 flex items-center gap-2">
                   {phoneStatus === 'valid' && (
                     <Check className="h-4 w-4 text-green-500" />
                   )}
                   {phoneStatus === 'invalid' && (
                     <X className="h-4 w-4 text-red-500" />
                   )}
                   <span className={`text-sm ${
                     phoneStatus === 'valid' ? 'text-green-700 font-medium' :
                     phoneStatus === 'invalid' ? 'text-red-700 font-medium' :
                     'text-gray-500'
                   }`}>
                     {phoneStatus === 'valid' && '올바른 핸드폰 번호입니다.'}
                     {phoneStatus === 'invalid' && phoneError}
                   </span>
                 </div>
               )}
             </div>

             {/* 5. 비밀번호 */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 <span className="text-red-500">*</span></label>
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

             {/* 6. 비밀번호 확인 */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인 <span className="text-red-500">*</span></label>
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

             {/* 7. 주소 (선택) */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">주소 (선택)</label>
               <div className="space-y-2">
                 <div className="flex gap-2">
                   <input
                     type="text"
                     value={postcode}
                     placeholder="우편번호"
                     readOnly
                     className="flex-1 block px-3 py-3 border border-gray-300 rounded-xl bg-gray-50"
                   />
                   <button
                     type="button"
                     onClick={handleAddressSearch}
                     className="px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300 transition-all duration-200 whitespace-nowrap"
                   >
                     검색
                   </button>
                 </div>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Home className="h-5 w-5 text-gray-400" />
                   </div>
                   <input
                     type="text"
                     value={address}
                     placeholder="기본주소"
                     readOnly
                     className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50"
                   />
                 </div>
                 <input
                   type="text"
                   value={addressDetail}
                   onChange={(e) => setAddressDetail(e.target.value)}
                   placeholder="상세주소"
                   className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                 />
               </div>
             </div>

             {/* 8. 추천인 코드 (맨 마지막 - 선택) */}
             <div className="pt-2">
               <label className="block text-sm font-medium text-gray-700 mb-2">추천인 코드 (선택)</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Users className="h-5 w-5 text-gray-400" />
                 </div>
                 <input
                   type="text"
                   value={referredByCode}
                   onChange={(e) => setReferredByCode(e.target.value.toUpperCase())}
                   placeholder="AB12CD34 (친구에게 받은 코드)"
                   maxLength={8}
                   className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50"
                 />
               </div>
               <p className="text-xs text-purple-600 mt-1 font-medium flex items-center gap-1">
                 <Ticket className="w-4 h-4" />
                 입력 시 <strong>나 + 추천인 모두 5티켓 추가 지급!</strong>
               </p>
             </div>

             <div className="flex gap-4 pt-6">
               <button
                 type="button"
                 onClick={() => setStep(1)}
                 className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
               >
                 이전
               </button>
               <button
                 type="submit"
                 disabled={!isEmailVerified || emailStatus !== 'valid' || nicknameStatus !== 'valid' || phoneStatus !== 'valid' || !name.trim() || !nickname || !phoneNumber || !password || !confirmPassword}
                 className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500"
               >
                 회원가입 완료
               </button>
             </div>
           </form>
         )}

         {/* 로그인 링크 */}
         <div className="mt-8 pt-6 border-t border-gray-200 text-center">
           <p className="text-gray-600">
             이미 계정이 있으신가요?{' '}
             <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
               로그인
             </Link>
           </p>
         </div>

         {/* 혜택 안내 */}
         <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
           <div className="flex items-start gap-3">
             <Ticket className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
             <div>
               <p className="font-semibold text-gray-900">🎁 회원가입 즉시 지급</p>
               <p className="text-sm text-gray-700 mt-1">
                 <strong>기본 10티켓</strong> + <strong className="text-purple-600">추천인코드 입력시 5티켓 추가!</strong>
               </p>
             </div>
           </div>
         </div>
        </div>
      </div>
    </div>
  );
}
