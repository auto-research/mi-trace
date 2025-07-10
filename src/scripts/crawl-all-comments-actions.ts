import { productList } from '../../data/product-list';
import Database from 'better-sqlite3';
import { join } from 'path';

const API_URL = 'https://api2.service.order.mi.com/user_comment/get_summary';
const DB_PATH = join(process.cwd(), 'data', 'comments.db');

// 初始化数据库和表
function getDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.prepare(`CREATE TABLE IF NOT EXISTS comments (
    date TEXT,
    pid INTEGER,
    comments_total INTEGER,
    product_id TEXT,
    PRIMARY KEY(date, pid)
  )`).run();
  db.prepare(`CREATE TABLE IF NOT EXISTS crawl_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crawl_time TEXT
  )`).run();
  return db;
}

function getYearArg(): number | undefined {
  const yearArg = process.argv.find((arg) => arg.startsWith('--year='));
  if (yearArg) {
    const year = parseInt(yearArg.split('=')[1], 10);
    if (!isNaN(year)) return year;
  }
  return undefined;
}

async function crawlAllComments() {
  const year = getYearArg();
  const filtered = year ? productList.filter((p) => p.year === year) : productList;
  const pids = filtered.map((p) => p.id);
  
  if (pids.length === 0) {
    console.log(year ? `未找到 ${year} 年的产品` : '未找到产品');
    return;
  }

  console.log(`开始抓取 ${pids.length} 个产品的评论数据...`);
  
  const date = new Date().toISOString().slice(0, 10);
  const db = getDb();
  db.prepare('INSERT INTO crawl_log (crawl_time) VALUES (?)').run(new Date().toISOString());
  const results: any[] = [];

  for (const pid of pids) {
    const url = `${API_URL}?v_pid=${encodeURIComponent(pid)}&goods_id=${encodeURIComponent(pid)}&callback=__jp`;
    try {
      console.log(`正在抓取产品 ${pid}...`);
      const res = await fetch(url, {
        headers: { referer: 'https://www.mi.com' },
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const text = await res.text();
      const match = text.match(/__jp\d*\((.*)\)/s);
      if (!match) throw new Error('Invalid response');
      
      const data = JSON.parse(match[1]);
      if (data?.code !== 200) {
        results.push({ pid, error: 'Remote API code not 200', code: data?.code });
        console.log(`产品 ${pid} 抓取失败: API 返回错误码 ${data?.code}`);
        continue;
      }
      
      const comments_total = data?.data?.detail?.comments_total;
      const product_id = data?.data?.detail?.product_id;
      
      db.prepare(
        'INSERT OR REPLACE INTO comments (date, pid, comments_total, product_id) VALUES (?, ?, ?, ?)'
      ).run(date, pid, comments_total, product_id);
      
      results.push({ pid, comments_total, product_id, success: true });
      console.log(`产品 ${pid} 抓取成功: ${comments_total} 条评论`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      results.push({ pid, error: errorMsg });
      console.log(`产品 ${pid} 抓取失败: ${errorMsg}`);
    }
  }
  
  db.close();
  
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.length - successCount;
  
  console.log('抓取完成!');
  console.log(`成功: ${successCount} 个产品`);
  console.log(`失败: ${errorCount} 个产品`);
  console.log('详细结果:', results);
}

crawlAllComments().catch((err) => {
  console.error('脚本运行出错:', err);
  process.exit(1);
}); 