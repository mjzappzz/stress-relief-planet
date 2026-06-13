# 运行手册

本文档用于生产故障快速定位。不要在输出中回显 `.env`、密码、JWT secret、Token、私钥。

## 总体健康检查

```bash
systemctl is-active stress-relief-backend nginx
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
curl -fsS http://127.0.0.1/api/health
curl -fsSI http://127.0.0.1/
```

## 前端页面打不开

检查：

```bash
curl -fsSI http://127.0.0.1/
nginx -t
systemctl status nginx --no-pager
ls -lah /var/www/html/frontend/dist
```

常见处理：

```bash
cd /var/www/html/frontend
npm run build
nginx -t && systemctl reload nginx
```

## API 502 或健康检查失败

检查：

```bash
systemctl status stress-relief-backend --no-pager
journalctl -u stress-relief-backend -n 100 --no-pager
curl -fsS http://127.0.0.1:5000/api/health
```

常见处理：

```bash
cd /var/www/html/backend
node -c server.js
systemctl restart stress-relief-backend
journalctl -u stress-relief-backend -n 50 --no-pager
```

## 后端无法连接 MySQL

检查：

```bash
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
docker logs --tail 100 stress-relief-mysql
```

如果容器未运行：

```bash
docker start stress-relief-mysql
```

再验证：

```bash
curl -fsS http://127.0.0.1:5000/api/health
```

## Nginx 配置错误

检查：

```bash
nginx -t
journalctl -u nginx -n 100 --no-pager
```

处理：

```text
1. 根据 nginx -t 输出定位文件和行号
2. 恢复备份或修正配置
3. nginx -t
4. systemctl reload nginx
```

## 端口占用

开发环境检查：

```bash
lsof -iTCP:5173 -sTCP:LISTEN -Pn
lsof -iTCP:5000 -sTCP:LISTEN -Pn
```

前端固定端口启动：

```bash
cd /home/tjzs/projects/stress-relief-planet/frontend
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

后端开发启动：

```bash
cd /home/tjzs/projects/stress-relief-planet/backend
npm run dev
```

## 用户登录/注册异常

检查：

```bash
journalctl -u stress-relief-backend -n 100 --no-pager
curl -fsS http://127.0.0.1/api/health
```

确认项：

```text
1. 后端服务 active
2. MySQL 容器 Up/healthy
3. users 表存在
4. JWT_SECRET 已配置，但不要回显具体值
```

## 记录/统计异常

相关接口：

```text
GET  /api/progress
POST /api/progress
GET  /api/progress/stats
```

当前记录表：

```text
progress
```

注意：当前记录未按用户隔离，是全局数据。

## 回退流程

```text
1. 停止继续发布
2. 恢复本次变更备份
3. 前端：npm run build && nginx -t && systemctl reload nginx
4. 后端：node -c server.js && systemctl restart stress-relief-backend
5. Nginx：nginx -t && systemctl reload nginx
6. 执行总体健康检查
```
