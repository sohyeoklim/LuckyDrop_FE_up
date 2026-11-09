import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { InfiniteScrollTrigger } from './common/InfiniteScrollTrigger';
import toast from 'react-hot-toast';
import type { MyDeliveryResponse } from '@/types/draw';

// ✅ 백엔드 DrawStatus와 매핑
type EntryStatus = 'ACTIVE' | 'DRAWING' | 'CLOSE' | 'CANCEL';

interface Entry {
  id: number;
  drawId: number;
  drawTitle: string;
  drawImage: string;
  entryDate: string;
  ticketUsed: number;
  entryCount: number;
  status: EntryStatus;
  resultDate?: string;
  isWinner: number;
  shippable: boolean;
}

interface EntryStats {
  total: number;
  inProgress: number;
  won: number;
  totalTicketsUsed: number;
}

export function MyEntriesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<EntryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | EntryStatus>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deliveryByDrawId, setDeliveryByDrawId] = useState<Record<number, MyDeliveryResponse | null>>({});
  const [deliveryForms, setDeliveryForms] = useState<Record<number, { phone: string; address: string }>>({});
  const [deliverySubmittingDrawId, setDeliverySubmittingDrawId] = useState<number | null>(null);
  const SIZE = 10;
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ 백엔드 DrawStatus 그대로 사용 (매핑 불필요)
  const mapBackendStatus = (backendStatus: string): EntryStatus => {
    // 백엔드 enum 값 그대로 반환 (대소문자 주의)
    switch (backendStatus.toUpperCase()) {
      case 'DRAFT':
      case 'ACTIVE': 
      case 'DRAWING': 
      case 'CLOSE': 
      case 'CANCEL': 
        return backendStatus.toUpperCase() as EntryStatus;
      default: 
        return 'CLOSE'; // 기본값
    }
  };

  // ✅ DrawStatus에 맞춘 상태 배지
  const getStatusBadge = (status: EntryStatus, isWinner: boolean) => {
    if (status === 'CLOSE') {
      const result = isWinner
        ? { text: '당첨 🎉', color: 'bg-red-100 text-red-800 font-bold' }
        : { text: '미당첨', color: 'bg-gray-200 text-gray-600' };
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${result.color}`}>
          {result.text}
        </span>
      );
    }

    const badges: Record<EntryStatus, { text: string; color: string }> = {
      ACTIVE: { text: '진행중', color: 'bg-green-100 text-green-800' },
      DRAWING: { text: '추첨중', color: 'bg-yellow-100 text-yellow-800' },
      CLOSE: { text: '마감', color: 'bg-blue-100 text-blue-800' },
      CANCEL: { text: '취소', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status] || badges.CLOSE;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const isEntryWinner = (entry: Entry): boolean => {
    return entry.isWinner === 1;
  };

  const getTicketUsedDisplay = (ticketUsed: number): number => {
    return Math.abs(ticketUsed || 0);
  };

  // ✅ 백엔드 데이터 → 프론트엔드 데이터 변환 (DrawStatus 그대로)
  const transformEntryData = (backendData: any): Entry[] => {
    return backendData.content?.map((item: any) => ({
      id: item.id || item.drawId,
      drawId: item.drawId,
      drawTitle: item.drawTitle,
      drawImage: item.drawImage && item.drawImage !== '' && item.drawImage !== '/images/default-draw.jpg'
        ? `http://localhost:8080${item.drawImage}`
        : '/placeholder.jpg',
      entryDate: item.entryDate,
      ticketUsed: Math.abs(item.ticketUsed || 0),
      entryCount: Math.max(item.entryCount || 0, 1),
      status: mapBackendStatus(item.status), // 백엔드 DrawStatus 그대로
      resultDate: item.resultDate,
      isWinner: item.isWinner === 1 ? 1 : 0,
      shippable: item.shippable === true || item.shippable === 1,
    })) || [];
  };

  const loadDeliveryInfo = useCallback(async (items: Entry[]) => {
    const shippingWinners = items.filter((item) => item.isWinner === 1 && item.shippable);
    if (shippingWinners.length === 0) return;

    const results = await Promise.all(shippingWinners.map(async (item) => {
      try {
        const response = await apiClient.get<MyDeliveryResponse>(`/api/draws/${item.drawId}/my-delivery`);
        return [item.drawId, response.status === 204 || !response.data ? null : response.data] as const;
      } catch {
        return [item.drawId, null] as const;
      }
    }));

    setDeliveryByDrawId((current) => ({ ...current, ...Object.fromEntries(results) }));
    setDeliveryForms((current) => {
      const next = { ...current };
      results.forEach(([drawId, delivery]) => {
        if (delivery && !next[drawId]) next[drawId] = { phone: delivery.phone ?? '', address: delivery.address ?? '' };
      });
      return next;
    });
  }, []);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingStats(true);
    try {
      console.log('📊 통계 API 호출 중...');
      const { data } = await apiClient.get('/api/draws/my-entries/stats');
      setStats(data);
      console.log('✅ 통계 로드 완료:', data);
    } catch (error: any) {
      console.error('❌ 통계 API 실패:', error);
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, [user?.id]);

  const refreshEntries = useCallback(async (reset = true, pageToLoad = 0) => {
    if (!user?.id) return;
    abortControllerRef.current?.abort();
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    if (reset) {
      setLoading(true);
      setEntries([]);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params: any = {
        page: pageToLoad,
        size: SIZE,
        ...(filterStatus !== 'all' && { status: filterStatus }), // ✅ 백엔드 DrawStatus 그대로 전달
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
      };
      
      console.log('🔍 Entries API params:', params);
      
      const { data } = await apiClient.get('/api/draws/my-entries', { 
        params,
        signal: abortController.signal 
      });
      
      const newEntries = transformEntryData(data);
      console.log('✅ Entries 로드:', newEntries.length, '개');
      
      if (reset) {
        setEntries(newEntries);
        setDeliveryByDrawId({});
      } else {
        setEntries(prev => [...prev, ...newEntries]);
      }
      void loadDeliveryInfo(newEntries);
      setCurrentPage(pageToLoad + 1);
      setHasMore(!data.last);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('❌ 응모 내역 불러오기 실패:', error);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  }, [user?.id, filterStatus, searchQuery, loadDeliveryInfo]);

  useEffect(() => {
    if (!user?.id) return;
    void loadStats();
    const timeoutId = setTimeout(() => {
      void refreshEntries(true, 0);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [user?.id, searchQuery, filterStatus, loadStats, refreshEntries]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    await refreshEntries(false, currentPage);
  };

  // ✅ DrawStatus에 맞춘 통계 계산
  const currentStats = stats || {
    total: entries.length,
    inProgress: entries.filter(e => ['ACTIVE', 'DRAWING'].includes(e.status)).length,
    won: entries.filter(e => isEntryWinner(e)).length,
    totalTicketsUsed: entries.reduce((sum, e) => sum + getTicketUsedDisplay(e.ticketUsed), 0),
  };

  const submitDeliveryAddress = async (event: React.FormEvent<HTMLFormElement>, entry: Entry) => {
    event.preventDefault();
    const delivery = deliveryByDrawId[entry.drawId];
    const form = deliveryForms[entry.drawId];
    if (!delivery || !form || delivery.fulfillmentStatus !== 'ADDRESS_REQUIRED') return;

    setDeliverySubmittingDrawId(entry.drawId);
    try {
      await apiClient.post(`/api/draws/${entry.drawId}/winners/${delivery.winnerId}/delivery-address`, form);
      setDeliveryByDrawId((current) => ({
        ...current,
        [entry.drawId]: { ...delivery, phone: form.phone, address: form.address, fulfillmentStatus: 'ADDRESS_SUBMITTED' },
      }));
      toast.success('배송 정보를 제출했습니다.');
    } catch (error) {
      console.error('배송 정보 제출 실패:', error);
      toast.error('배송 정보를 제출하지 못했습니다.');
    } finally {
      setDeliverySubmittingDrawId(null);
    }
  };

  const deliveryStatusText = (status: MyDeliveryResponse['fulfillmentStatus']) => {
    switch (status) {
      case 'ADDRESS_REQUIRED': return '배송 정보를 입력해주세요.';
      case 'ADDRESS_SUBMITTED': return '배송 정보가 제출되었습니다. 개설자가 발송을 준비 중입니다.';
      case 'PROCESSING': return '상품을 준비하고 있습니다.';
      case 'COMPLETED': return '배송 처리가 완료되었습니다.';
      case 'EXPIRED': return '배송 정보 입력 기한이 만료되었습니다.';
      default: return '배송 처리 상태를 확인 중입니다.';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
            로그인 하러가기 →
          </Link>
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
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 -m-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">응모 내역</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">총 응모</p>
            <p className="text-2xl font-bold text-gray-900">{currentStats.total}회</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">진행중</p>
            <p className="text-2xl font-bold text-green-600">{currentStats.inProgress}건</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">당첨</p>
            <p className="text-2xl font-bold text-red-600">{currentStats.won}회</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">사용 티켓</p>
            <p className="text-2xl font-bold text-purple-600">{currentStats.totalTicketsUsed}T</p>
          </div>
        </div>

        {/* 검색 및 필터 - ✅ DrawStatus로 변경 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="드로우 제목 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
              >
                <option value="all">모든 응모내역</option>
                <option value="ACTIVE">진행중</option>
                <option value="DRAWING">추첨중</option>
                <option value="CLOSE">마감</option>
                <option value="CANCEL">강제취소</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 응모 내역 리스트 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p>응모 내역을 불러오는 중...</p>
            </div>
          ) : entries.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <div
                  key={entry.id || entry.drawId}
                  className="p-6"
                >
                  <Link to={`/draws/${entry.drawId}`} className="block rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                    <img
                      src={entry.drawImage}
                      alt={entry.drawTitle}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">
                          {entry.drawTitle}
                        </h3>
                        {getStatusBadge(entry.status, isEntryWinner(entry))}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>응모일: {entry.entryDate}</p>
                        <p>
                          응모 횟수: <span className="font-medium">{entry.entryCount}회</span> (티켓{' '}
                          <span className="font-bold text-purple-600">
                            {getTicketUsedDisplay(entry.ticketUsed)}개
                          </span> 사용)
                        </p>
                        {entry.resultDate && (
                          <p>결과 발표: <span className="font-medium">{entry.resultDate}</span></p>
                        )}
                      </div>
                      
                      {isEntryWinner(entry) && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-sm font-medium text-red-600">
                            🎉 축하합니다! 당첨되셨습니다!
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{entry.shippable ? '아래에서 배송 정보를 확인하고 제출해주세요.' : '개설자가 보상을 전달하면 이 드로우에서 확인할 수 있습니다.'}</p>
                        </div>
                      )}
                      {entry.status === 'DRAWING' && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                          <p className="text-sm font-medium text-yellow-600">
                            ⏳ 추첨이 진행 중입니다. 곧 결과가 발표됩니다!
                          </p>
                        </div>
                      )}
                    </div>
                    </div>
                  </Link>
                  {isEntryWinner(entry) && entry.shippable && deliveryByDrawId[entry.drawId] && (() => {
                    const delivery = deliveryByDrawId[entry.drawId]!;
                    const form = deliveryForms[entry.drawId] ?? { phone: '', address: '' };
                    const editable = delivery.fulfillmentStatus === 'ADDRESS_REQUIRED';
                    return (
                      <section className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-purple-900">배송 정보</h4>
                            <p className="mt-1 text-xs text-purple-800">{deliveryStatusText(delivery.fulfillmentStatus)}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-medium text-purple-700">{editable ? '입력 필요' : delivery.fulfillmentStatus === 'EXPIRED' ? '기한 만료' : '제출 완료'}</span>
                        </div>
                        {delivery.addressDeadlineAt && <p className="mb-3 text-xs text-gray-600">입력 기한: {new Date(delivery.addressDeadlineAt).toLocaleString('ko-KR')}</p>}
                        <form className="space-y-3" onSubmit={(event) => void submitDeliveryAddress(event, entry)}>
                          <input required disabled={!editable || deliverySubmittingDrawId === entry.drawId} value={form.phone} onChange={(event) => setDeliveryForms((current) => ({ ...current, [entry.drawId]: { ...form, phone: event.target.value } }))} placeholder="연락처" className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm disabled:bg-gray-100" />
                          <textarea required disabled={!editable || deliverySubmittingDrawId === entry.drawId} value={form.address} onChange={(event) => setDeliveryForms((current) => ({ ...current, [entry.drawId]: { ...form, address: event.target.value } }))} placeholder="배송지 주소" className="min-h-24 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm disabled:bg-gray-100" />
                          <button type="submit" disabled={!editable || deliverySubmittingDrawId === entry.drawId} className="w-full rounded-lg bg-purple-600 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:bg-gray-400">{deliverySubmittingDrawId === entry.drawId ? '제출 중...' : editable ? '배송 정보 제출' : delivery.fulfillmentStatus === 'EXPIRED' ? '입력 기한 만료' : '배송 정보 제출 완료'}</button>
                        </form>
                      </section>
                    );
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">응모 내역이 없습니다.</p>
              <p className="text-sm">검색어나 필터를 변경해보세요.</p>
            </div>
          )}
        </div>

        {entries.length > 0 && <InfiniteScrollTrigger hasMore={hasMore} isLoading={loadingMore} onLoadMore={() => void loadMore()} />}
      </main>
    </div>
  );
}
