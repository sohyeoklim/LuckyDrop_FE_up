import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, Ticket, Settings, AlertCircle,
  UserPlus, Ban, MessageSquare, Search, History, Coins
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TopAppBar } from './TopAppBar';
import { adjustTicket } from '../api/ticket';
import { toast } from 'react-hot-toast';
import type { AdminDrawSummaryResponse } from "@/types/admin";
import {
  getAdminForceCancelDraws,
  forceCancelDraw,
  getAdminUsers,
  changeUserRole,
  type AdminUserResDto,
} from "@/api/admin";


// ────────────────────────────────────────────────────────────────────────────
// 1. 사용자 관리
// ────────────────────────────────────────────────────────────────────────────

const UserManagement = () => {
  const { user: adminUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserResDto | null>(null);
  const [allUsers, setAllUsers] = useState<AdminUserResDto[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (query?: string) => {
    setIsLoadingUsers(true);
    try {
      const data = await getAdminUsers(query);
      setAllUsers(data);
      if (query) {
        if (data.length > 0) setSelectedUser(data[0]);
        else {
          toast.error('사용자를 찾을 수 없습니다.');
          setSelectedUser(null);
        }
      }
    } catch {
      toast.error('사용자 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      setSelectedUser(null);
      return;
    }
    fetchUsers(searchQuery.trim());
  };

  const handlePromoteToHost = async () => {
    if (!selectedUser) return;
    try {
      await changeUserRole(selectedUser.id, 'HOST');
      const updated = { ...selectedUser, role: 'HOST' };
      setAllUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
      setSelectedUser(updated);
      toast.success(`${selectedUser.nickname}님이 호스트로 승격되었습니다.`);
    } catch {
      toast.error('역할 변경에 실패했습니다.');
    }
  };

  const handleDemoteToUser = async () => {
  if (!selectedUser) return;
  try {
    await changeUserRole(selectedUser.id, 'USER');
    const updated = { ...selectedUser, role: 'USER' };
    setAllUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    setSelectedUser(updated);
    toast.success(`${selectedUser.nickname}님이 일반 유저로 강등되었습니다.`);
  } catch {
    toast.error('역할 변경에 실패했습니다.');
  }
};

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === 0) { toast.error('조정할 티켓 수량을 입력해주세요.'); return; }
    if (!reason.trim()) { toast.error('조정 사유를 입력해주세요.'); return; }

    setIsSubmitting(true);
    try {
      await adjustTicket({
        userId: selectedUser!.id,
        amount,
        reason,
        adminId: adminUser?.id || 'admin',
        idempotencyKey: crypto.randomUUID(),
      });
      toast.success('티켓이 성공적으로 조정되었습니다.');
      const updated = {
        ...selectedUser!,
        currentTickets: selectedUser!.currentTickets + amount,
      };
      setAllUsers(prev => prev.map(u => u.id === selectedUser!.id ? updated : u));
      setSelectedUser(updated);
      setAmount(0);
      setReason('');
      setTicketDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('티켓 조정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSearch = () => {
    setSelectedUser(null);
    setSearchQuery('');
    fetchUsers();
  };

  return (
    <div className="space-y-6">

      {/* 검색 바 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            사용자 검색
          </CardTitle>
          <CardDescription>닉네임 또는 이메일로 사용자를 검색하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="닉네임 또는 이메일 입력"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>검색</Button>
          </div>
        </CardContent>
      </Card>

      {/* 검색 결과: 사용자 상세 + 액션 */}
      {selectedUser && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900">사용자 상세 정보</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetSearch} className="text-blue-600">
                다른 사용자 검색
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 정보 패널 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-blue-900">{selectedUser.nickname}</span>
                  <Badge variant={selectedUser.role === 'HOST' ? 'default' : 'secondary'}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📧 {selectedUser.email}</p>
                  <p>🎟 보유 티켓: <span className="font-bold text-blue-700">{selectedUser.currentTickets}개</span></p>
                  <p>📅 가입일: {selectedUser.joinedAt}</p>
                </div>
              </div>

              {/* 액션 패널 */}
<div className="flex flex-col gap-3 justify-center">
  {selectedUser.role === 'USER' && (
    <Button
      variant="outline"
      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
      onClick={handlePromoteToHost}
    >
      <UserPlus className="w-4 h-4 mr-2" />
      호스트 승격
    </Button>
  )}
  {selectedUser.role === 'HOST' && (
    <Button
      variant="outline"
      className="w-full border-red-300 text-red-600 hover:bg-red-50"
      onClick={handleDemoteToUser}  // 추가
    >
      <Ban className="w-4 h-4 mr-2" />
      호스트 강등
    </Button>
  )}
  <Button
    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
    onClick={() => setTicketDialogOpen(true)}
  >
    <Coins className="w-4 h-4 mr-2" />
    티켓 조정
  </Button>
</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 전체 사용자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>전체 사용자 목록</CardTitle>
          <CardDescription>검색 전 전체 사용자를 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="py-10 text-center text-gray-500">로딩 중...</div>
          ) : allUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-500">사용자가 없습니다.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>닉네임</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>보유 티켓</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead className="text-right">바로 선택</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nickname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'HOST' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.currentTickets}개</TableCell>
                    <TableCell>{user.joinedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery(user.nickname);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        선택
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 최근 티켓 조정 로그 — 추후 API 연동 가능 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            최근 티켓 조정 로그
          </CardTitle>
          <CardDescription>플랫폼 전체 티켓 조정 이력입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>일시</TableHead>
                <TableHead>대상 사용자</TableHead>
                <TableHead>수량</TableHead>
                <TableHead>사유</TableHead>
                <TableHead>처리 관리자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-sm text-gray-500">2024.03.22 14:30</TableCell>
                <TableCell className="font-medium">김철수 (chulsoo@...)</TableCell>
                <TableCell><span className="text-green-600 font-semibold">+10</span></TableCell>
                <TableCell>서버지연 보상</TableCell>
                <TableCell>admin_1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm text-gray-500">2024.03.21 11:15</TableCell>
                <TableCell className="font-medium">박지성 (jisung@...)</TableCell>
                <TableCell><span className="text-red-600 font-semibold">-50</span></TableCell>
                <TableCell>부정 드로우 참여 패널티</TableCell>
                <TableCell>admin_2</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 티켓 조정 Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>티켓 조정 — {selectedUser?.nickname}</DialogTitle>
            <DialogDescription>
              보상은 양수(+), 차감은 음수(-)로 입력하세요.
              현재 보유 티켓: <span className="font-bold">{selectedUser?.currentTickets}개</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">조정 수량</label>
              <Input
                type="number"
                placeholder="예: 10 또는 -5"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">조정 사유</label>
              <Textarea
                placeholder="예: 서버 지연 보상, 부정행위 패널티 등"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setTicketDialogOpen(false); setAmount(0); setReason(''); }}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '처리 중...' : '조정 적용'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};


// ────────────────────────────────────────────────────────────────────────────
// 2. 드로우 관리
// ────────────────────────────────────────────────────────────────────────────

export const DrawManagement = () => {
  const CANCEL_REASON_OPTIONS = [
    { value: "ADMIN_FORCE_CANCEL", label: "관리자 판단" },
    { value: "POLICY_VIOLATION",   label: "정책 위반"   },
    { value: "FRAUD_SUSPECTED",    label: "부정 행위 의심" },
  ];

  const [draws, setDraws] = useState<AdminDrawSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedDrawId, setSelectedDrawId] = useState<number | null>(null);
  const [reasonCode, setReasonCode] = useState("ADMIN_FORCE_CANCEL");
  const [reasonDetail, setReasonDetail] = useState("");

  const fetchDraws = async () => {
    try {
      setLoading(true);
      const data = await getAdminForceCancelDraws();
      setDraws(data);
    } catch (error) {
      console.error(error);
      toast.error("드로우 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDraws(); }, []);

  const handleCancelDraw = async () => {
    if (!selectedDrawId) return;
    if (!reasonDetail.trim()) { toast.error("상세 사유를 입력해주세요"); return; }

    try {
      setSubmittingId(selectedDrawId);
      await forceCancelDraw(selectedDrawId, { reasonCode, reasonDetail });
      toast.success("강제 취소 완료");
      setOpen(false);
      setSelectedDrawId(null);
      setReasonCode("ADMIN_FORCE_CANCEL");
      setReasonDetail("");
      await fetchDraws();
    } catch (error) {
      console.error(error);
      toast.error("강제 취소 실패");
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusLabel = (status: AdminDrawSummaryResponse["status"]) => {
    switch (status) {
      case "DRAFT":   return "대기";
      case "ACTIVE":  return "진행중";
      case "DRAWING": return "추첨중";
      case "CLOSE":   return "종료";
      case "CANCEL":  return "취소";
      default:        return status;
    }
  };

  const getStatusBadgeVariant = (
    status: AdminDrawSummaryResponse["status"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "ACTIVE":  return "default";
      case "DRAWING": return "secondary";
      case "CLOSE":   return "outline";
      case "CANCEL":  return "destructive";
      default:        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>드로우 운영 관리</CardTitle>
        <CardDescription>문제가 있는 드로우를 강제 취소할 수 있습니다.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 text-center text-gray-500">로딩중...</div>
        ) : draws.length === 0 ? (
          <div className="py-10 text-center text-gray-500">드로우 없음</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>호스트</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>참여자</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draws.map(draw => (
                <TableRow key={draw.drawId}>
                  <TableCell>{draw.title}</TableCell>
                  <TableCell>{draw.hostNickname}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(draw.status)}>
                      {getStatusLabel(draw.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{draw.participantCount}명</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={submittingId === draw.drawId}
                      onClick={() => { setSelectedDrawId(draw.drawId); setOpen(true); }}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      {submittingId === draw.drawId ? "처리중..." : "강제 취소"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>드로우 강제 취소</DialogTitle>
              <DialogDescription>
                취소 사유 코드와 상세 사유를 입력한 뒤 강제 취소를 진행하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">취소 사유 코드</label>
                <Select value={reasonCode} onValueChange={setReasonCode}>
                  <SelectTrigger><SelectValue placeholder="사유 선택" /></SelectTrigger>
                  <SelectContent>
                    {CANCEL_REASON_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">상세 사유</label>
                <Textarea
                  value={reasonDetail}
                  onChange={e => setReasonDetail(e.target.value)}
                  placeholder="상세 사유를 입력하세요."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setSelectedDrawId(null);
                  setReasonCode("ADMIN_FORCE_CANCEL");
                  setReasonDetail("");
                }}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelDraw}
                disabled={!selectedDrawId || submittingId === selectedDrawId}
              >
                {submittingId === selectedDrawId ? "처리중..." : "강제 취소"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};


// ────────────────────────────────────────────────────────────────────────────
// 3. 고객센터 관리
// ────────────────────────────────────────────────────────────────────────────

const CustomerCenterManagement = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          공지사항 관리
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-bold">[공지] 시스템 정기 점검 안내</h4>
          <p className="text-sm text-gray-500">2024.03.20 | 조회수 1,204</p>
        </div>
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <h4 className="font-bold">[이벤트] 봄맞이 티켓 2배 적립!</h4>
          <p className="text-sm text-gray-500">2024.03.15 | 조회수 4,561</p>
        </div>
        <Button className="w-full">새 공지사항 작성</Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          1:1 문의 내역
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-amber-900">드로우 당첨 확인이 안 돼요</h4>
            <Badge variant="outline" className="text-amber-600 border-amber-600">대기 중</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2">작성자: 김영수 | 10분 전</p>
        </div>
        <div className="p-4 border rounded-lg border-l-4 border-l-green-500">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold">티켓 결제 오류 문의</h4>
            <Badge variant="outline" className="text-green-600 border-green-600">답변 완료</Badge>
          </div>
          <p className="text-xs text-gray-500 mb-2">작성자: 이슬기 | 2시간 전</p>
        </div>
        <Button variant="outline" className="w-full">전체 문의 보기</Button>
      </CardContent>
    </Card>
  </div>
);


// ────────────────────────────────────────────────────────────────────────────
// 4. AdminPage (메인)
// ────────────────────────────────────────────────────────────────────────────

export function AdminPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (!user || user.role !== 'ADMIN') {
    toast.error('관리자만 접근할 수 있는 페이지입니다.');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopAppBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">관리자 대시보드</h2>
            <p className="text-gray-500">플랫폼의 모든 활동을 모니터링하고 제어합니다.</p>
          </div>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            시스템 설정
          </Button>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white border p-1 h-auto grid grid-cols-2 md:flex md:w-fit gap-1">
            <TabsTrigger value="users" className="py-2 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <Users className="w-4 h-4 mr-2" />
              사용자 관리
            </TabsTrigger>
            <TabsTrigger value="draws" className="py-2 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <Ticket className="w-4 h-4 mr-2" />
              드로우 관리
            </TabsTrigger>
            <TabsTrigger value="customer" className="py-2 px-4 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              고객센터 관리
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users"    className="mt-0"><UserManagement /></TabsContent>
          <TabsContent value="draws"    className="mt-0"><DrawManagement /></TabsContent>
          <TabsContent value="customer" className="mt-0"><CustomerCenterManagement /></TabsContent>
        </Tabs>

      </main>
    </div>
  );
}

export default AdminPage;