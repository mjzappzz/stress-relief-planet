# ADR-002: 当前进度记录为全局数据，认证隔离暂未强制接入

## Status

Accepted

## Date

2026-06-13

## Context

后端已经具备 JWT 工具和认证中间件：

```text
backend/src/utils/auth.js
backend/src/middleware/authMiddleware.js
```

用户接口会在注册/登录后返回 token。

但当前 `progress` 相关接口未强制接入认证：

```text
GET  /api/progress
POST /api/progress
GET  /api/progress/stats
```

当前实际记录表为 `progress`：

```text
id
activity_type
duration
score
description
created_at
```

该表没有 `user_id`，所以所有记录是全局数据。

数据库中还存在保留表 `activity_records`，该表包含 `user_id` 外键，但当前代码未接入。

## Decision

记录当前状态为明确边界：

```text
当前版本：progress 为全局活动记录，不按用户隔离。
当前版本：progress API 不强制认证。
后续版本：如需要用户私有记录，应迁移到 user_id 维度的数据模型。
```

## Alternatives Considered

### 立即给 progress 表增加 user_id

优点：

- 数据边界更正确
- 可实现用户私有记录和个人统计

缺点：

- 需要迁移历史全局数据
- 前端所有记录提交都要携带 token
- API 兼容性会改变

结论：暂不直接改生产数据模型，先记录边界并规划迁移。

### 直接切换到 activity_records

优点：

- 表结构已经有 `user_id`
- 更适合长期模型

缺点：

- 当前代码未接入该表
- 需要迁移 `progress` 数据或接受历史记录丢失
- API 和前端统计逻辑要同步调整

结论：作为后续迁移方向，不在当前版本直接切换。

### 保持全局 progress

优点：

- 当前实现简单
- 不影响现有页面和数据

缺点：

- 登录用户看到的不是私有记录
- 无法做用户级统计、删除、隐私隔离

结论：当前版本接受该边界，但必须在 API 和数据库文档中明确说明。

## Consequences

- 前端“我的记录”当前实际展示全局记录。
- 后续如要上线用户级记录，需要设计迁移：
  - 为历史全局记录归属设计策略
  - 接入 `protectRoute`
  - 修改 `Progress` 模型查询条件
  - 更新 API 文档和前端状态处理
- 在完成迁移前，不应在产品文案中承诺“用户私有记录”。
