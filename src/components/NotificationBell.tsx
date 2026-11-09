import { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import type { AppNotification } from "@/api/notification";

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useNotifications(true);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAllRead } = useMarkAllNotificationsRead();

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) markRead(notification.id);
    setOpen(false);
    if (notification.drawId) navigate(`/draws/${notification.drawId}`);
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className="relative rounded-full p-2 transition-colors hover:bg-gray-100" aria-label="알림">
        <Bell className="h-5 w-5 text-gray-600" />
        {!!data?.unreadCount && <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-red-500 px-1 text-center text-xs font-bold leading-5 text-white">{data.unreadCount > 99 ? "99+" : data.unreadCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="font-semibold text-gray-900">알림</p>
            <button type="button" onClick={() => markAllRead()} disabled={!data?.unreadCount || isMarkingAllRead} className="text-xs font-medium text-purple-600 disabled:text-gray-400">모두 읽음</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? <p className="px-4 py-6 text-center text-sm text-gray-500">불러오는 중...</p> : data?.content.length ? data.content.map((notification) => (
              <button type="button" key={notification.id} onClick={() => handleNotificationClick(notification)} className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${notification.read ? "bg-white" : "bg-purple-50"}`}>
                <div className="flex items-start justify-between gap-3"><p className="font-medium text-gray-900">{notification.title}</p>{!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-600" />}</div>
                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                <p className="mt-1 text-xs text-gray-400">{formatCreatedAt(notification.createdAt)}</p>
              </button>
            )) : <p className="px-4 py-6 text-center text-sm text-gray-500">새 알림이 없습니다.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
