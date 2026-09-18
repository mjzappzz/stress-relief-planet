# Deployment and Operations Specification

## Purpose

解压星球采用 Nginx 静态托管前端、Node.js/Express 提供 API、MongoDB 保存业务数据的原生部署方式，并保留可验证、可回滚的运维边界。

## Requirements

### Requirement: Production request routing
The production Nginx configuration SHALL serve the frontend SPA from `/var/www/aliyun-front` and proxy `/api/` to `127.0.0.1:5000`.

#### Scenario: SPA route is requested in production
- **WHEN** a visitor requests a non-file frontend route such as `/whisper`
- **THEN** Nginx serves the frontend `index.html` fallback and the client router renders the page

### Requirement: HTTPS entrypoint
The current production IP entrypoint SHALL serve HTTPS on `47.109.105.242:443` with a publicly trusted Let’s Encrypt IP certificate.

#### Scenario: Visitor opens the HTTP entrypoint
- **WHEN** a visitor requests `http://47.109.105.242/`
- **THEN** Nginx returns a redirect to `https://47.109.105.242/`

### Requirement: Automatic certificate renewal
The server SHALL use Certbot's scheduled renewal and reload Nginx after a successful certificate deployment.

#### Scenario: Certificate renewal succeeds
- **WHEN** Certbot renews the IP certificate
- **THEN** the deploy hook reloads Nginx so the running process uses the renewed certificate

### Requirement: Configuration validation before reload
Nginx configuration changes SHALL pass `nginx -t` before the service is reloaded.

#### Scenario: Invalid configuration is proposed
- **WHEN** `nginx -t` reports a configuration error
- **THEN** the existing running configuration remains in place and reload is not treated as successful

### Requirement: Production secrets boundary
Production environment files, private keys, database data, dependency directories, and build artifacts SHALL remain outside the Git repository.

#### Scenario: Repository is prepared for a commit
- **WHEN** a production change is staged
- **THEN** `.env` files, certificate private keys, tokens, and database data are not included in the commit
