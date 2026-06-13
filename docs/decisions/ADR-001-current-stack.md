# ADR-001: 采用 React Vite Express MySQL 架构

## Status

Accepted

## Date

2026-06-13

## Context

解压星球是一个已部署的前后端分离 Web 应用，需要支持：

- 浏览器端轻量互动页面
- 登录注册
- 活动列表和使用记录
- Nginx 静态文件服务和 API 反代
- Docker MySQL 数据持久化
- systemd 管理后端进程

当前线上事实：

```text
前端：React 18 + Vite 5 + React Router + Zustand + Tailwind CSS
后端：Node.js + Express + mysql2
数据库：Docker MySQL 8
网关：Nginx 80
进程：systemd stress-relief-backend.service
```

## Decision

继续采用当前架构作为项目基线：

```text
Browser
  -> Nginx
      -> frontend/dist
      -> /api/* -> Express backend :5000
          -> mysql2/promise
              -> Docker MySQL stress_relief_planet
```

## Alternatives Considered

### 单体 Node 服务同时渲染前端和 API

优点：

- 部署入口更少
- 本地启动更简单

缺点：

- 需要重构现有 Vite/Nginx 静态部署
- 前端资源缓存策略不如 Nginx 直接服务清晰

结论：不采用。当前项目已经稳定使用前后端分离部署。

### 将数据库切回宿主机 MySQL

优点：

- 少一层 Docker 网络/卷管理

缺点：

- 与当前 Docker MySQL 运行事实不一致
- 迁移和备份风险更高

结论：不采用。继续以 `stress-relief-mysql` 容器为数据库基线。

### 引入 ORM

优点：

- 模型更规范
- 迁移能力更完整

缺点：

- 当前代码规模小，引入成本高
- 需要重写数据访问层和迁移流程

结论：暂不引入。保持 `mysql2/promise`，后续如数据模型增长再评估。

## Consequences

- 前端发布主要影响 `frontend/dist`，通常不需要重启后端。
- 后端发布需要 `node -c server.js` 和重启 `stress-relief-backend.service`。
- Nginx 配置必须区分项目内参考副本和 `/etc/nginx/` 生效配置。
- 数据库变更需要额外迁移约定，因为当前没有迁移框架。
- 文档必须持续维护架构事实，避免线上路径和本地路径混淆。
