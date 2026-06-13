# Stress Relief Planet - 解压星球

减压 Web 应用，包含泡泡纸、迷宫、绘画、呼吸练习、钢琴等减压活动。

## 项目状态

**当前是已部署在阿里云上的前后端分离 Web 应用。**

| 模块 | 当前架构 | 线上说明 |
|------|----------|----------|
| 前端 | React 18 + Vite 5 + React Router + Zustand + Tailwind CSS | 构建产物由 Nginx 直接服务 |
| 后端 | Node.js + Express + mysql2 | systemd 管理 `stress-relief-backend.service` |
| 数据库服务 | Docker MySQL 8 | 容器 `stress-relief-mysql`，库名 `stress_relief_planet` |
| 部署 | Nginx + Node.js + MySQL | `/api/` 反代到 `127.0.0.1:5000` |

## 项目结构

```text
/var/www/html/
├── AGENTS.md
├── CLAUDE.md
├── frontend/                # React + Vite 前端工程
│   ├── dist/                # 线上静态构建目录，Nginx root 指向这里
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 通用组件
│   │   ├── store.js         # Zustand 全局状态
│   │   ├── App.jsx          # React Router 页面路由
│   │   ├── main.jsx         # React 入口
│   │   └── index.css        # Tailwind/全局样式
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Express + MySQL 后端工程
│   ├── docs/
│   │   └── api.md           # 后端 API 文档
│   ├── src/
│   │   ├── data/            # MySQL seed 脚本
│   │   ├── db/              # MySQL 连接池
│   │   ├── middleware/      # Express 中间件
│   │   ├── models/          # MySQL 数据访问封装
│   │   ├── routes/          # API 路由
│   │   └── utils/           # JWT 等工具函数
│   ├── .env                 # 后端生产环境变量，不要回显
│   ├── package.json
│   └── server.js            # Express 入口
├── database/                # MySQL 说明、初始化和迁移脚本
│   ├── README.md
│   └── init.sql
├── docs/                    # 项目级架构、部署、运维说明
│   └── architecture.md
├── nginx/                   # Nginx 配置参考副本，不是生效路径
│   └── stress-relief.conf
├── scripts/                 # 运维脚本
└── backups/                 # 线上变更备份和归档文件
```

## 部署

- **服务器 IP**: 47.109.105.242
- **线上根目录**: `/var/www/html`
- **前端静态目录**: `/var/www/html/frontend/dist`
- **后端入口**: `/var/www/html/backend/server.js`
- **后端端口**: `5000`
- **API 反代**: `/api/ -> http://127.0.0.1:5000`
- **后端服务**: `stress-relief-backend.service`
- **数据库服务**: Docker 容器 `stress-relief-mysql`
- **数据库名称**: `stress_relief_planet`
- **Nginx 生效配置**:
  - `/etc/nginx/conf.d/stress-relief.conf`
  - `/etc/nginx/sites-enabled/default`
- **项目内 Nginx 参考配置**: `/var/www/html/nginx/`

## 常用命令

```bash
cd /var/www/html
find . -maxdepth 3 -path "*/node_modules" -prune -o -path "./backups" -prune -o -print | sort
systemctl is-active stress-relief-backend nginx
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
curl -fsS http://127.0.0.1/api/health
curl -fsSI http://127.0.0.1/
nginx -t
```

## 前端

```bash
cd /var/www/html/frontend
npm install
npm run build
```

构建产物输出到：

```text
/var/www/html/frontend/dist
```

## 后端

```bash
cd /var/www/html/backend
npm install
node -c server.js
systemctl restart stress-relief-backend
journalctl -u stress-relief-backend -n 100 --no-pager
```

API 文档：

```text
/var/www/html/backend/docs/api.md
```

## 数据库

```bash
docker start stress-relief-mysql
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
```

执行 seed、迁移、删除或批量更新数据前必须确认影响范围和回退方案。

## 注意事项

- 不要删除当前 React、Express 代码，除非用户明确要求。
- 后端代码尚未接入 MySQL 前，不要把接口行为判断为已使用 MySQL。
- 不要把 `nginx/` 目录里的参考配置当作线上生效配置。
- 不要把 `backups/` 或 `.local-sync-backups/` 内归档文件作为当前源码依据，除非是在做回退或历史比对。
- 不要回显 `.env`、JWT secret、数据库连接串密码、Token、私钥等敏感值。
- 修改前端后需要执行 `cd frontend && npm run build`，除非用户明确要求跳过。
- 修改后端 JS 后需要执行 `node -c backend/server.js` 或对改动文件做语法检查。
- 修改 Nginx 后必须执行 `nginx -t && systemctl reload nginx`。
- 修改 systemd 服务文件后必须执行 `systemctl daemon-reload`，再重启并检查服务状态。
- 修改目录结构、运行入口、端口、服务名、Nginx root、API 路由后，同步更新 `docs/architecture.md` 和相关 API 文档。
