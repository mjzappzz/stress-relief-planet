# 解压星球（Stress Relief Planet）

React + Express + MongoDB 解压活动网站，包含泡泡纸、迷宫、绘画、呼吸练习、钢琴、用户登录和使用统计。

本仓库以 2026-07-28 阿里云线上版本为基准。线上原始环境是 Ubuntu 22.04、Node.js 22、MongoDB、Nginx 和 systemd；仓库中的部署脚本同时支持 Rocky Linux。

## 架构

```text
Browser
  -> Nginx :80
      ├── /        -> frontend/dist (React SPA)
      └── /api/*   -> 127.0.0.1:5000 (Express)
                         -> 127.0.0.1:27017 (MongoDB)
```

生产目录固定为 `/var/www/html`，后端服务名为 `stress-relief-backend.service`。MongoDB 仅监听本机，不需要开放 27017。

## 支持系统

| 系统 | 架构 | 状态 |
|---|---|---|
| Ubuntu 22.04 LTS | x86_64 | 支持 |
| Ubuntu 24.04 LTS | x86_64 | 支持 |
| Rocky Linux 8 | x86_64 | 支持 |
| Rocky Linux 9 | x86_64 | 支持 |

安装脚本使用 MongoDB Community 8.0、Node.js 22、Nginx 和 systemd。Rocky 会同步处理 firewalld 与 SELinux。

## 一键部署

全新服务器执行：

```bash
git clone https://github.com/mjzappzz/stress-relief-planet.git
cd stress-relief-planet
sudo bash deploy/install.sh
```

脚本会自动识别 Ubuntu/Rocky、安装依赖、生成随机 JWT 密钥、构建前端、配置 systemd/Nginx，并执行 API 与首页健康检查。

部署完成后按需修改：

```bash
sudo vi /var/www/html/backend/.env
sudo systemctl restart stress-relief-backend
```

至少确认 `CORS_ORIGIN` 与实际域名一致。生产密钥只保存在服务器 `.env`，不得提交 GitHub。

## 更新、备份和恢复

```bash
git pull --ff-only
sudo bash deploy/update.sh

sudo bash deploy/backup.sh /var/backups/stress-relief/manual.archive.gz

sudo env CONFIRM_RESTORE=YES \
  bash deploy/restore.sh /var/backups/stress-relief/manual.archive.gz
```

更新前会自动备份应用和 MongoDB；失败时恢复旧应用文件。恢复数据库会覆盖同名集合，必须显式确认。

## 清理服务器

先拉取最新版仓库，在项目源码目录执行：

```bash
sudo env CONFIRM_UNINSTALL=YES bash deploy/uninstall.sh
```

默认行为：

- 创建最终 MongoDB 备份；
- 停止并删除应用 systemd 服务；
- 删除应用 Nginx 配置和 `/var/www/html`；
- 保留 MongoDB 软件及 `/var/lib/mongo` 数据。

确认该服务器不再使用 MongoDB 后才可清理数据：

```bash
sudo env CONFIRM_UNINSTALL=YES PURGE_MONGODB_DATA=YES \
  bash deploy/uninstall.sh
```

卸载脚本要求 `/var/www/html/.stress-relief-managed` 标记存在，避免误删非本项目目录。数据库备份保存在 `/var/backups/stress-relief/`。

## 本地开发

```bash
cp backend/.env.example backend/.env
# 将 JWT_SECRET 替换为至少 32 字符的随机值

npm ci --prefix backend
npm ci --prefix frontend
npm run dev --prefix backend
npm run dev --prefix frontend -- --host 127.0.0.1
```

默认地址：

- 前端：`http://127.0.0.1:5173`
- 后端：`http://127.0.0.1:5000`
- MongoDB：`mongodb://127.0.0.1:27017/stress-relief`

初始化活动和管理员账号：

```bash
SEED_ADMIN_PASSWORD='使用临时强密码' npm run seed --prefix backend
```

seed 会清空并重建活动和用户集合，禁止直接在生产执行。

## 验证

```bash
curl -fsS http://127.0.0.1:5000/api/health
curl -fsS http://127.0.0.1/
systemctl is-active mongod stress-relief-backend nginx
journalctl -u stress-relief-backend -n 100 --no-pager
```

GitHub Actions 会验证后端 JavaScript 语法、前端构建和所有 Shell 脚本语法。

当前后端 `npm audit` 为 0。前端保留与线上兼容的 React Router 6/Vite 5，审计仍报告需要跨主版本迁移的已知项；迁移到 React Router 8/Vite 8 前需补齐浏览器回归测试，不能用 `npm audit fix --force` 直接替换。

## 目录

```text
backend/        Express API、MongoDB 模型和 seed
frontend/       React/Vite 前端
deploy/         Ubuntu/Rocky 安装、更新、备份、恢复、卸载
docs/           架构、部署边界和运维手册
nginx/          线上历史参考配置
```

详细文档：

- [架构说明](docs/architecture.md)
- [部署说明](docs/deployment.md)
- [当前线上部署记录](docs/current-deployment.md)
- [运维手册](docs/runbook.md)
- [API 文档](backend/docs/api.md)

## 安全边界

- 仓库不包含 `.env`、JWT 密钥、密码、MongoDB 数据、`node_modules`、构建产物或服务器备份。
- 仅开放 HTTP/HTTPS；不要对公网开放 5000 或 27017。
- 当前部分业务 API 未强制鉴权，详见架构文档。
- 正式公网使用前应配置域名、TLS、MongoDB 认证和最小权限运维账号。
