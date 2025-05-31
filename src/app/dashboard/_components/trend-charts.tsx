import { Product } from 'data/product-list';
import TrendChartsClient from './trend-charts-client';

interface CommentRecord {
  date: string;
  comments_total: number;
}

interface TrendChartsProps {
  productList: Product[];
  dataMap: Record<number, CommentRecord[]>;
}


export default function TrendCharts({ productList, dataMap }: TrendChartsProps) {
  return <TrendChartsClient productList={productList} dataMap={dataMap} />;
} 