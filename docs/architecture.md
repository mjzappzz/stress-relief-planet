# 解压星球架构与部署说明

## 1. 当前状态

解压星球是一个前后端分离 Web 应用，当前线上架构为：

- 前端：React 18 + Vite 5 + React Router + Zustand + Tailwind CSS
- 后端：Node.js + Express + mysql2
- 数据库服务：Docker MySQL 8，容器 `stress-relief-mysql`，库名 `stress_relief_planet`
- 后端数据访问：mysql2/promise
- 入口网关：Nginx 80 端口
- 后端进程管理：systemd `stress-relief-backend.service`

线上项目根目录：

```text
/var/www/html
```

## 2. 请求链路

```text
Browser
  -> Nginx :80
      -> 静态页面/资源：/var/www/html/frontend/dist
      -> API 请求：/api/* -> http://127.0.0.1:5000
          -> Express backend
              -> mysql2/promise
                  -> Docker MySQL stress_relief_planet
```

页面路由由 React Router 在浏览器端处理。Nginx 对非静态文件、非 API 请求执行 SPA fallback，返回 `frontend/dist/index.html`。

## 3. 标准目录结构

```text
/var/www/html/
├── AGENTS.md        # Codex/Agent 项目规则
├── frontend/        # React + Vite 前端工程
│   ├── src/         # 前端源码
│   ├── dist/        # 线上静态构建产物，Nginx root 指向这里
│   ├── package.json
│   └── vite.config.js
├── backend/         # Express 后端工程
│   ├── docs/        # 后端 API 文档
│   ├── src/         # 后端业务代码
│   ├── .env         # 后端生产环境变量，不提交、不外传
│   ├── server.js    # 后端入口
│   └── package.json
├── database/        # MySQL 说明、初始化和迁移脚本
├── docs/            # 项目级文档：架构、部署、运维约定
├── nginx/           # Nginx 配置参考副本，不是生效路径
├── scripts/         # 运维脚本
└── backups/         # 线上变更备份和归档文件
```

## 4. 前端架构

前端位于 `frontend/`。

### 4.1 技术栈

- React 18
- Vite 5
- React Router 6
- Zustand
- Tailwind CSS
- axios
- framer-motion
- react-icons

### 4.2 源码入口

```text
frontend/index.html
frontend/src/main.jsx
frontend/src/App.jsx
```

`App.jsx` 负责页面路由和整体布局，包含 `Navbar`、`Footer` 和页面级路由。

### 4.3 页面路由

```text
/           -> Home
/bubble     -> BubbleWrap
/maze       -> MazeGame
/coloring   -> ColoringPage
/breathing  -> BreathingExercise
/piano      -> Piano
/login      -> Login
/register   -> Register
/profile    -> Profile
/stats      -> Stats
```

### 4.4 前端状态

全局状态位于：

```text
frontend/src/store.js
```

当前 Zustand store 维护：

- `user`
- `token`，持久化在 `localStorage`
- `activities`
- `stressLevel`
- `stats`

### 4.5 构建产物

生产构建输出：

```text
frontend/dist
```

Nginx 当前直接服务该目录，不再使用旧的 `/var/www/html/public`。

构建命令：

```bash
cd /var/www/html/frontend
npm run build
```

## 5. 后端架构

后端位于 `backend/`。

### 5.1 技术栈

- Node.js
- Express 4
- mysql2
- bcryptjs
- jsonwebtoken
- express-validator
- helmet
- express-rate-limit
- dotenv

### 5.2 运行入口

```text
backend/server.js
```

职责：

- 加载 `.env`
- 初始化 Express
- 设置 `trust proxy = 1`，适配 Nginx 反代和限流
- 启用 helmet、CORS、JSON body parser、rate limit
- 注册 API 路由
- 连接 MySQL
- 监听 `PORT`，默认 5000

### 5.3 后端目录

```text
backend/src/
├── db/mysql.js
├── data/seedDatabase.js
├── middleware/authMiddleware.js
├── models/Activity.js
├── models/Progress.js
├── models/User.js
├── routes/activityRoutes.js
├── routes/progressRoutes.js
├── routes/userRoutes.js
└── utils/auth.js
```

### 5.4 API 路由

```text
GET  /api/health
POST /api/users/register
POST /api/users/login
GET  /api/activities
GET  /api/progress
POST /api/progress
GET  /api/progress/stats
```

API 文档位置：

```text
backend/docs/api.md
```

### 5.5 数据模型

`User`：

- `username`，唯一
- `email`，唯一
- `password`，保存前 bcrypt hash
- `createdAt`

`Activity`：

- `type`，唯一
- `name`
- `description`
- `icon`

`Progress`：

