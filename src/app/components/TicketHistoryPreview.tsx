import { ArrowDownCircle, ArrowUpCircle, Calendar } from 'lucide-react';

interface TicketHistoryItem {
  id: number;
  type: '지급' | '사용';
  amount: number;
  reason: string;
  date: string;
}

interface TicketHistoryPreviewProps {
  history: TicketHistoryItem[];
}

export function TicketHistoryPreview({ history }: TicketHistoryPreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="divide-y divide-gray-100">
        {history.map((item) => (
          <div key={item.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              {/* 아이콘 */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.type === '지급'
                    ? 'bg-green-100'
                    : 'bg-orange-100'
                }`}
              >
                {item.type === '지급' ? (
                  <ArrowDownCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowUpCircle className="w-5 h-5 text-orange-600" />
                )}
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {item.reason}
                  </h4>
                  <span
                    className={`font-bold text-sm ${
                      item.type === '지급'
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {item.amount > 0 ? '+' : ''}
                    {item.amount}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
