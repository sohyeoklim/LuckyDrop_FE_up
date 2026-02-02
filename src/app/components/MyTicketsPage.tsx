import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';

type TicketType = '지급' | '사용' | '환불';

interface TicketTransaction {
  id: number;
  type: TicketType;
  amount: number;
  reason: string;
  date: string;
  balance: number;
}

export function MyTicketsPage() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | TicketType>('all');
  const [filterMonth, setFilterMonth] = useState('all');

  const [transactions] = useState<TicketTransaction[]>([
    { id: 1, type: '지급', amount: 10, reason: '회원가입 보너스', date: '2026-01-28', balance: 120 },
    { id: 2, type: '사용', amount: -5, reason: 'Apple Watch Ultra 응모', date: '2026-01-28', balance: 110 },
    { id: 3, type: '지급', amount: 5, reason: '출석 체크', date: '2026-01-27', balance: 115 },
    { id: 4, type: '사용', amount: -3, reason: 'iPhone 15 Pro 응모', date: '2026-01-27', balance: 110 },
    { id: 5, type: '지급', amount: 2, reason: '광고 시청', date: '2026-01-27', balance: 113 },
    { id: 6, type: '지급', amount: 5, reason: '출석 체크', date: '2026-01-26', balance: 111 },
    { id: 7, type: '사용', amount: -2, reason: 'Sony WH-1000XM5 응모', date: '2026-01-26', balance: 106 },
    { id: 8, type: '지급', amount: 30, reason: '친구 초대 보상', date: '2026-01-25', balance: 108 },
    { id: 9, type: '사용', amount: -8, reason: 'PlayStation 5 응모', date: '2026-01-25', balance: 78 },
    { id: 10, type: '지급', amount: 2, reason: '광고 시청', date: '2026-01-25', balance: 86 },
    { id: 11, type: '환불', amount: 10, reason: '드로우 취소 환불', date: '2026-01-24', balance: 84 },
    { id: 12, type: '지급', amount: 5, reason: '출석 체크', date: '2026-01-24', balance: 74 },
    { id: 13, type: '사용', amount: -10, reason: 'Canon EOS R6 응모', date: '2026-01-23', balance: 69 },
    { id: 14, type: '지급', amount: 20, reason: '신규 회원 이벤트', date: '2026-01-23', balance: 79 },
    { id: 15, type: '사용', amount: -15, reason: 'MacBook Pro 16 응모', date: '2026-01-22', balance: 59 },
  ]);

  // 필터링
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesMonth = filterMonth === 'all' || transaction.date.startsWith(filterMonth);
    return matchesType && matchesMonth;
  });

  // 통계 계산
  const stats = {
    totalEarned: transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    totalSpent: transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    totalRefund: transactions
      .filter((t) => t.type === '환불')
      .reduce((sum, t) => sum + t.amount, 0),
    currentBalance: 120,
  };

  const getTypeIcon = (type: TicketType) => {
    const icons = {
      지급: <TrendingUp className="w-5 h-5" />,
      사용: <TrendingDown className="w-5 h-5" />,
      환불: <TrendingUp className="w-5 h-5" />,
    };
    return icons[type];
  };

  const getTypeColor = (type: TicketType) => {
    const colors = {
      지급: 'bg-green-100 text-green-600',
      사용: 'bg-red-100 text-red-600',
      환불: 'bg-blue-100 text-blue-600',
    };
    return colors[type];
  };

  // 월 목록 생성
  const availableMonths = Array.from(
    new Set(transactions.map((t) => t.date.substring(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

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
            <h1 className="text-xl font-bold text-gray-900">티켓 내역</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 현재 잔액 카드 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white mb-8">
          <p className="text-purple-100 mb-2">현재 티켓 잔액</p>
          <p className="text-5xl font-bold mb-6">{stats.currentBalance}</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-purple-100 mb-1">총 획득</p>
              <p className="text-xl font-bold">+{stats.totalEarned}</p>
            </div>
            <div>
              <p className="text-sm text-purple-100 mb-1">총 사용</p>
              <p className="text-xl font-bold">-{stats.totalSpent}</p>
            </div>
            <div>
              <p className="text-sm text-purple-100 mb-1">환불</p>
              <p className="text-xl font-bold">+{stats.totalRefund}</p>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 유형 필터 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="all">모든 유형</option>
                <option value="지급">지급</option>
                <option value="사용">사용</option>
                <option value="환불">환불</option>
              </select>
            </div>

            {/* 기간 필터 */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="all">전체 기간</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 거래 내역 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(
                          transaction.type
                        )}`}
                      >
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{transaction.reason}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{transaction.date}</span>
                          <span className="text-gray-400">•</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {transaction.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold mb-1 ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount}T
                      </p>
                      <p className="text-sm text-gray-600">잔액: {transaction.balance}T</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">거래 내역이 없습니다.</p>
              <p className="text-sm">필터를 변경해보세요.</p>
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 bg-purple-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">티켓 획득 방법</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>매일 출석 체크하고 티켓 받기</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>광고 시청으로 추가 티켓 획득</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>친구 초대 시 보너스 티켓 지급</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>이벤트 미션 완료로 대량 티켓 획득</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
