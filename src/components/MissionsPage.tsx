// import { useState } from 'react'; 출석미션 버튼 비활성화로 인한 변경사항
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Video,
  Gift,
  Users,
  CheckCircle,
  Clock,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
// import axios from 'axios'; 광고미션으로 인한 변경사항
import apiClient from '@/api/client';

interface Mission {
  id: number;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  type: 'daily' | 'ad' | 'event' | 'referral';
  progress?: number;
  total?: number;
  icon: React.ReactNode;
}

export function MissionsPage() {
  const navigate = useNavigate();
//   const todayKey = new Date().toISOString().slice(0, 10); // 오늘 날짜 추가 - UTC 기준
  const getTodayKey = () => new Date().toLocaleDateString('sv-SE'); // sv-SE는 YYYY-MM-DD 형식
  const ATTENDANCE_STORAGE_KEY = 'attendanceCheckedDate'; // storage key 추가
  const ATTENDANCE_STREAK_KEY = 'attendanceStreak'; // 연속 출석체크 검사 - api 로 따로 만들어도 됨

//   const savedAttendanceDate = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
//   const isAttendanceCompletedToday = savedAttendanceDate === todayKey;
  const [attendanceCompletedToday, setAttendanceCompletedToday] = useState(false);

  const [userTickets] = useState(120);
  const [consecutiveDays, setConsecutiveDays] = useState(0);

  const [missions, setMissions] = useState<Mission[]>([
    // 일일 미션
    {
      id: 1,
      title: '출석 체크',
      description: '오늘 첫 방문 보상',
      reward: 5,
      completed: false,
      type: 'daily',
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      id: 2,
      title: '연속 출석 보너스',
      description: `${consecutiveDays}일 연속 출석 중!`,
      reward: 10,
      completed: false,
      type: 'daily',
      icon: <Flame className="w-6 h-6" />,
    },
    {
      id: 3,
      title: '드로우 응모',
      description: '오늘 1회 이상 드로우에 응모하기',
      reward: 3,
      completed: false,
      type: 'daily',
      icon: <Gift className="w-6 h-6" />,
    },

    // 광고 미션
    {
      id: 4,
      title: '광고 시청 1',
      description: '30초 광고를 시청하세요',
      reward: 2,
      completed: false,
      type: 'ad',
      icon: <Video className="w-6 h-6" />,
    },
    {
      id: 5,
      title: '광고 시청 2',
      description: '30초 광고를 시청하세요',
      reward: 2,
      completed: false,
      type: 'ad',
      icon: <Video className="w-6 h-6" />,
    },
    {
      id: 6,
      title: '광고 시청 3',
      description: '30초 광고를 시청하세요',
      reward: 2,
      completed: true,
      type: 'ad',
      icon: <Video className="w-6 h-6" />,
    },

    // 이벤트 미션
    {
      id: 7,
      title: '신규 회원 환영 이벤트',
      description: '프로필 정보를 완성하세요',
      reward: 20,
      completed: false,
      type: 'event',
      progress: 3,
      total: 5,
      icon: <Gift className="w-6 h-6" />,
    },
    {
      id: 8,
      title: '럭키드로우 체험',
      description: '첫 럭키드로우에 응모하세요',
      reward: 15,
      completed: false,
      type: 'event',
      icon: <Gift className="w-6 h-6" />,
    },

    // 친구 초대 미션
    {
      id: 9,
      title: '친구 초대 1명',
      description: '친구를 초대하고 티켓을 받으세요',
      reward: 30,
      completed: false,
      type: 'referral',
      progress: 0,
      total: 1,
      icon: <Users className="w-6 h-6" />,
    },
    {
      id: 10,
      title: '친구 초대 5명',
      description: '친구 5명을 초대하고 보너스 티켓을 받으세요',
      reward: 100,
      completed: false,
      type: 'referral',
      progress: 0,
      total: 5,
      icon: <Users className="w-6 h-6" />,
    },
  ]);

  useEffect(() => {
    const todayKey = getTodayKey();
    const savedDate = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    const savedStreak = Number(localStorage.getItem(ATTENDANCE_STREAK_KEY) || '0');

    let nextStreak = 0;
    let completedToday = false;

    if (savedDate) {
      const today = new Date(todayKey + 'T00:00:00');
      const lastDate = new Date(savedDate + 'T00:00:00');

      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        completedToday = true;
        nextStreak = savedStreak;
      } else if (diffDays === 1) {
        completedToday = false;
        nextStreak = savedStreak;
      } else {
        completedToday = false;
        nextStreak = 0;
        localStorage.removeItem(ATTENDANCE_STREAK_KEY);
      }
    }

    setAttendanceCompletedToday(completedToday);
    setConsecutiveDays(nextStreak);
  }, []);

