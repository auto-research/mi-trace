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
