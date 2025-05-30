"use client";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

interface Product {
  id: number;
  name: string;
}

interface TrendChartsProps {
  productList: Product[];
}

const TrendChart = dynamic(() => import('@components/ui/trend-chart').then(mod => mod.TrendChart), {
  loading: () => <div className="h-64 flex items-center justify-center">加载中...</div>,
});

export default function TrendCharts({ productList }: TrendChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {productList.map((product) => (
        <div key={product.id} className="bg-white dark:bg-black rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
          <Suspense fallback={<div className="h-64 flex items-center justify-center">加载中...</div>}>
            <TrendChart pid={product.id} />
          </Suspense>
        </div>
      ))}
    </div>
  );
} 