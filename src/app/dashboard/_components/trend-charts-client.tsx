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
}

const TrendChart = dynamic(() => import('@components/ui/trend-chart').then(mod => mod.TrendChart), {
  loading: () => <div className="h-64 flex items-center justify-center">加载中...</div>,
});

export default function TrendChartsClient({ productList, dataMap }: TrendChartsClientProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('全部');
  const brands = Array.from(new Set(productList.map(p => p.brand)));
  const filteredList = selectedBrand === '全部' ? productList : productList.filter(p => p.brand === selectedBrand);

  // 按 subCategory 分组
  const subCategoryMap: Record<string, Product[]> = {};
  filteredList.forEach((p) => {
    if (!subCategoryMap[p.subCategory]) subCategoryMap[p.subCategory] = [];
    subCategoryMap[p.subCategory].push(p);
  });
  const subCategories = Object.keys(subCategoryMap);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="brand-select" className="font-medium">品牌筛选：</label>
        <select
          id="brand-select"
          className="border rounded px-2 py-1 dark:bg-black dark:border-gray-700"
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
        >
          <option value="全部">全部</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {subCategories.map((sub) => (
          <div key={sub} className="bg-white dark:bg-black rounded-lg shadow p-4 relative">
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
    </div>
  );
} 