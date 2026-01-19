import { useState } from 'react';
import Slider from 'react-slick';
import { Heart, Clock, Ticket } from 'lucide-react';

interface HeroSectionProps {
  draw: {
    id: number;
    title: string;
    description: string;
    images: string[];
    ticketCost: number;
    timeLeft: string;
    liked: boolean;
  };
  userTickets: number;
}

export function HeroSection({ draw, userTickets }: HeroSectionProps) {
  const [liked, setLiked] = useState(draw.liked);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 이미지 캐러셀 */}
        <div className="relative">
          <Slider {...sliderSettings}>
            {draw.images.map((image, index) => (
              <div key={index} className="relative">
                <div className="aspect-square lg:aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100">
                  <img
                    src={image}
                    alt={`${draw.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </Slider>

          {/* 찜 버튼 */}
          <button
            onClick={() => setLiked(!liked)}
            className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-6 h-6 ${
                liked ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* 정보 */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4 w-fit">
            🔥 HOT EVENT
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{draw.title}</h2>
          <p className="text-lg text-gray-600 mb-6">{draw.description}</p>

          {/* 통계 정보 */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">남은 시간</p>
                <p className="font-bold text-purple-600">{draw.timeLeft}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">필요 티켓</p>
                <p className="font-bold text-purple-600">{draw.ticketCost}장</p>
              </div>
            </div>
          </div>

          {/* 응모 버튼 */}
          <div className="flex items-center gap-4">
            <button
              disabled={userTickets < draw.ticketCost}
              className={`flex-1 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all hover:scale-105 ${
                userTickets < draw.ticketCost
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl'
              }`}
            >
              지금 응모하기
            </button>
            <div className="text-sm text-gray-600">
              보유 티켓: <span className="font-bold text-purple-600">{userTickets}장</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}