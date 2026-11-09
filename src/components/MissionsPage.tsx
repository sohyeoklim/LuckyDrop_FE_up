import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Clock, Flame, Gift, Users, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getTicketWallet } from '@/api/client';
import { checkIn, getMyMissions, type MissionDto } from '@/api/mission';

const metadata = {
  ATTENDANCE: { label: '일일 미션', color: 'from-blue-500 to-cyan-500', Icon: Calendar },
  AD: { label: '광고 미션', color: 'from-green-500 to-emerald-500', Icon: Video },
  EVENT: { label: '이벤트 미션', color: 'from-purple-500 to-pink-500', Icon: Gift },
  INVITE: { label: '친구 초대', color: 'from-orange-500 to-red-500', Icon: Users },
} as const;

export function MissionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [missions, setMissions] = useState<MissionDto[]>([]);
  const [tickets, setTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [missionData, wallet] = await Promise.all([getMyMissions(), getTicketWallet()]);
      setMissions(missionData);
      setTickets(wallet.balance ?? 0);
    } catch { toast.error('미션 정보를 불러오지 못했습니다.'); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => { void load(); }, [load]);

  const attend = async () => {
    setCheckingIn(true);
    try { const result = await checkIn(); toast.success(result.message); await load(); }
    catch (error: any) { toast.error(error?.response?.data?.message ?? '출석 체크에 실패했습니다.'); }
    finally { setCheckingIn(false); }
  };
  const streak = missions.filter(m => m.code.startsWith('ATTENDANCE_BONUS_')).reduce((value, m) => Math.max(value, m.progress), 0);
  const action = (mission: MissionDto) => {
    if (mission.completed) return <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-500"><CheckCircle className="h-5 w-5" />완료</span>;
    if (mission.code === 'ATTENDANCE_DAILY') return <button disabled={checkingIn} onClick={attend} className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 font-medium text-white disabled:opacity-50">{checkingIn ? '처리 중...' : '출석 체크'}</button>;
    if (mission.adVerificationRequired) return <span className="block w-full rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-500">광고 제공사 연동 후 이용 가능</span>;
    if (mission.code === 'DRAW_DAILY' || mission.code === 'DRAW_FIRST') return <Link to="/draws" className="block w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-center font-medium text-white">드로우 참여하기</Link>;
    return <span className="block w-full rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-500">조건 달성 시 자동 지급</span>;
  };

  return <div className="min-h-screen bg-gray-50"><header className="sticky top-0 z-50 border-b bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4"><button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600"><ArrowLeft className="h-5 w-5" />돌아가기</button><h1 className="text-xl font-bold">미션</h1><div className="w-20" /></div></header><main className="mx-auto max-w-7xl px-4 py-8"><section className="mb-8 flex items-center justify-between rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white"><div><p className="text-purple-100">현재 보유 티켓</p><p className="text-4xl font-bold">{tickets}</p></div><div className="text-right"><p className="text-purple-100">연속 출석</p><p className="flex items-center gap-2 text-3xl font-bold"><Flame className="h-6 w-6" />{streak}일</p></div></section>{loading ? <p className="py-16 text-center text-gray-500">미션을 불러오는 중...</p> : (Object.keys(metadata) as MissionDto['type'][]).map(type => { const list = missions.filter(m => m.type === type); const { label, color, Icon } = metadata[type]; return list.length ? <section key={type} className="mb-8"><div className="mb-4 flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${color} text-white`}><Icon className="h-5 w-5" /></div><h2 className="text-2xl font-bold">{label}</h2>{type === 'ATTENDANCE' && <span className="ml-auto flex gap-1 text-sm text-gray-600"><Clock className="h-4 w-4" />자정에 초기화</span>}</div><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map(mission => { const MissionIcon = mission.code.startsWith('ATTENDANCE_BONUS_') ? Flame : Icon; const progress = Math.min(100, mission.progress / mission.target * 100); return <article key={mission.code} className="rounded-xl bg-white p-6 shadow-lg"><div className="mb-4 flex gap-4"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r ${color} text-white`}><MissionIcon className="h-6 w-6" /></div><div className="flex-1"><h3 className="font-bold">{mission.title}</h3><p className="text-sm text-gray-600">{mission.description}</p>{mission.target > 1 && <><div className="mt-3 flex justify-between text-sm"><span>진행도</span><span>{mission.progress} / {mission.target}</span></div><div className="mt-1 h-2 rounded-full bg-gray-200"><div className={`h-2 rounded-full bg-gradient-to-r ${color}`} style={{ width: `${progress}%` }} /></div></>}</div><strong className="whitespace-nowrap text-purple-600">+{mission.rewardTickets}T</strong></div>{action(mission)}</article>; })}</div></section> : null; })}<section className="rounded-xl bg-white p-6 shadow-lg"><h2 className="mb-2 text-lg font-bold">내 초대 코드</h2><div className="flex gap-2"><input readOnly value={user?.invitationCode ?? ''} className="flex-1 rounded-lg border bg-gray-50 px-4 py-3" /><button onClick={() => navigator.clipboard.writeText(user?.invitationCode ?? '').then(() => toast.success('초대 코드가 복사되었습니다!'))} className="rounded-lg bg-orange-500 px-6 py-3 font-medium text-white">복사</button></div></section></main></div>;
}
