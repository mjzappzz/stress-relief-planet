# 部署说明

## 安装器行为

`deploy/install.sh` 按 `/etc/os-release` 自动选择：

- Ubuntu：APT、NodeSource DEB、MongoDB APT、`sites-available`；
- Rocky：DNF、NodeSource RPM、MongoDB RPM、`conf.d`、firewalld、SELinux。

共同流程：

1. 检查 root、系统版本、x86_64 和至少 2 GiB 可用空间；
2. 安装 Node.js 22、MongoDB 8.0、Nginx、rsync；
3. 创建 `stress-relief` 系统用户；
4. 同步源码到 `/var/www/html`，保留现有 `.env`；
5. 首次部署生成随机 JWT 密钥；
6. `npm ci`、构建前端；
7. 写入 systemd 和 Nginx 配置；
8. 启动服务并验证 API 和首页。

## 配置

生产配置位于 `/var/www/html/backend/.env`。模板是 `backend/.env.example`：

```dotenv
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/stress-relief
JWT_SECRET=replace-with-at-least-32-random-characters
CORS_ORIGIN=http://127.0.0.1
RATE_LIMIT_MAX=1000
```

不要把生产 `.env` 复制回仓库。

## 更新和回滚

`deploy/update.sh` 在 `/var/backups/stress-relief/pre-update-时间戳/` 保存应用文件和 MongoDB 归档，再安装依赖、构建和重启。任一步失败会恢复旧应用文件。数据库升级或 schema 变更不应隐含在普通更新中，需独立制定迁移与回滚。

## 执行边界

- 安装脚本会安装系统软件、写入 Nginx/systemd、调整 Rocky firewalld/SELinux。
- 默认占用 80、5000、27017；仅 80 对外开放。
- 不自动配置域名、DNS、TLS、云安全组或 MongoDB公网访问。
- 已存在的非本项目 `/var/www/html` 不应直接部署；先人工迁移或修改部署设计。
- 卸载和恢复属于破坏性操作，必须通过显式环境变量确认。

## 受限网络和离线环境

当前脚本需要访问 GitHub、NodeSource、MongoDB 官方仓库及发行版软件源。离线环境应先建立内部镜像源，并把安装脚本中的仓库地址替换为组织镜像；不要通过关闭 GPG 校验绕过源验证。
