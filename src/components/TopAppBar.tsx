import { Bell, Heart, LogOut, Menu, Plus, Ticket, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/api/client";
import { NotificationBell } from "@/components/NotificationBell";

export function TopAppBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState(0);

  useEffect(() => {
    if (!user) return;
    apiClient.get('/api/ticket/wallet/me')
      .then((response) => setTickets(response.data.balance ?? 0))
      .catch(() => setTickets(0));
  }, [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#30344b] bg-[#111321]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="LuckyDrop 홈">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#00d68a] font-black text-[#0e0f1c] shadow-[0_0_24px_rgba(0,214,138,.3)]">L</span>
            <span className="text-xl font-black tracking-tight text-white">LUCKY<span className="text-[#00d68a]">DROP</span></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/" className="rounded-lg bg-[#202337] px-4 py-2 text-sm font-bold text-white">홈</Link>
            <Link to="/draws" className="rounded-lg px-4 py-2 text-sm font-bold text-[#aeb4c7] transition hover:bg-[#202337] hover:text-white">드로우 둘러보기</Link>
            {user?.role === "HOST" && <Link to="/draws/create" className="rounded-lg px-4 py-2 text-sm font-bold text-[#aeb4c7] transition hover:bg-[#202337] hover:text-white">개설하기</Link>}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? <>
            <Link to="/my/tickets" className="hidden items-center gap-2 rounded-lg bg-[#202337] px-3 py-2 text-sm font-black text-[#00d68a] sm:flex">
              <Ticket className="h-4 w-4" /> {tickets.toLocaleString()} T
            </Link>
            <NotificationBell />
            <Link to="/my/liked" className="hidden rounded-lg p-2 text-[#aeb4c7] transition hover:bg-[#202337] hover:text-white md:block"><Heart className="h-5 w-5" /></Link>
            <Link to="/my" className="flex items-center gap-2 rounded-lg p-2 text-[#aeb4c7] transition hover:bg-[#202337] hover:text-white"><User className="h-5 w-5" /><span className="hidden text-sm font-bold lg:block">{user.nickname}</span></Link>
            <button onClick={async () => { await logout(); navigate("/login"); }} className="hidden rounded-lg p-2 text-[#8991aa] transition hover:bg-[#202337] hover:text-white md:block" aria-label="로그아웃"><LogOut className="h-5 w-5" /></button>
          </> : <>
            <Link to="/login" className="px-3 py-2 text-sm font-bold text-[#c7ccda] hover:text-white">로그인</Link>
            <Link to="/signup" className="rounded-lg bg-[#00d68a] px-4 py-2 text-sm font-black text-[#07140f] shadow-[0_0_20px_rgba(0,214,138,.22)] transition hover:bg-[#21e7a0]">가입하기</Link>
          </>}
          <button className="rounded-lg p-2 text-[#aeb4c7] md:hidden" aria-label="메뉴"><Menu className="h-5 w-5" /></button>
        </div>
      </div>
    </header>
  );
}
