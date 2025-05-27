# MI Trace

MI Trace 是一个使用 Next.js 构建的小型项目，用于对小米手机的评论数据和销量趋势进行可视化分析。

## 功能

1. 通过接口抓取小米手机评论数据，示例接口:
    ```
    GET /api/comments?pid=10050081
    ```
    该接口会转发请求到小米官方的
    `https://api2.service.order.mi.com/user_comment/get_summary`，
    并将返回的 JSONP 数据解析为 JSON。
2. 使用图表的方式直观分析小米手机销量趋势，包括两个统计维度:
   - 同系列不同年份款（例如小米13/小米14/小米15）
   - 同年份不同型号（例如小米数字系列、红米 K 系列、红米 Turbo 系列）
   可通过 `/sales` 页面查看示例图表。

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
