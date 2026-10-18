# SportLink (运动链)

面向户外与运动爱好者的活动组局与社交交易平台。覆盖微信小程序端与 NestJS 后端。

## 📖 项目简介

SportLink 旨在解决“想运动却找不到搭子”的痛点。用户可以在这里发布活动（徒步、骑行、飞盘等）、寻找同城搭子、在线报名并完成支付。

**核心功能：**

- 🏃 **活动组局**：发布/浏览/搜索活动，支持时间、地点、类型筛选。
- 🙋 **报名与支付**：基于数据库行锁的高并发报名防超卖机制，集成微信支付。
- 🗺️ **地图与轨迹**：活动地点地图选点，后续支持轨迹展示。
- 💬 **社交互动**：活动详情展示、发起人信息、后续接入 IM 即时通讯。

## 🛠️ 技术栈

本项目采用 pnpm workspace 管理的 Monorepo 结构。

- **前端 (apps/miniapp)**: Taro 4 + React 18 + TypeScript + Zustand
- **后端 (apps/server)**: NestJS 12 + Prisma 7 + MySQL 8
- **共享代码 (packages/shared)**: 通用类型定义、工具函数

## 📂 目录结构

```text
outdoor-platform/
├── apps/
│   ├── miniapp/          # 微信小程序 (Taro)
│   └── server/           # 后端 API (NestJS)
├── packages/
│   └── shared/           # 跨端共享代码 (暂未启用模型定义)
├── .env.example          # 环境变量模板
├── package.json          # 根目录依赖与全局脚本
└── pnpm-workspace.yaml
```

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 18
- pnpm >= 8 (`npm i -g pnpm`)
- MySQL >= 8.0
- 微信开发者工具

### 2. 安装依赖

在项目根目录执行：

```bash
pnpm install
```

### 3. 配置环境变量

复制根目录的 `.env.example` 到 `apps/server/.env`，并填入正确的数据库、微信、OSS 等配置：

```bash
cp .env.example apps/server/.env
```

### 4. 初始化数据库

```bash
cd apps/server
# 运行数据库迁移
pnpm exec prisma migrate dev
# 生成 Prisma Client (Prisma 7 必须手动执行)
pnpm exec prisma generate
```

### 5. 启动开发服务

在项目根目录执行，同时启动前后端：

```bash
pnpm dev
```

- 后端 API 地址: `http://localhost:3000/api`
- 小程序端：使用微信开发者工具导入 `apps/miniapp` 目录（工具会自动读取 `dist` 产物）。

## 📜 常用命令速查 (Root package.json)

| 命令              | 说明                              |
| ----------------- | --------------------------------- |
| `pnpm dev`        | 同时启动前后端开发服务器          |
| `pnpm lint`       | 全仓库 ESLint 检查                |
| `pnpm typecheck`  | 全仓库 TypeScript 类型检查        |
| `pnpm format`     | Prettier 格式化所有代码           |
| `pnpm db:studio`  | 打开 Prisma Studio 可视化数据管理 |
| `pnpm db:migrate` | 运行 Prisma 迁移 (开发环境)       |

## 🗄️ 数据库与 Prisma 注意事项 (重要)

1. **Prisma 7 特性**：`migrate dev` **不会**自动触发 `generate`。每次修改 `schema.prisma` 后，必须手动运行 `pnpm exec prisma generate`。
2. **枚举导出**：Prisma 7 的 `prisma-client` 生成器不再生成统一的 `index.ts`，枚举需从 `../generated/prisma/enums` 引入。
3. **时区处理**：数据库中默认存 UTC 时间。前端的 `Picker` 拿到本地时间后需调用 `toISOString()` 转为 UTC 后再提交给后端。

## 🌐 真机调试注意事项

1. **局域网访问**：真机无法访问电脑的 `localhost`。需将前端的 `BASE_URL` 改为电脑的局域网 IP（如 `http://192.168.1.100:3000/api`）。
2. **开启调试**：真机扫码预览后，点击右上角 `...` -> `打开调试`，否则微信会拦截 HTTP 请求。
3. **不校验域名**：微信开发者工具 -> 详情 -> 本地设置 -> 勾选“不校验合法域名”。

## 📅 开发进度

- [x] 0.1 仓库与工具链
- [x] 0.2 账号与资质
- [x] 0.3 最小链路打通 (前后端+DB)
- [x] 1.1 用户认证 (JWT + 微信登录)
- [x] 1.2 活动发布与展示
- [ ] 1.3 报名与支付 (进行中)
- [ ] 1.4 地图与轨迹
- [ ] 1.5 即时通讯 (IM)

## 📄 版权声明

Private Project. All rights reserved.
