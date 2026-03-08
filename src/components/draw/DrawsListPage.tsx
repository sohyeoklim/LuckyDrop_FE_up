import { useState } from "react";
import { DrawCard } from "@/components/draw/DrawCard";
import { useDrawList } from "@/hooks/useDrawList";
import type { DrawSort } from "@/api/draw";

export function DrawsListPage() {
  const [sortOption, setSortOption] = useState<DrawSort>("LATEST");

  const { data, isLoading, isError } = useDrawList({
    tab: "ONGOING",
    page: 0,
    size: 12,
    sort: sortOption,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-10">로딩중...</div>;
  }

  if (isError) {
    return <div className="min-h-screen bg-gray-50 p-10">에러 발생</div>;
  }

  const draws = data?.content ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">진행 중인 드로우</h1>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as DrawSort)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
          >
            <option value="LATEST">최신순</option>
            <option value="BOOKMARK">인기순</option>
          </select>
        </div>

        {draws.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500 shadow-sm">
            현재 진행 중인 드로우가 없어
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draws.map((draw) => (
              <DrawCard key={draw.drawId} draw={draw} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}