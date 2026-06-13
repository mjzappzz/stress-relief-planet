# API 文档

Base URL：

```text
本地开发：http://127.0.0.1:5000/api
生产环境：http://47.109.105.242/api
```

统一响应格式：

```text
成功：返回 JSON 对象或数组
失败：{ "error": "<message>" }
校验失败：{ "errors": [ ...express-validator errors ] }
```

认证 Header 预留：

```http
Authorization: Bearer <token>
```

当前代码已生成 JWT，但 `activities` 和 `progress` 接口未强制认证；记录数据当前为全局记录，不按用户隔离。

## 健康检查

```http
GET /api/health
```

响应：

```json
{
  "status": "ok",
  "timestamp": "2026-06-13T01:46:25.704Z"
}
```

## 用户注册

```http
POST /api/users/register
Content-Type: application/json
```

请求体：

```json
{
  "username": "demo",
  "email": "demo@example.com",
  "password": "123456"
}
```

校验：

```text
username: 最少 3 位
email: 必须为邮箱格式
password: 最少 6 位
```

成功响应 `201`：

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "username": "demo",
    "email": "demo@example.com"
  }
}
```

常见错误：

```text
400 User already exists
400 Username already exists
400 { errors: [...] }
500 Server error
```

## 用户登录

```http
POST /api/users/login
Content-Type: application/json
```

请求体：

```json
{
  "username": "demo",
  "password": "123456"
}
```

成功响应 `200`：

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "username": "demo",
    "email": "demo@example.com"
  }
}
```

常见错误：

```text
400 { errors: [...] }
401 用户名或密码错误
500 Server error
```

## 活动列表

```http
GET /api/activities
```

响应：

```json
[
  {
    "type": "bubble",
    "name": "泡泡纸",
    "description": "戳破泡泡，释放压力",
    "icon": "bubble"
  }
]
```

数据来源：`activities` 表中 `is_enabled = 1` 的记录。

## 新增使用记录

```http
POST /api/progress
Content-Type: application/json
```

请求体：

```json
{
  "activityType": "breathing",
  "duration": 60,
  "score": 3,
  "description": "完成 3 轮呼吸练习"
}
```

字段说明：

```text
activityType: 活动类型，例如 bubble/maze/coloring/breathing/piano
duration: 秒
score: 可选，活动分数或轮数
description: 可选，记录描述
```

成功响应 `201`：

```json
{
  "id": 1,
  "activityType": "breathing",
  "duration": 60,
  "score": 3,
  "description": "完成 3 轮呼吸练习",
  "createdAt": "2026-06-13T01:46:25.704Z"
}
```

## 最近使用记录

```http
GET /api/progress
```

响应：

```json
[
  {
    "id": 1,
    "activityType": "maze",
    "duration": 42,
    "score": 1,
    "description": "完成第 1 关迷宫",
    "createdAt": "2026-06-13T01:46:25.704Z"
  }
]
```

当前固定返回最近 100 条全局记录。

## 活动统计

```http
GET /api/progress/stats
```

响应：

```json
{
  "stats": [
    {
      "type": "bubble",
      "name": "泡泡纸",
      "count": 3
    }
  ]
}
```

统计逻辑：从 `activities` 左连接 `progress`，按活动类型聚合记录数量。