- `activityType`
- `duration`
- `score`
- `description`
- `createdAt`

### 5.6 认证现状

后端已提供 JWT 生成和验证工具：

```text
backend/src/utils/auth.js
backend/src/middleware/authMiddleware.js
```

当前部分 API 未强制接入 `protectRoute`。如后续要保护用户数据，需要明确哪些接口需要认证，再逐步接入中间件。

## 6. 数据库

当前数据库为 Docker MySQL 8。

- 容器：`stress-relief-mysql`
- 镜像：`mysql:8`
- 端口：`3306`
- 默认库名：`stress_relief_planet`
- 初始化脚本：`database/init.sql`

后端通过 `backend/src/db/mysql.js` 中的 `mysql2/promise` 连接池访问 MySQL。

检查命令：

```bash
docker start stress-relief-mysql
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
```

数据库说明位置：

```text
README.md
```

## 7. Nginx 架构

生效配置：

```text
/etc/nginx/conf.d/stress-relief.conf
/etc/nginx/sites-enabled/default
```

项目内参考副本：

```text
nginx/stress-relief.conf
nginx/default.conf
```

当前核心配置：

```text
server_name 47.109.105.242
root /var/www/html/frontend/dist
/api/ -> http://127.0.0.1:5000
```

静态资源缓存策略：

- JS/CSS/图片/字体：`Cache-Control: public, max-age=31536000, immutable`
- HTML / SPA fallback：`no-cache, no-store, must-revalidate`

验证 Nginx：

```bash
nginx -t
systemctl reload nginx
```

## 8. systemd 后端服务

服务文件：

```text
/etc/systemd/system/stress-relief-backend.service
```

当前配置要点：

```text
WorkingDirectory=/var/www/html/backend
ExecStart=/usr/bin/node /var/www/html/backend/server.js
Environment=NODE_ENV=production
After=network.target
Restart=on-failure
```

当前服务器侧数据库服务已改为 Docker MySQL。若服务文件仍包含旧数据库依赖，需要在切换后同步移除并执行 `systemctl daemon-reload`。

常用命令：

```bash
systemctl status stress-relief-backend --no-pager
systemctl restart stress-relief-backend
journalctl -u stress-relief-backend -n 100 --no-pager
```

## 9. 环境变量

后端环境变量文件：

```text
/var/www/html/backend/.env
```

当前使用变量：

```text
MYSQL_HOST
MYSQL_PORT
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DATABASE
PORT
NODE_ENV
JWT_SECRET
CORS_ORIGIN
RATE_LIMIT_MAX
```

前端环境变量文件：

```text
/var/www/html/frontend/.env.local
```

当前使用变量：

```text
VITE_API_URL
```

安全要求：不要在文档、日志、提交记录或对话中回显 `.env` 的实际密钥值。

## 10. 发布流程

### 10.1 前端发布

```bash
cd /var/www/html/frontend
npm install
npm run build
nginx -t && systemctl reload nginx
```

前端发布不需要重启后端。

### 10.2 后端发布

```bash
cd /var/www/html/backend
npm install
node -c server.js
systemctl restart stress-relief-backend
journalctl -u stress-relief-backend -n 50 --no-pager
```

### 10.3 Nginx 配置发布

```bash
nginx -t
systemctl reload nginx
```

## 11. 健康检查

```bash
systemctl is-active stress-relief-backend nginx
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
curl -fsS http://127.0.0.1/api/health
curl -fsSI http://127.0.0.1/
```

预期：

```text
stress-relief-backend: active
nginx: active
stress-relief-mysql: Up/healthy
/api/health: 返回 JSON status=ok
/: HTTP 200
```

## 12. 备份与回退

变更前应创建备份目录：

```text
/var/www/html/backups/<change-name>-YYYYmmdd-HHMMSS
```

建议至少备份：

- `docs/`
- `backend/server.js`
- `backend/package.json`
- `frontend/package.json`
- `/etc/nginx/conf.d/stress-relief.conf`
- `/etc/nginx/sites-enabled/default`
- `/etc/systemd/system/stress-relief-backend.service`

回退原则：

1. 先恢复文件
2. `nginx -t`
3. `systemctl daemon-reload`，如果改过 systemd
4. 重启或 reload 对应服务
5. 重新执行健康检查

## 13. 当前维护边界

- 线上运行路径是 `frontend/dist` 和 `backend/server.js`。
- `backups/` 只用于归档，不作为运行路径。
- `nginx/` 只是配置参考副本，真正生效的是 `/etc/nginx/` 下的配置。
- API 文档归后端维护，位置是 `backend/docs/api.md`。
- 项目级文档只放架构、部署、运维约定等跨模块内容。
