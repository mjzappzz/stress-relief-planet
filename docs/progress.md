# 维护记录

## 2026-07-28

- 以阿里云 `/var/www/html` 当前 MongoDB 线上版本替换 GitHub 中的 MySQL 版本。
- 同步前后端有效源码；排除环境变量、依赖、构建产物、数据库数据和历史备份。
- 新增 Ubuntu 22.04/24.04、Rocky Linux 8/9 x86_64 一键部署。
- 新增更新、MongoDB 备份恢复和带最终备份的卸载脚本。
- 新增 systemd、Nginx、Rocky firewalld/SELinux 配置逻辑。
- 移除 seed 固定管理员密码，要求显式设置 `SEED_ADMIN_PASSWORD`。
- 强制 JWT 密钥至少 32 字符。
- 使用非跨主版本的依赖安全更新；后端审计为 0，前端仍有 React Router 及 Vite 跨主版本升级项，未在归档提交中冒险迁移。
- 重写 README、架构、部署及运维文档，并新增 GitHub Actions 验证。

## 2026-09-18

- 将前端与悄悄话树洞页面部署到阿里云 `/var/www/aliyun-front`。
- Nginx 保留 `/api/ -> 127.0.0.1:5000` 反向代理，并启用 SPA 路由 fallback。
- 为 `47.109.105.242` 配置 Let’s Encrypt 免费 IP 证书和 443 HTTPS。
- 配置 Certbot 自动续期及续期后的 Nginx reload 钩子。
- HTTP 自动跳转 HTTPS；公网验证 HTTP 301、HTTPS 200、证书 IP SAN 均通过。
- 记录当前本地外层目录仍为 `aliyun-front`，Git 仓库位于其下的 `stress-relief-planet` 子目录。
