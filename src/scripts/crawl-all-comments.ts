import { productList } from '../../data/product-list';

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
  const res = await fetch('http://localhost:3000/api/comments/crawl', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pids }),
  });
  if (!res.ok) {
    console.error('批量抓取失败', await res.text());
    return;
  }
  const data = await res.json();
  console.log('抓取结果:', data.results);
}

crawlAllComments().catch((err) => {
  console.error('脚本运行出错:', err);
}); 