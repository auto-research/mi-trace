import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import dayjs from 'dayjs';
import { Brand } from 'data/brand';

// Brand 枚举映射
const BRAND_MAP: Record<string, number> = {
  '苹果': Brand.APPLE,
  'Apple': Brand.APPLE,
  '华为': Brand.HUAWEI,
  '小米': Brand.XIAOMI,
  'Xiaomi': Brand.XIAOMI,
  '荣耀': Brand.HONOR,
  'OPPO': Brand.OPPO,
  'VIVO': Brand.VIVO,
  'vivo': Brand.VIVO,
  '华为智选': Brand.HUAWEI_SELECTION,
  'Others': Brand.OTHERS,
  '其他': Brand.OTHERS,
  'realme': Brand.OPPO, // realme 合并到 OPPO
};

interface Row {
  year: number;
  week: number;
  date_start: string;
  date_end: string;
  brand: string;
  share: number;
}

function parseWeekHeader(line: string) {
  // 例：2025 W1（2024.12.30-2025.1.5）或 2025 W21（5.19-5.25）
  const m = line.match(/(\d{4})\s*W(\d+)[（(]([\d\.]+)-([\d\.]+)[)）]/);
  if (!m) return null;
  const [_, year, week, start, end] = m;

  let start_date = '';
  let end_date = '';

  // 判断 start/end 是否带年份
  if (start.split('.').length === 3) {
    // 2024.12.30
    start_date = dayjs(start.replace(/\./g, '-')).format('YYYY-MM-DD');
  } else {
    // 5.19 这种
    start_date = dayjs(`${year}.${start}`.replace(/\./g, '-')).format('YYYY-MM-DD');
  }
  if (end.split('.').length === 3) {
    end_date = dayjs(end.replace(/\./g, '-')).format('YYYY-MM-DD');
  } else {
    end_date = dayjs(`${year}.${end}`.replace(/\./g, '-')).format('YYYY-MM-DD');
  }

  // 跨年处理：如果 start_date > end_date 且 end 只有月日，则年份+1
  if (
    start_date &&
    end_date &&
    start_date > end_date &&
    end.split('.').length === 2
  ) {
    const nextYear = parseInt(year) + 1;
    end_date = dayjs(`${nextYear}.${end}`.replace(/\./g, '-')).format('YYYY-MM-DD');
  }

  return {
    year: parseInt(year),
    week: parseInt(week),
    date_start: start_date,
    date_end: end_date,
  };
}

function parseBrandLine(line: string) {
  // 例：1.苹果 25.9%（含iQOO 4.5%）
  const m = line.match(/^\d+\.(\S+)\s+([\d.]+)%/);
  if (!m) return null;
  let [_, brand, share] = m;
  // 去除括号内容
  brand = brand.replace(/（.*?）/, '');
  return { brand, share: parseFloat(share) };
}

function insertRows(db: Database.Database, rows: Row[]) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO market_share (year, week, date_start, date_end, brand, share)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertMany = db.transaction((rows: Row[]) => {
    for (const row of rows) {
      const brandId = BRAND_MAP[row.brand] ?? 7;
      stmt.run(row.year, row.week, row.date_start, row.date_end, brandId, row.share);
      console.log(`已更新: year=${row.year}, week=${row.week}, date_start=${row.date_start}, date_end=${row.date_end}, brand=${brandId}, share=${row.share}`);
    }
  });
  insertMany(rows);
}


function main() {
  const dbPath = path.resolve(__dirname, '../../data/market_share.db');
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS market_share (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER,
      week INTEGER,
      date_start TEXT,
      date_end TEXT,
      brand INTEGER,
      share REAL,
      UNIQUE(year, week, brand)
    )
  `);

  const txtPath = path.resolve('data/market-share.txt');
  const lines = fs.readFileSync(txtPath, 'utf-8').split('\n');

  let currentWeek: any = null;
  let weekRows: Row[] = [];
  const allRows: Row[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    const weekHeader = parseWeekHeader(line);
    if (weekHeader) {
      // 处理上一周数据
      if (weekRows.length > 0) {
        // realme 合并到 OPPO
        let oppo = weekRows.find(r => r.brand === 'OPPO');
        let realme = weekRows.find(r => r.brand === 'realme');
        if (realme) {
          if (oppo) {
            oppo.share += realme.share;
          } else {
            // 没有 OPPO，直接用 realme 作为 OPPO
            weekRows.push({ ...realme, brand: 'OPPO' });
          }
          weekRows = weekRows.filter(r => r.brand !== 'realme');
        }
        allRows.push(...weekRows);
      }
      currentWeek = weekHeader;
      weekRows = [];
      continue;
    }
    const brandLine = parseBrandLine(line);
    if (brandLine && currentWeek) {
      weekRows.push({
        year: currentWeek.year,
        week: currentWeek.week,
        date_start: currentWeek.date_start,
        date_end: currentWeek.date_end,
        brand: brandLine.brand,
        share: brandLine.share,
      });
    }
  }
  // 处理最后一周
  if (weekRows.length > 0) {
    let oppo = weekRows.find(r => r.brand === 'OPPO');
    let realme = weekRows.find(r => r.brand === 'realme');
    if (realme) {
      if (oppo) {
        oppo.share += realme.share;
      } else {
        weekRows.push({ ...realme, brand: 'OPPO' });
      }
      weekRows = weekRows.filter(r => r.brand !== 'realme');
    }
    allRows.push(...weekRows);
  }

  insertRows(db, allRows);
  db.close();
  console.log('数据导入完成，共导入', allRows.length, '条记录');
}

main(); 