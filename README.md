# 解压星球

解压星球是一个前后端分离 Web 应用，提供泡泡纸、迷宫、绘画、呼吸、钢琴等轻量解压活动，并记录使用进度。

## 本地启动

一键启动本地开发环境：

```bash
./scripts/local-dev.sh
```

固定端口：

```text
前端：http://127.0.0.1:5173
后端：http://127.0.0.1:5000
```

停止本地开发环境：

```bash
./scripts/local-stop.sh
```

默认会同时停止 `stress-relief-mysql` 容器。如需只停前后端、保留数据库：

```bash
STOP_MYSQL=0 ./scripts/local-stop.sh
```

手动启动：

后端：

```bash
cd backend
npm install
npm run dev
```

前端：

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

默认端口：

```text
前端：http://127.0.0.1:5173
后端：http://127.0.0.1:5000
MySQL：127.0.0.1:3306
```

## 常用命令

```bash
# 前端构建
cd frontend && npm run build

# 后端语法检查
cd backend && node -c server.js

# 后端健康检查
curl -fsS http://127.0.0.1:5000/api/health

# 前端代理健康检查
curl -fsS http://127.0.0.1:5173/api/health
```

## 架构概览

```text
Browser
  -> Vite dev server / Nginx
      -> React frontend
      -> /api/* proxy
          -> Express backend
              -> mysql2/promise
                  -> Docker MySQL
```

生产环境入口：

```text
Nginx :80
  root /var/www/html/frontend/dist
  /api/ -> http://127.0.0.1:5000
```

## 目录

```text
frontend/       React + Vite 前端
backend/        Express 后端
database/       MySQL 初始化与数据说明
docs/           架构、部署、运行手册、ADR
nginx/          Nginx 参考配置
scripts/        运维脚本
```

## 文档

- [架构与部署说明](docs/architecture.md)
- [部署流程](docs/deployment.md)
- [运行手册](docs/runbook.md)
- [API 文档](backend/docs/api.md)
- [架构决策记录](docs/decisions/)

## 数据库

当前数据库服务为 Docker MySQL 8。

```text
容器：stress-relief-mysql
镜像：mysql:8
宿主端口：3306
默认库名：stress_relief_planet
初始化脚本：database/init.sql
```

检查命令：

```bash
docker start stress-relief-mysql
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
```

后端通过 `mysql2/promise` 连接 MySQL：

```text
backend/src/db/mysql.js
```

当前表：

```text
users             用户表
activities        活动配置表
progress          当前实际使用的全局活动记录表
activity_records  保留表，包含 user_id，当前代码未接入
```

注意：

```text
1. 当前 progress 不包含 user_id，所以记录是全局数据，不按用户隔离。
2. activity_records 更适合后续用户级记录，但当前未接入。
3. 切换记录表前需要设计迁移策略，不要直接删除 progress。
4. 生产执行 schema 初始化、迁移、清表或 seed 前必须备份。
```

迁移脚本建议放在：

```text
database/migrations/YYYYmmdd-HHMMSS-<change-name>.sql
```

## 环境变量

模板：

```text
backend/.env.example
frontend/.env.example
```

不要提交或回显真实 `.env`、JWT secret、数据库密码、Token、私钥。
