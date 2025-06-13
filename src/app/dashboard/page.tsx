import { productList } from '../../../data/product-list';
import TrendCharts from './_components/trend-charts';
import Database from 'better-sqlite3';
import { join } from 'path';
import { Metadata } from 'next';
import { Brand, brandList } from '../../../data/brand';
import { BrandShareTrendChart } from './_components/brand-share-trend-chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

interface CommentRecord {
  date: string;
  comments_total: number;
}

interface MarketShareRecord {
  year: number;
  week: number;
  brand: number;
  share: number;
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

function getBrandShareTrends(): {
  trends: Record<number, { x: string; y: number }[]>;
  weekDateMap: Record<string, { date_start: string; date_end: string }>;
} {
  const DB_PATH = join(process.cwd(), 'data', 'market_share.db');
  const db = new Database(DB_PATH);
  const rows = db.prepare('SELECT year, week, brand, share, date_start, date_end FROM market_share ORDER BY year, week').all() as (MarketShareRecord & { date_start: string; date_end: string })[];
  db.close();
  // 按品牌分组
  const brandMap: Record<number, { x: string; y: number }[]> = {};
  const weekDateMap: Record<string, { date_start: string; date_end: string }> = {};
  for (const row of rows) {
    const weekKey = `W${row.week}`;
    if (!brandMap[row.brand]) brandMap[row.brand] = [];
    brandMap[row.brand].push({ x: weekKey, y: row.share });
    if (!weekDateMap[weekKey]) {
      weekDateMap[weekKey] = { date_start: row.date_start, date_end: row.date_end };
    }
  }
  return { trends: brandMap, weekDateMap };
}

function getLastCrawlTime(): string | null {
  const DB_PATH = join(process.cwd(), 'data', 'comments.db');
  const db = new Database(DB_PATH);
  try {
    const row = db.prepare('SELECT crawl_time FROM crawl_log ORDER BY id DESC LIMIT 1').get();
    db.close();
    return row?.crawl_time ?? null;
  } catch {
    db.close();
    return null;
  }
}

export const metadata: Metadata = {
  title: "小米产品评论趋势分析 - MI Trace",
  description: "基于 ECharts 的小米产品评论趋势可视化，支持多产品对比、年度分析，数据一目了然。",
  keywords: ["小米", "评论趋势", "数据可视化", "ECharts", "产品对比", "年度分析"],
};

export default function DashboardPage() {
  const allPids = productList.map(p => p.id);
  const dataMap = getAllCommentsMap(allPids);
  const { trends: brandShareTrends, weekDateMap } = getBrandShareTrends();
  const lastCrawlTime = getLastCrawlTime();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Tabs defaultValue="trend" className="w-full">
        <TabsList className="mb-6 flex gap-2">
          <TabsTrigger value="trend">小米手机趋势跟踪</TabsTrigger>
          <TabsTrigger value="share">手机品牌周度份额</TabsTrigger>
        </TabsList>
        <TabsContent value="trend">
          <TrendCharts productList={productList} dataMap={dataMap} lastCrawlTime={lastCrawlTime} />
        </TabsContent>
        <TabsContent value="share">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">品牌周度市场份额趋势</h2>
            <BrandShareTrendChart data={brandShareTrends} weekDateMap={weekDateMap} />
            <div className="text-xs text-gray-400 mt-2 text-right">数据来源：微博（RD 观测）</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 