import { Link } from "react-router-dom";
import { ArrowRight, Gift, PlusCircle, Sparkles, Ticket } from "lucide-react";
import { TopAppBar } from "@/components/TopAppBar";
import { DrawCard } from "@/components/draw/DrawCard";
import { useAuth } from "@/contexts/AuthContext";
import { useOngoingDraws } from "@/hooks/useOngoingDraws";

export function MainPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useOngoingDraws();
  const draws = data?.content ?? [];

  return <div className="min-h-screen bg-[#0e0f1c] text-white">
    <TopAppBar />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-[#2e334b] bg-[#181a2a] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#00d68a]/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00d68a]/30 bg-[#00d68a]/10 px-3 py-1.5 text-sm font-bold text-[#00d68a]"><Sparkles className="h-4 w-4" /> 매일 새로운 행운이 도착해요</div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">티켓으로 응모하고,<br /><span className="text-[#00d68a]">행운을 받아보세요.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#aeb4c7] sm:text-lg">원하는 상품에 간편하게 응모하고, 실시간으로 진행 상황과 당첨 결과를 확인하세요.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/draws" className="inline-flex items-center gap-2 rounded-xl bg-[#00d68a] px-5 py-3 font-black text-[#07140f] transition hover:bg-[#24e8a2]">드로우 둘러보기 <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/my/tickets" className="inline-flex items-center gap-2 rounded-xl border border-[#3a4059] bg-[#222538] px-5 py-3 font-bold text-white transition hover:border-[#00d68a]/60"><Ticket className="h-4 w-4 text-[#00d68a]" /> 내 티켓 확인</Link>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between">
          <div><p className="mb-1 text-sm font-bold text-[#00d68a]">LIVE DRAWS</p><h2 className="text-2xl font-black tracking-tight sm:text-3xl">지금 참여할 수 있는 드로우</h2></div>
          <Link to="/draws" className="inline-flex items-center gap-1 text-sm font-bold text-[#aeb4c7] transition hover:text-[#00d68a]">전체 보기 <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {isLoading && <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((key) => <div key={key} className="h-80 animate-pulse rounded-2xl bg-[#191b2b]" />)}</div>}
        {isError && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">드로우를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>}
        {!isLoading && !isError && (draws.length ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{draws.map((draw) => <DrawCard key={draw.drawId} draw={draw} />)}</div> : <div className="rounded-2xl border border-[#30344b] bg-[#191b2b] p-12 text-center"><Gift className="mx-auto h-10 w-10 text-[#00d68a]" /><p className="mt-3 font-bold text-white">진행 중인 드로우가 아직 없어요.</p></div>)}
      </section>
    </main>
    <footer className="mt-16 border-t border-[#30344b] bg-[#111321]"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-8 text-sm text-[#8991aa] sm:px-6 lg:px-8"><span className="font-black text-white">LUCKY<span className="text-[#00d68a]">DROP</span></span><span>© 2026 LuckyDrop</span></div></footer>
    {user?.role === "HOST" && <Link to="/draws/create" className="fixed bottom-7 right-7 z-40 inline-flex items-center gap-2 rounded-xl bg-[#00d68a] px-5 py-3 font-black text-[#07140f] shadow-[0_12px_36px_rgba(0,214,138,.3)] transition hover:bg-[#24e8a2]"><PlusCircle className="h-5 w-5" /> 드로우 개설</Link>}
  </div>;
}
