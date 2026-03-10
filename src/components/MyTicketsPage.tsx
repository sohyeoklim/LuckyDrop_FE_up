import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Filter, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTicketWallet, getTicketLedger } from '../api/client';
import { format } from 'date-fns';

type TicketType = '지급' | '사용' | '환불' | '충전';

interface LedgerEntry {
  id: string;
  type: TicketType;
  amount: number;
  reason: string;
  createdAt: string; // API는 ISO 8601 형식의 문자열을 반환
}

interface TicketTransaction extends LedgerEntry {
  balanceAfter: number;
}

interface Wallet {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export function MyTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<TicketTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<'all' | TicketType>('all');
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [walletData, ledgerData]: [Wallet, LedgerEntry[]] = await Promise.all([
          getTicketWallet(user.id),
          getTicketLedger(user.id),
        ]);
        setWallet(walletData);

        // 프론트엔드에서 balanceAfter 계산
        let runningBalance = walletData.balance;
        const transactionsWithBalance = ledgerData.map((tx) => {
          const txWithBalance = { ...tx, balanceAfter: runningBalance };
          runningBalance -= tx.amount;
          return txWithBalance;
        });
        setTransactions(transactionsWithBalance);

      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // 필터링
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const transactionMonth = format(new Date(transaction.createdAt), 'yyyy-MM');
    const matchesMonth = filterMonth === 'all' || transactionMonth === filterMonth;
    return matchesType && matchesMonth;
  });

  const getTypeIcon = (type: TicketType) => {
    const icons = {
      지급: <TrendingUp className="w-5 h-5" />,
      사용: <TrendingDown className="w-5 h-5" />,
      환불: <TrendingUp className="w-5 h-5" />,
      충전: <TrendingUp className="w-5 h-5" />,
    };
    return icons[type];
  };

  const getTypeColor = (type: TicketType) => {
    const colors = {
      지급: 'bg-green-100 text-green-600',
      사용: 'bg-red-100 text-red-600',
      환불: 'bg-blue-100 text-blue-600',
      충전: 'bg-yellow-100 text-yellow-600',
    };
    return colors[type];
  };

  // 월 목록 생성
  const availableMonths = Array.from(
    new Set(transactions.map((t) => format(new Date(t.createdAt), 'yyyy-MM')))
  ).sort((a, b) => b.localeCompare(a));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-4">
        <div>
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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
          <p className="text-5xl font-bold mb-6">{wallet?.balance ?? 0}</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-purple-100 mb-1">총 획득</p>
              <p className="text-xl font-bold">+{wallet?.totalEarned ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-purple-100 mb-1">총 사용</p>
              <p className="text-xl font-bold">-{wallet?.totalSpent ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-purple-100 mb-1">환불</p>
              <p className="text-xl font-bold">
                +{transactions.filter(t => t.type === '환불').reduce((sum, t) => sum + t.amount, 0)}
              </p>
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
                <option value="충전">충전</option>
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
                          <span>{format(new Date(transaction.createdAt), 'yyyy-MM-dd')}</span>
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
                      <p className="text-sm text-gray-600">잔액: {transaction.balanceAfter}T</p>
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
