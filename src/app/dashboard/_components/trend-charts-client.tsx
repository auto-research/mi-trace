"use client";
import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { Product } from 'data/product-list';

interface CommentRecord {
  date: string;
  comments_total: number;
}

interface TrendChartsClientProps {
  productList: Product[];
  dataMap: Record<number, CommentRecord[]>;
  lastCrawlTime?: string | null;
}

const TrendChart = dynamic(() => import('@components/ui/trend-chart').then(mod => mod.TrendChart), {
  loading: () => <div className="h-64 flex items-center justify-center">加载中...</div>,
});

export default function TrendChartsClient({ productList, dataMap, lastCrawlTime }: TrendChartsClientProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('Xiaomi');
  const brands = Array.from(new Set(productList.map(p => p.brand)));
  const filteredList = productList.filter(p => p.brand === selectedBrand);

  // 按 subCategory 分组
  const subCategoryMap: Record<string, Product[]> = {};
  filteredList.forEach((p) => {
    if (!subCategoryMap[p.subCategory]) subCategoryMap[p.subCategory] = [];
    subCategoryMap[p.subCategory].push(p);
  });
  const subCategories = Object.keys(subCategoryMap);

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        {brands.map(brand => (
          <button
            key={brand}
            className={`px-5 py-2 rounded-lg border text-base font-medium transition-colors duration-150 cursor-pointer
              ${selectedBrand === brand
                ? 'bg-[#ff6900] text-white border-[#ff6900] shadow-sm'
                : 'bg-white text-[#ff6900] border-[#ff6900] hover:bg-[#fff3e6]'}
            `}
            style={{ minWidth: 80 }}
            onClick={() => setSelectedBrand(brand)}
          >
            {brand === 'Xiaomi' ? 'Xiaomi' : brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8">
        {subCategories.map((sub) => (
          <div key={sub} className="bg-white rounded-lg shadow p-4 relative">
            <h2 className="text-xl font-semibold mb-2">{sub}</h2>
            <Suspense fallback={<div className="h-64 flex items-center justify-center">加载中...</div>}>
              <TrendChart
                products={subCategoryMap[sub].map(p => p)}
                dataMap={dataMap}
              />
            </Suspense>
          </div>
        ))}
      </div>
      {lastCrawlTime && (
        <div className="text-xs text-gray-400 mt-2 text-right">
          评论数据更新时间：{new Date(lastCrawlTime).toLocaleString('zh-CN', { hour12: false })}
        </div>
      )}
    </>
  );
} 