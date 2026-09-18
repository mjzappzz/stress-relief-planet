# 当前部署记录

更新时间：2026-09-18（Asia/Shanghai）

本文记录当前已经验证过的线上部署事实。它描述的是现网状态，不替代 `docs/deployment.md` 中的全新服务器安装流程。

## 本地目录与仓库

- Git 仓库：`stress-relief-planet`
- 远端：`git@github.com:mjzappzz/stress-relief-planet.git`
- 当前本地工作区外层目录：`/home/tjzs/projects/aliyun-front`
- 当前仓库目录：`/home/tjzs/projects/aliyun-front/stress-relief-planet`
- 外层目录名目前仍是 `aliyun-front`，没有改名为 `stress-relief-planet`。

## 阿里云线上环境

- 服务器 IP：`47.109.105.242`
- Web 服务器：Nginx
- 当前前端静态根目录：`/var/www/aliyun-front`
- HTTP：80 端口
- HTTPS：443 端口
- `/api/`：反向代理到 `http://127.0.0.1:5000`
- SPA 路由：由 Nginx fallback 到 `/index.html`

当前线上入口：

```text
https://47.109.105.242/
https://47.109.105.242/whisper
```

## HTTPS 证书

使用 Let’s Encrypt 免费 IP 证书：

- 证书目录：`/etc/letsencrypt/live/47.109.105.242/`
- 证书文件：`fullchain.pem`
- 私钥文件：`privkey.pem`
- 证书 SAN：`IP Address:47.109.105.242`
- 当前证书到期时间：2026-09-25 00:42:09 UTC
- Certbot：Snap `5.8.0`
- 续期定时器：`snap.certbot.renew.timer`
- 续期后钩子：`/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh`

IP 证书是短周期证书，必须依赖自动续期。该证书只覆盖 IP，不覆盖 `www.mjzwork.com`。

## 已验证状态

```text
HTTP 80  -> 301 https://47.109.105.242/
HTTPS 443 -> 200 OK
证书 SAN  -> IP Address:47.109.105.242
Nginx     -> active
Nginx     -> 80/443 正在监听
UFW       -> inactive
```

验证命令：

```bash
curl -fsSI http://47.109.105.242/
curl -fsSI https://47.109.105.242/
echo | openssl s_client -connect 47.109.105.242:443 \
  -servername 47.109.105.242 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

## 备份与回滚

启用 IP HTTPS 配置前，原 Nginx 配置已备份到：

```text
/var/backups/aliyun-front/ip-https-20260918-174141/
```

若需要回退 Nginx 配置，恢复该目录中的 `stress-relief.conf` 后执行：

```bash
nginx -t && systemctl reload nginx
```

不要删除 Let’s Encrypt 目录或续期钩子，除非已经确认不再使用 HTTPS。