/*
  const handleClaimReward = (missionId: number) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.completed) return;

    // 실제로는 서버에 보상 요청
    toast.success(`${mission.reward} 티켓을 받았습니다!`);

    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
    );
  };
*/

const handleClaimReward = async (missionId: number) => {
  const mission = missions.find((m) => m.id === missionId);
  if (!mission) return;

  if (missionId === 1 && attendanceCompletedToday) return;
  if (missionId !== 1 && mission.completed) return;

  // 1) 출석 미션(id === 1) 백엔드 출석 API 호출
  if (missionId === 1) {
    try {
//       const res = await axios.post('/api/missions/attendance/check-in');
         const res = await apiClient.post('/api/missions/attendance/check-in');

         const data = res.data as {
             success: boolean;
             alreadyCheckedIn: boolean;
             message: string;
             streak: number;
             earnedTickets: number;
             bonusTickets: number;
             totalEarnedTickets: number;
         };

          if (!data.success) {
            toast.error(data.message || '출석 체크에 실패했습니다.');
            return;
          }

          if (data.alreadyCheckedIn) {
            const todayKey = getTodayKey();
            localStorage.setItem(ATTENDANCE_STORAGE_KEY, todayKey);
            localStorage.setItem(ATTENDANCE_STREAK_KEY, String(data.streak));
            setConsecutiveDays(data.streak);
            setAttendanceCompletedToday(true);

            toast(data.message || '오늘의 출석체크는 완료되었습니다.');
          } else {
            const todayKey = getTodayKey();
            localStorage.setItem(ATTENDANCE_STORAGE_KEY, todayKey);
            localStorage.setItem(ATTENDANCE_STREAK_KEY, String(data.streak));
            setConsecutiveDays(data.streak);
            setAttendanceCompletedToday(true);

            toast.success(data.message || '출석 체크 완료!');
          }

      // 출석 미션은 항상 완료 처리
          setMissions((prev) =>
            prev.map((m) =>
              m.id === missionId ? { ...m, completed: true } : m
            )
          );
        } catch (err) {
          console.error(err);
          toast.error('출석 체크 중 오류가 발생했습니다.');
        }

        return;
      }

  // 2) 드로우 응모 미션(id === 3) 백엔드 claim API 호출
    if (missionId === 3) {
      try {
        await apiClient.post('/api/missions/draw/daily/claim');

        toast.success(`${mission.reward} 티켓을 받았습니다!`);

        setMissions((prev) =>
          prev.map((m) =>
            m.id === missionId ? { ...m, completed: true } : m
          )
        );
      } catch (err: any) {
        console.error(err);

        const message =
          err?.response?.data?.message || '드로우 응모 미션 처리 중 오류가 발생했습니다.';
        toast.error(message);
      }

      return;
    }

     // 3) 첫 럭키드로우 체험 미션(id === 8)
     if (missionId === 8) {
       try {
         await apiClient.post('/api/missions/draw/first/claim');

         toast.success(`${mission.reward} 티켓을 받았습니다!`);

         setMissions((prev) =>
           prev.map((m) =>
             m.id === missionId ? { ...m, completed: true } : m
           )
         );
       } catch (err: any) {
         console.error(err);

         const message =
           err?.response?.data?.message || '럭키드로우 체험 미션 처리 중 오류가 발생했습니다.';
         toast.error(message);
       }

       return;
     }

      // 4) 광고 미션 백엔드 광고 API 호출
      if (mission.type === 'ad') {
        try {
          await apiClient.post('/api/missions/ad/complete');

          toast.success(`${mission.reward} 티켓을 받았습니다!`);

          setMissions((prev) =>
            prev.map((m) =>
              m.id === missionId ? { ...m, completed: true } : m
            )
          );
        } catch (err) {
          console.error(err);
          toast.error('광고 미션 처리 중 오류가 발생했습니다.');
        }

        return;
      }

      // 5) 그 외 미션(id !== 1)은 기존처럼 로컬 처리
      toast.success(`${mission.reward} 티켓을 받았습니다!`);

      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
      );
};


  const handleWatchAd = (missionId: number) => {
    // 실제로는 광고 SDK 실행
    toast('광고를 시청 중입니다... (데모)');
    setTimeout(() => {
      handleClaimReward(missionId);
    }, 2000);
  };

  const getMissionsByType = (type: Mission['type']) => {
    return missions.filter((m) => m.type === type);
  };

  const getTypeColor = (type: Mission['type']) => {
    const colors = {
      daily: 'from-blue-500 to-cyan-500',
      ad: 'from-green-500 to-emerald-500',
      event: 'from-purple-500 to-pink-500',
      referral: 'from-orange-500 to-red-500',
    };
    return colors[type];
  };

  const getTypeIcon = (type: Mission['type']) => {
    const icons = {
      daily: <Calendar className="w-5 h-5" />,
      ad: <Video className="w-5 h-5" />,
      event: <Gift className="w-5 h-5" />,
      referral: <Users className="w-5 h-5" />,
    };
    return icons[type];
  };

  const renderMissionCard = (mission: Mission) => (
    <div
      key={mission.id}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 bg-gradient-to-r ${getTypeColor(
              mission.type
            )} rounded-lg flex items-center justify-center text-white flex-shrink-0`}
          >
            {mission.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">{mission.title}</h3>
            <p className="text-sm text-gray-600">
              {mission.id === 2 ? `${consecutiveDays}일 연속 출석 중!` : mission.description}
            </p>
            {mission.progress !== undefined && mission.total !== undefined && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>진행도</span>
                  <span>
                    {mission.progress} / {mission.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${getTypeColor(
                      mission.type
                    )} h-2 rounded-full transition-all`}
                    style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-purple-600 font-bold mb-2">
            <span className="text-lg">+{mission.reward}</span>
            <span className="text-sm">티켓</span>
          </div>
        </div>
      </div>

      {(mission.id === 1 ? attendanceCompletedToday : mission.completed) ? (
        <button
          disabled
          className="w-full bg-gray-100 text-gray-500 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          완료
        </button>
      ) : mission.type === 'ad' ? (
        <button
          onClick={() => handleWatchAd(mission.id)}
          className={`w-full bg-gradient-to-r ${getTypeColor(
            mission.type
          )} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity`}
        >
          광고 시청하고 받기
        </button>
      ) : (
        <button
          onClick={() => handleClaimReward(mission.id)}
          className={`w-full bg-gradient-to-r ${getTypeColor(
            mission.type
          )} text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity`}
        >
          보상 받기
        </button>
      )}
    </div>
  );

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
            <h1 className="text-xl font-bold text-gray-900">미션</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 티켓 현황 카드 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 mb-2">현재 보유 티켓</p>
              <p className="text-4xl font-bold">{userTickets}</p>
            </div>
            <div className="text-right">
              <p className="text-purple-100 mb-2">연속 출석</p>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6" />
                <p className="text-3xl font-bold">{consecutiveDays}일</p>
              </div>
            </div>
          </div>
        </div>

        {/* 일일 미션 */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">일일 미션</h2>
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>자정에 초기화</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getMissionsByType('daily').map(renderMissionCard)}
          </div>
        </section>

        {/* 광고 미션 */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white">
              <Video className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">광고 미션</h2>
            <span className="ml-auto px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              하루 최대 5회
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getMissionsByType('ad').map(renderMissionCard)}
          </div>
        </section>

        {/* 이벤트 미션 */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
              <Gift className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">이벤트 미션</h2>
            <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              기간 한정
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMissionsByType('event').map(renderMissionCard)}
          </div>
        </section>

        {/* 친구 초대 미션 */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">친구 초대</h2>
            <span className="ml-auto px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              보상 최대
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getMissionsByType('referral').map(renderMissionCard)}
          </div>

          {/* 초대 링크 카드 */}
          <div className="mt-4 bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-2">내 초대 코드</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value="LUCKY2026XYZ"
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText('LUCKY2026XYZ');
                  toast.success('초대 코드가 복사되었습니다!');
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                복사
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              친구가 이 코드로 가입하면 둘 다 30 티켓을 받아요!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
