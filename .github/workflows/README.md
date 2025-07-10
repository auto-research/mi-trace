# GitHub Actions 工作流说明

## 每日评论抓取工作流

### 功能
- 每天 0 点 (UTC 时间) 自动执行评论数据抓取
- 支持手动触发执行
- 抓取小米产品评论数据并存储到 SQLite 数据库

### 配置说明

#### 定时执行
工作流使用 cron 表达式配置定时执行：
```yaml
schedule:
  - cron: '0 0 * * *'  # 每天 0 点 (UTC)
```

#### 手动触发
在 GitHub 仓库的 Actions 页面可以手动触发工作流执行。

### 执行步骤
1. **检出代码**: 获取最新的代码
2. **设置 Node.js**: 使用 Node.js 20 版本
3. **安装依赖**: 使用 `npm ci` 安装项目依赖
4. **构建项目**: 执行 `npm run build` 构建项目
5. **执行抓取**: 运行 `npm run crawl:comments:actions` 抓取评论数据

### 注意事项
- 工作流会在 GitHub Actions 的 Ubuntu 环境中运行
- 数据库文件会保存在 `data/comments.db` 中
- 抓取日志会记录在 `crawl_log` 表中
- 如果抓取失败，工作流会返回错误状态

### 自定义配置
如果需要修改执行时间，可以编辑 `.github/workflows/daily-crawl.yml` 文件中的 cron 表达式：

```yaml
# 示例：每天上午 10 点执行 (UTC)
- cron: '0 10 * * *'

# 示例：每周一凌晨 3 点执行 (UTC)
- cron: '0 3 * * 1'
```

### 监控和调试
- 在 GitHub 仓库的 Actions 页面可以查看执行历史
- 每次执行的日志都会详细记录抓取过程和结果
- 如果出现错误，可以在 Actions 页面查看详细的错误信息 