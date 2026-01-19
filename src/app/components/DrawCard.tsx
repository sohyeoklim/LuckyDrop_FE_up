import { useState } from 'react';
import { Heart, Clock, Users, Ticket } from 'lucide-react';

interface DrawCardProps {
  draw: {
    id: number;
    title: string;
    image: string;
    timeLeft: string;
    winners: number;
    liked: boolean;
    ticketCost: number;
  };
}

export function DrawCard({ draw }: DrawCardProps) {
  const [liked, setLiked] = useState(draw.liked);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
      {/* 이미지 */}
      <div className="relative">
        <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
          <img
            src={draw.image}
            alt={draw.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        {/* 찜 버튼 */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${
              liked ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* 티켓 배지 */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
          <Ticket className="w-4 h-4" />
          <span>{draw.ticketCost}장</span>
        </div>
      </div>

      {/* 정보 */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-3 text-lg line-clamp-1">
          {draw.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{draw.timeLeft}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{draw.winners}명 당첨</span>
          </div>
        </div>

        <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow">
          응모하기
        </button>
      </div>
    </div>
  );
}