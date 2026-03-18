import { useState } from 'react';
import { TopAppBar } from '@/app/components/TopAppBar';
import { HeroSection } from '@/app/components/HeroSection';
import { DrawCard } from '@/app/components/DrawCard';
import { TicketHistoryPreview } from '@/app/components/TicketHistoryPreview';
import { DrawResultCard } from '@/app/components/DrawResultCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// 모의 데이터
const heroDrawData = {
  id: 1,
  title: 'Apple Watch Ultra',
  description: '최신 스마트워치의 끝판왕',
  images: [
    'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?w=800',
    'https://images.unsplash.com/photo-1699265837122-7636e128b4b0?w=800',
  ],
  ticketCost: 5,
  timeLeft: '23:45:12',
  liked: false,
};

const ongoingDraws = [
  {
    id: 2,
    title: 'iPhone 15 Pro',
    image: 'https://images.unsplash.com/photo-1699265837122-7636e128b4b0?w=600',
    timeLeft: '12:30:00',
    winners: 1,
    liked: false,
    ticketCost: 3,
  },
  {
    id: 3,
    title: 'Sony WH-1000XM5',
    image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=600',
    timeLeft: '18:15:30',
    winners: 2,
    liked: true,
    ticketCost: 2,
  },
  {
    id: 4,
    title: 'Canon EOS R6',
    image: 'https://images.unsplash.com/photo-1580978021179-edb8cd69dbd1?w=600',
    timeLeft: '06:45:20',
    winners: 1,
    liked: false,
    ticketCost: 10,
  },
  {
    id: 5,
    title: 'MacBook Pro 16',
    image: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=600',
    timeLeft: '48:00:00',
    winners: 1,
    liked: false,
    ticketCost: 15,
  },
  {
    id: 6,
    title: 'PlayStation 5',
    image: 'https://images.unsplash.com/photo-1604846887565-640d2f52d564?w=600',
    timeLeft: '08:20:45',
    winners: 3,
    liked: true,
    ticketCost: 8,
  },
];

const ticketHistory = [
  { id: 1, type: '지급', amount: 10, reason: '회원가입 보너스', date: '2026-01-19' },
  { id: 2, type: '사용', amount: -5, reason: 'Apple Watch 응모', date: '2026-01-19' },
  { id: 3, type: '지급', amount: 5, reason: '출석 체크', date: '2026-01-18' },
  { id: 4, type: '사용', amount: -3, reason: 'iPhone 15 응모', date: '2026-01-18' },
];

const drawResults = [
  {
    id: 1,
    title: 'AirPods Pro',
    status: '당첨',
    message: '축하합니다! 🎉',
    date: '2026-01-15',
    image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=400',
  },
  {
    id: 2,
    title: 'Galaxy Buds',
    status: '미당첨',
    message: '다음 기회에 도전하세요!',
    date: '2026-01-12',
    image: 'https://images.unsplash.com/photo-1674658556545-f18d4080ab6c?w=400',
  },
];

export function MainPage() {
  const [userTickets] = useState(120);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top App Bar */}
      <TopAppBar tickets={userTickets} />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 히어로 섹션 */}
        <HeroSection draw={heroDrawData} userTickets={userTickets} />

        {/* 진행 중인 럭키드로우 리스트 */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">진행 중인 드로우</h2>
            <button className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium">
              전체보기 →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoingDraws.map((draw) => (
              <DrawCard key={draw.id} draw={draw} />
            ))}
          </div>
        </section>

        {/* 하단 섹션 - 2컬럼 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* 티켓 내역 미리보기 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">티켓 내역</h2>
              <button className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium">
                전체보기 →
              </button>
            </div>
            <TicketHistoryPreview history={ticketHistory} />
          </section>

          {/* 드로우 결과 미리보기 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">최근 결과</h2>
              <button className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium">
                전체보기 →
              </button>
            </div>
            <div className="space-y-4">
              {drawResults.map((result) => (
                <DrawResultCard key={result.id} result={result} />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2026 Luckydrop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
