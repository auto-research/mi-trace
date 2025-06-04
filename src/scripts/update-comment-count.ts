import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH = path.resolve(__dirname, '../../data/comments.db');

function parseArgs() {
  const args = process.argv.slice(2);
  const argObj: Record<string, string> = {};
  args.forEach(arg => {
    const m = arg.match(/^--([a-zA-Z0-9_\-]+)=(.+)$/);
    if (m) argObj[m[1]] = m[2];
  });
  return argObj;
}

function main() {
  const { id, date, count } = parseArgs();
  if (!id || !date || !count) {
    console.error('用法: npx ts-node src/scripts/update-comment-count.ts --id=12345 --date=2024-06-01 --count=999');
    process.exit(1);
  }
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.prepare(`CREATE TABLE IF NOT EXISTS comments (
    date TEXT,
    pid INTEGER,
    comments_total INTEGER,
    product_id TEXT,
    PRIMARY KEY(date, pid)
  )`).run();
  const stmt = db.prepare('INSERT OR REPLACE INTO comments (date, pid, comments_total, product_id) VALUES (?, ?, ?, ?)');
  stmt.run(date, Number(id), Number(count), String(id));
  db.close();
  console.log(`已更新: 日期=${date}, id=${id}, 评论数=${count}`);
}

main(); 