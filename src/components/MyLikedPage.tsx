import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Clock, Ticket } from 'lucide-react';
import { fetchMyLikedDraws, unlikeDraw, LikedDraw, DrawStatus } from '../api/bookmark';
import { InfiniteScrollTrigger } from './common/InfiniteScrollTrigger';

export function MyLikedPage() {
  const navigate = useNavigate();
  const [likedDraws, setLikedDraws] = useState<LikedDraw[]>([]);
  const [nextPage, setNextPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadStarted = useRef(false);

  const loadDraws = useCallback(async (reset = false) => {
    if (loadingMore || (!reset && !hasMore)) return;
    try {
      if (reset) {
        setLoading(true);
        setNextPage(0);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      const pageToLoad = reset ? 0 : nextPage;
      const res = await fetchMyLikedDraws(pageToLoad, 20);
      setLikedDraws((previous) => reset ? res.items : [...previous, ...res.items]);
      setNextPage(pageToLoad + 1);
      setHasMore(pageToLoad + 1 < res.totalPages);
    } catch (e) {
      setError('북마크 목록을 불러오지 못했습니다.');
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextPage]);

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    void loadDraws(true);
  }, []);

  const handleUnlike = async (drawId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!window.confirm('찜을 해제하시겠습니까?')) return;

    try {
      // 낙관적 업데이트
      setLikedDraws((prev) => prev.filter((draw) => draw.id !== drawId));
      
      // 실제 서버 호출
      await unlikeDraw(drawId);
    } catch (e) {
      // 실패 시 복구
      void loadDraws(true);
      alert('찜 해제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // ✅ 전체 DrawStatus 포함 (DRAFT도 가능)
  const getStatusBadge = (status: DrawStatus): ReactNode => {
    const badges: Record<DrawStatus, { text: string; color: string }> = {
      DRAFT: { text: '작성중', color: 'bg-gray-100 text-gray-800' },
      ACTIVE: { text: '응모 가능', color: 'bg-green-100 text-green-800' },
      DRAWING: { text: '추첨중', color: 'bg-yellow-100 text-yellow-800' },
      CLOSE: { text: '마감', color: 'bg-blue-100 text-blue-800' },
      CANCEL: { text: '취소', color: 'bg-red-100 text-red-800' },
    };
    
    const badge = badges[status] || { text: '알수없음', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // ✅ 응모 가능: ACTIVE만
  // 진행중/대기: DRAFT, DRAWING, CLOSE, CANCEL
  const activeDraws = likedDraws.filter((draw) => draw.status === 'ACTIVE');
  const otherDraws = likedDraws.filter((draw) => draw.status !== 'ACTIVE');

  if (loading && likedDraws.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">북마크 불러오는 중...</p>
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
            <h1 className="text-xl font-bold text-gray-900">찜한 드로우</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-8">
            <p className="text-red-800 mb-2">{error}</p>
            <button
              onClick={loadDraws}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              다시 불러오기
            </button>
          </div>
        ) : null}

        {likedDraws.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">찜한 드로우가 없습니다</h2>
            <p className="text-gray-600 mb-6">관심 있는 드로우를 찜해보세요!</p>
            <Link
              to="/draws"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              드로우 보러가기
            </Link>
          </div>
        ) : (
          <>
            {/* 통계 카드 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm text-gray-600 mb-1">총 찜한 드로우</p>
                <p className="text-2xl font-bold text-gray-900">{likedDraws.length}개</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm text-gray-600 mb-1">응모 가능</p>
                <p className="text-2xl font-bold text-green-600">{activeDraws.length}개</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm text-gray-600 mb-1">대기/종료</p>
                <p className="text-2xl font-bold text-gray-600">{otherDraws.length}개</p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">최근 찜한 순</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedDraws.map((draw) => (
                  <Link key={draw.id} to={`/draws/${draw.id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                    <div className="relative">
                      <img src={draw.image} alt={draw.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <button onClick={(e) => handleUnlike(draw.id, e)} className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors" title="찜 해제">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </button>
                      <div className="absolute bottom-3 left-3">{getStatusBadge(draw.status)}</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{draw.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{draw.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-600"><Clock className="w-4 h-4" /><span>{draw.timeLeft}</span></div>
                        <div className="flex items-center gap-1 text-purple-600 font-medium"><Ticket className="w-4 h-4" /><span>{draw.ticketCost}T</span></div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">찜한 날짜: {draw.likedDate}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <InfiniteScrollTrigger hasMore={hasMore} isLoading={loadingMore} onLoadMore={() => void loadDraws()} />
          </>
        )}
      </main>
    </div>
  );
}
