import { productList } from '../../data/product-list';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const resultDir = path.resolve(__dirname, '../../data/result');
const productIdSet = new Set(productList.map((p) => String(p.id)));

const DB_PATH = path.resolve(__dirname, '../../data/comments.db');

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

function filterFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  let arr: any[];
  try {
    arr = JSON.parse(raw);
  } catch (e) {
    console.error(`文件 ${filePath} 解析失败:`, e);
    return;
  }
  const filtered = arr.filter((item) => productIdSet.has(String(item.id)));
  const removed = arr.filter((item) => !productIdSet.has(String(item.id))).map((item) => item.id);
  const outPath = filePath.replace(/\.json$/, '.filtered.json');
  fs.writeFileSync(outPath, JSON.stringify(filtered, null, 2), 'utf-8');
  if (removed.length > 0) {
    console.log(`${path.basename(filePath)} 被过滤掉的 id:`, removed);
  } else {
    console.log(`${path.basename(filePath)} 没有被过滤的 id`);
  }
}

function importToDb(filePath: string) {
  const db = getDb();
  let date = path.basename(filePath).replace(/\.filtered\.json$/, '');
  date = date.slice(0, 10); // yyyy-MM-dd
  const raw = fs.readFileSync(filePath, 'utf-8');
  let arr: any[];
  try {
    arr = JSON.parse(raw);
  } catch (e) {
    console.error(`文件 ${filePath} 解析失败:`, e);
    db.close();
    return;
  }
  const idMap = new Map();
  for (const item of arr) {
    idMap.set(String(item.id), item);
  }
  const stmt = db.prepare('INSERT OR REPLACE INTO comments (date, pid, comments_total, product_id) VALUES (?, ?, ?, ?)');
  let count = 0;
  for (const item of idMap.values()) {
    stmt.run(date, Number(item.id), Number(item.count), String(item.id));
    count++;
  }
  db.close();
  console.log(`${path.basename(filePath)} 导入 ${count} 条记录到数据库`);
}

function main() {
  const files = fs.readdirSync(resultDir)
    .filter(f => f.endsWith('.json') && !f.includes('filtered'));
  files.forEach(f => {
    filterFile(path.join(resultDir, f));
  });
  // 导入 filtered 文件
  const filteredFiles = fs.readdirSync(resultDir).filter(f => f.endsWith('.filtered.json'));
  filteredFiles.forEach(f => {
    importToDb(path.join(resultDir, f));
  });
}

main(); 