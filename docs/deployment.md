# 部署流程

本文档记录生产发布步骤。生产路径默认为：

```text
/var/www/html
```

## 发布前检查

```bash
cd /var/www/html
systemctl is-active stress-relief-backend nginx
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
curl -fsS http://127.0.0.1/api/health
curl -fsSI http://127.0.0.1/
```

## 备份

生产写操作前创建备份目录：

```bash
mkdir -p /var/www/html/backups/<change-name>-$(date +%Y%m%d-%H%M%S)
```

至少备份本次要修改的文件。不要删除 `backups/`。

## 前端发布

影响范围：

```text
/var/www/html/frontend/src
/var/www/html/frontend/dist
Nginx 静态文件
```

命令：

```bash
cd /var/www/html/frontend
npm install
npm run build
nginx -t && systemctl reload nginx
```

验证：

```bash
curl -fsSI http://127.0.0.1/
curl -fsS http://127.0.0.1/api/health
```

回退：

```text
恢复备份的 frontend/dist 或重新构建上一版本
nginx -t && systemctl reload nginx
```

## 后端发布

影响范围：

```text
/var/www/html/backend
systemd stress-relief-backend.service
```

命令：

```bash
cd /var/www/html/backend
npm install
node -c server.js
systemctl restart stress-relief-backend
journalctl -u stress-relief-backend -n 50 --no-pager
```

验证：

```bash
systemctl is-active stress-relief-backend
curl -fsS http://127.0.0.1/api/health
```

回退：

```text
恢复备份的 backend 文件
node -c /var/www/html/backend/server.js
systemctl restart stress-relief-backend
curl -fsS http://127.0.0.1/api/health
```

## Nginx 配置发布

生效配置：

```text
/etc/nginx/conf.d/stress-relief.conf
/etc/nginx/sites-enabled/default
```

项目内 `nginx/` 仅为参考副本。

命令：

```bash
nginx -t
systemctl reload nginx
```

验证：

```bash
curl -fsSI http://127.0.0.1/
curl -fsS http://127.0.0.1/api/health
```

## 数据库变更

数据库变更包括：

```text
schema 初始化
迁移
seed
删除数据
批量更新
```

执行前必须：

```text
1. 明确目标库和影响表
2. 备份数据库
3. 准备回滚 SQL 或恢复方案
4. 在测试环境验证
```

当前数据库：

```text
Docker 容器：stress-relief-mysql
库名：stress_relief_planet
```

验证：

```bash
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
curl -fsS http://127.0.0.1/api/health
```

## 发布后统一验证

```bash
systemctl is-active stress-relief-backend nginx
docker ps --format '{{.Names}} {{.Status}} {{.Ports}}' | rg 'stress-relief-mysql'
curl -fsS http://127.0.0.1/api/health
curl -fsSI http://127.0.0.1/
```

预期：

```text
stress-relief-backend: active
nginx: active
stress-relief-mysql: Up/healthy
/api/health: JSON status=ok
/: HTTP 200
```
