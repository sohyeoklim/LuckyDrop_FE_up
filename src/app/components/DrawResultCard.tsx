import { Trophy, X, Calendar } from 'lucide-react';

interface DrawResultCardProps {
  result: {
    id: number;
    title: string;
    status: '당첨' | '미당첨';
    message: string;
    date: string;
    image: string;
  };
}

export function DrawResultCard({ result }: DrawResultCardProps) {
  const isWinner = result.status === '당첨';

  return (
    <div
      className={`bg-white rounded-2xl shadow-md overflow-hidden border-2 ${
        isWinner ? 'border-yellow-400' : 'border-gray-200'
      }`}
    >
      <div className="flex gap-3 p-3">
        {/* 이미지 */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden">
            <img
              src={result.image}
              alt={result.title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* 상태 아이콘 */}
          <div
            className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center ${
              isWinner ? 'bg-yellow-400' : 'bg-gray-400'
            }`}
          >
            {isWinner ? (
              <Trophy className="w-4 h-4 text-white" />
            ) : (
              <X className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* 정보 */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">{result.title}</h3>
            <p
              className={`text-sm font-semibold mb-2 ${
                isWinner ? 'text-yellow-600' : 'text-gray-600'
              }`}
            >
              {result.message}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{result.date}</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isWinner
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {result.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
