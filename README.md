# MI Trace

MI Trace 是一个使用 Next.js 构建的小型项目，用于对小米手机的评论数据和销量趋势进行可视化分析。

## 开发运行

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动服务：
   ```bash
   npm run dev
   ```

打开 [http://localhost:3000](http://localhost:3000) 使用。

## 批量抓取产品评论数

你可以使用以下命令批量抓取所有产品的评论数（会自动写入本地数据库）：

```bash
npm run crawl:comments
```

如需只抓取指定年份的产品评论数，可加 year 参数，例如：

```bash
npm run crawl:comments -- --year=2024
```

抓取结果会在控制台输出。

## 手动更新评论数（单条）

如需手动修正某个产品某天的评论数，可使用如下命令：

```bash
npx tsx src/scripts/update-comment-count.ts --id=12345 --date=2024-06-01 --count=999
```

参数说明：
- `--id`：产品 id
- `--date`：日期（如 2024-06-01）
- `--count`：评论数

该命令会直接写入/覆盖数据库对应记录。
