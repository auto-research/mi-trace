import { productList } from '../../../data/product-list';
import TrendCharts from './_components/trend-charts';
import Database from 'better-sqlite3';
import { join } from 'path';
import { Metadata } from 'next';

interface CommentRecord {
  date: string;
  comments_total: number;
}

function getAllCommentsMap(pids: number[]): Record<number, CommentRecord[]> {
  const DB_PATH = join(process.cwd(), 'data', 'comments.db');
  const db = new Database(DB_PATH);
  const map: Record<number, CommentRecord[]> = {};
  for (const pid of pids) {
    const rows = db.prepare('SELECT date, comments_total FROM comments WHERE pid = ? ORDER BY date ASC').all(pid) as CommentRecord[];
    map[pid] = rows;
  }
  db.close();
  return map;
}

export const metadata: Metadata = {
  title: "小米产品评论趋势分析 - MI Trace",
  description: "基于 ECharts 的小米产品评论趋势可视化，支持多产品对比、年度分析，数据一目了然。",
  keywords: ["小米", "评论趋势", "数据可视化", "ECharts", "产品对比", "年度分析"],
};

export default function DashboardPage() {
  const allPids = productList.map(p => p.id);
  const dataMap = getAllCommentsMap(allPids);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-8">评论趋势跟踪</h1>
      <TrendCharts productList={productList} dataMap={dataMap} />
    </div>
  );
} 