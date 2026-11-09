import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Gift, Phone, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

export function GoogleOnboardingPage() {
  const navigate = useNavigate();
  const { user, isLoading, fetchUserDetails } = useAuth();
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [referredByCode, setReferredByCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-gray-50" />;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!/^[a-zA-Z가-힣0-9_]{2,16}$/.test(nickname)) {
      toast.error('닉네임은 한글, 영문, 숫자, _로 2~16자 입력해주세요.');
      return;
    }
    if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(phone)) {
      toast.error('올바른 전화번호를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/api/user/onboarding', {
        nickname,
        phone,
        referredByCode: referredByCode.trim() || null,
      });
      await fetchUserDetails();
      toast.success('프로필이 완성됐어요. LuckyDrop을 즐겨보세요!');
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? '프로필 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Gift className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">프로필을 완성해주세요</h1>
          <p className="mt-2 text-sm text-gray-600">당첨 안내와 원활한 배송을 위해 필요한 정보예요.</p>
          <p className="mt-1 text-xs text-gray-400">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">닉네임</span>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="2~16자, 한글·영문·숫자·_"
                maxLength={16}
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">전화번호</span>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => setPhone(formatPhoneNumber(event.target.value))}
                placeholder="010-1234-5678"
                maxLength={13}
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">추천인 코드 <span className="font-normal text-gray-400">(선택)</span></span>
            <input
              value={referredByCode}
              onChange={(event) => setReferredByCode(event.target.value.toUpperCase())}
              placeholder="예: AB12CD34"
              maxLength={8}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 font-mono uppercase outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-medium text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? '저장 중...' : '프로필 완성하고 시작하기'}
          </button>
        </form>
      </section>
    </main>
  );
}
