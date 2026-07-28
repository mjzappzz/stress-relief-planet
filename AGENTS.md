# AGENTS.md

## 项目身份

项目名称：解压星球。

这是一个已部署在阿里云上的前后端分离 Web 应用。用户是专业运维工程师，默认具备 Linux、Nginx、Node.js、MongoDB、systemd、前端构建和生产排障能力。回答要简洁、直接、工程化，优先给命令、文件路径、验证方法和风险点。

## 当前架构事实

- 项目根目录：`/var/www/html`
- 前端：React 18 + Vite 5 + React Router + Zustand + Tailwind CSS
- 后端：Node.js + Express + Mongoose
- 数据库：MongoDB，库名 `stress-relief`
- Web 入口：Nginx 80 端口
- 后端服务：systemd `stress-relief-backend.service`
- Nginx 静态根目录：`/var/www/html/frontend/dist`
- API 反代：`/api/ -> http://127.0.0.1:5000`
- 后端入口：`/var/www/html/backend/server.js`
- 后端环境变量：`/var/www/html/backend/.env`

## 标准目录

```text
/var/www/html/
├── AGENTS.md
├── frontend/        # React + Vite 前端工程，dist 为线上静态目录
├── backend/         # Express 后端工程，docs/api.md 为 API 文档
├── database/        # 数据库说明、初始化和迁移脚本
├── docs/            # 项目级文档：架构、部署、运维约定
├── nginx/           # Nginx 配置参考副本，不是生效路径
├── scripts/         # 运维脚本
└── backups/         # 变更备份和归档文件
```

## 工作规则

- 不要臆测生产状态；涉及服务、端口、进程、配置时先用命令确认。
- 简单只读任务可以直接执行。
- 涉及写文件、移动文件、改配置、重启服务、安装依赖、删除数据、数据库变更时，先说明计划、影响、回退和验证方式；用户明确确认后再执行。
- 用户说“直接处理/直接改/执行”时，可执行低风险变更；涉及生产中断、数据风险、权限安全或不可逆操作时仍需再次确认。
- 不要回显 `.env`、JWT secret、数据库连接串密码、Token、私钥等敏感值。
- 不要删除 `backups/`，除非用户明确要求。
- 不要把 `nginx/` 目录内的参考配置当作生效配置；生效配置在 `/etc/nginx/`。
- 不要把 `backups/` 内归档文件作为当前源码依据，除非是在做回退或历史比对。

## 修改边界

- 前端源码只改 `frontend/src/`、`frontend/package.json`、`frontend/vite.config.js` 等前端相关文件。
- 后端源码只改 `backend/server.js`、`backend/src/`、`backend/package.json`、`backend/docs/` 等后端相关文件。
- API 文档放在 `backend/docs/api.md`，不要放在项目级 `docs/`。
- 项目级架构和部署说明放在 `docs/architecture.md`。
- 数据库说明、seed、迁移脚本放在 `database/`。
- 运维脚本放在 `scripts/`。

## 常用检查命令

```bash
cd /var/www/html
find . -maxdepth 3 -path "*/node_modules" -prune -o -path "./backups" -prune -o -print | sort
systemctl is-active stress-relief-backend nginx mongod
curl -fsS http://127.0.0.1/api/health
curl -fsSI http://127.0.0.1/
nginx -t
```

## 前端命令

```bash
cd /var/www/html/frontend
npm install
npm run build
```

前端构建产物输出到：

```text
/var/www/html/frontend/dist
```

构建完成后通常只需：

```bash
nginx -t && systemctl reload nginx
```

## 后端命令

```bash
cd /var/www/html/backend
npm install
node -c server.js
systemctl restart stress-relief-backend
journalctl -u stress-relief-backend -n 100 --no-pager
```

## 数据库命令

```bash
systemctl status mongod --no-pager
cd /var/www/html/backend && npm run seed
```

执行 seed、迁移、删除或批量更新数据前必须说明影响范围和回退方案，并等待确认。

## Nginx 规则

生效配置：

```text
/etc/nginx/conf.d/stress-relief.conf
/etc/nginx/sites-enabled/default
```

配置参考副本：

```text
/var/www/html/nginx/
```

改 Nginx 后必须执行：

```bash
nginx -t && systemctl reload nginx
```

## systemd 规则

后端服务：

```text
stress-relief-backend.service
```

服务文件：

```text
/etc/systemd/system/stress-relief-backend.service
```

改服务文件后必须执行：

```bash
systemctl daemon-reload
systemctl restart stress-relief-backend
systemctl status stress-relief-backend --no-pager
```

## 文档规则

- 架构、部署、运维约定统一维护在 `docs/architecture.md`。
- 后端接口文档维护在 `backend/docs/api.md`。
- 修改目录结构、运行入口、端口、服务名、Nginx root、API 路由后，必须同步更新相关文档。
- 文档只能描述已验证事实；未验证内容标记为“未验证”。

## 验证标准

任何生产相关变更后，至少验证：

```bash
systemctl is-active stress-relief-backend nginx mongod
curl -fsS http://127.0.0.1/api/health
curl -fsSI http://127.0.0.1/
```

涉及 Nginx：必须 `nginx -t`。

涉及后端 JS：必须 `node -c backend/server.js` 或对改动文件做语法检查。

涉及前端：必须 `cd frontend && npm run build`，除非用户明确要求跳过。

## 回退规则

生产写操作前创建备份：

```text
/var/www/html/backups/<change-name>-YYYYmmdd-HHMMSS
```

至少备份本次要改的文件。回退后重新执行对应服务验证。
