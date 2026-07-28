# 架构说明

## 基准版本

本仓库源码来自 2026-07-28 阿里云 `/var/www/html` 的有效线上文件。未同步 `.env`、依赖目录、构建产物、业务数据和历史备份。

## 组件

| 层 | 实现 | 运行位置 |
|---|---|---|
| Web | Nginx | `:80` |
| 前端 | React 18、Vite 5、Tailwind | `/var/www/html/frontend/dist` |
| API | Node.js 22、Express 4 | `127.0.0.1:5000` |
| 数据库 | MongoDB Community | `127.0.0.1:27017` |
| 进程管理 | systemd | `stress-relief-backend.service` |

## 请求链路

Nginx 直接返回静态资源，对 SPA 路由回退到 `index.html`，并把 `/api/` 反向代理到 Express。Express 通过 Mongoose 访问本机 MongoDB 的 `stress-relief` 数据库。

## 数据模型

- `User`：用户名、邮箱、bcrypt 密码哈希、创建时间。
- `Activity`：活动类型、名称、描述、图标。
- `Progress`：活动类型、持续时间、得分、描述、创建时间。

JWT 工具和认证中间件已经存在，但当前部分业务路由未强制鉴权。此状态是阿里云基准版本的兼容行为，不代表完善的多用户数据隔离。

## 安全边界

- 后端 systemd 服务使用独立 `stress-relief` 系统账号。
- MongoDB 和 Express 只监听本机链路，不在防火墙开放。
- `JWT_SECRET` 必须至少 32 字符，由安装器随机生成。
- Rocky Linux 保持 SELinux enforcing，通过持久化文件上下文和 `httpd_can_network_connect` 放行 Nginx 反代。
- 生产公网入口应增加 TLS；仓库默认只配置 HTTP，避免假设用户域名和证书来源。

## 部署决策

采用原生包、systemd 和 Nginx，而不是容器化，原因是线上基准本身采用该模型，迁移时能保持最小行为差异。安装器仅支持经过明确验证路径设计的 Ubuntu 22.04/24.04 与 Rocky Linux 8/9 x86_64，其他系统会立即退出。
