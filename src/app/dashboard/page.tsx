import { productList } from '../../../data/product-list';
import TrendCharts from './_components/trend-charts';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-8">评论趋势 Dashboard</h1>
      <TrendCharts productList={productList} />
    </div>
  );
} 