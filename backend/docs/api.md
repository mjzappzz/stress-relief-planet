# API 文档

Base URL: `http://47.109.105.242/api`

## 健康检查

```http
GET /api/health
```

## 用户

```http
POST /api/users/register
POST /api/users/login
```

## 活动

```http
GET /api/activities
```

## 使用记录

```http
GET /api/progress
POST /api/progress
GET /api/progress/stats
```

认证 Header 预留：

```http
Authorization: Bearer <token>
```
