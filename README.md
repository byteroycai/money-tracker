# Money Tracker

使用 Next.js、Prisma 与 SQLite 构建的个人记账应用。支持添加、查看与删除收支记录，提供实时统计、主题切换与图表可视化。

## 功能特性

- 💰 记录收入 / 支出，包含金额、类别、备注与日期字段
- 📊 顶部统计卡片实时展示总收入、总支出与余额
- 🎨 使用 Tailwind CSS 打造现代化界面，支持浅色 / 深色模式切换
- ✨ Framer Motion 驱动的添加 / 删除过渡动画与悬停高亮
- 🍩 基于 Chart.js 的支出类别占比图
- 🗄️ Prisma + SQLite 持久化数据

## 本地开发

1. 安装依赖

   ```bash
   npm install
   ```

2. 初始化数据库（只需执行一次）

   ```bash
   npx prisma migrate dev --name init
   ```

3. 启动开发服务器

   ```bash
   npm run dev
   ```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 环境变量

应用默认使用项目根目录下的 `.env` 配置：

```
DATABASE_URL="file:./dev.db"
```

如需使用其他数据库路径，可按需调整。
