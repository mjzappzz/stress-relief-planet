# 运维手册

## 状态与日志

```bash
systemctl is-active mongod stress-relief-backend nginx
systemctl status stress-relief-backend --no-pager
journalctl -u stress-relief-backend -n 100 --no-pager
nginx -t
curl -fsS http://127.0.0.1:5000/api/health
curl -fsS http://127.0.0.1/
```

## 常用操作

```bash
systemctl restart stress-relief-backend
nginx -t && systemctl reload nginx
bash deploy/backup.sh /var/backups/stress-relief/manual.archive.gz
```

## 故障定位

| 现象 | 首要检查 |
|---|---|
| 502 | `systemctl status stress-relief-backend`、5000 监听、后端日志 |
| API 启动失败 | MongoDB 状态、`.env`、JWT_SECRET 长度 |
| 首页 404 | `frontend/dist/index.html`、Nginx root、`nginx -t` |
| Rocky 403 | `restorecon -RF /var/www/html/frontend/dist`、SELinux audit |
| 登录后异常 | 浏览器网络请求、CORS_ORIGIN、JWT 配置 |

## 数据保护

MongoDB 数据不进入 Git。清机前必须：

1. 执行 `deploy/backup.sh`；
2. 确认归档文件非空并复制到服务器外；
3. 在独立测试 MongoDB 上执行一次恢复验证；
4. 再运行卸载或清机流程。

`PURGE_MONGODB_DATA=YES` 会删除 `/var/lib/mongo` 和 `/var/log/mongodb`，不可通过 Git 恢复。
