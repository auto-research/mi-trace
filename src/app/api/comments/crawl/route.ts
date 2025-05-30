import { NextRequest, NextResponse } from 'next/server';
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
  return db;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get('pid');
  if (!pid) {
    return NextResponse.json({ error: 'missing pid' }, { status: 400 });
  }
  try {
    const db = getDb();
    const rows = db.prepare(
      'SELECT date, pid, comments_total, product_id FROM comments WHERE pid = ? ORDER BY date DESC'
    ).all(pid);
    db.close();
    return NextResponse.json({ success: true, records: rows });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to query comments', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 批量抓取评论数接口
export async function PUT(req: NextRequest) {
  const { pids } = await req.json();
  if (!Array.isArray(pids) || pids.length === 0) {
    return NextResponse.json({ error: 'missing or invalid pids' }, { status: 400 });
  }

  const date = new Date().toISOString().slice(0, 10);
  const db = getDb();
  const results: any[] = [];

  for (const pid of pids) {
    const url = `${API_URL}?v_pid=${encodeURIComponent(pid)}&goods_id=${encodeURIComponent(pid)}&callback=__jp`;
    try {
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
        continue;
      }
      const comments_total = data?.data?.detail?.comments_total;
      const product_id = data?.data?.detail?.product_id;
      db.prepare(
        'INSERT OR REPLACE INTO comments (date, pid, comments_total, product_id) VALUES (?, ?, ?, ?)'
      ).run(date, pid, comments_total, product_id);
      results.push({ pid, comments_total, product_id, success: true });
    } catch (err) {
      results.push({ pid, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
  db.close();
  return NextResponse.json({ results });
} 