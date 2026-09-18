# Backend API Specification

## Purpose

后端为解压星球提供 Express API、用户认证、活动目录和使用记录能力，并通过 MongoDB 持久化数据。API 通过 Nginx 的 `/api/` 前缀对前端提供服务。

## Requirements

### Requirement: Health endpoint
The backend SHALL expose a health endpoint that returns a successful JSON response when the process and database connection are available.

#### Scenario: Health check succeeds
- **WHEN** a client sends `GET /api/health`
- **THEN** the server returns JSON containing `status: "ok"` and a timestamp

### Requirement: User registration
The backend SHALL validate username, email, and password during registration and SHALL reject duplicate usernames or email addresses.

#### Scenario: Valid registration
- **WHEN** a client submits a username of at least 3 characters, a valid email, and a password of at least 6 characters
- **THEN** the server creates the user, hashes the password, and returns a token with the public user fields

### Requirement: User login
The backend SHALL authenticate users by username and password and SHALL return an authentication token only for valid credentials.

#### Scenario: Invalid credentials
- **WHEN** a client submits an unknown username or incorrect password
- **THEN** the server returns HTTP 401 without exposing whether the username or password was the specific cause

### Requirement: Activity catalog API
The backend SHALL expose the configured activity catalog through `GET /api/activities`.

#### Scenario: Activity catalog is requested
- **WHEN** a client sends `GET /api/activities`
- **THEN** the server returns activity records containing their type, name, description, and optional icon

### Requirement: Progress recording and statistics
The backend SHALL accept progress records and expose recent progress and per-activity aggregate counts.

#### Scenario: Progress is recorded
- **WHEN** a client submits `POST /api/progress` with an activity type and optional duration, score, and description
- **THEN** the server persists the progress record and returns HTTP 201 with the created record

### Requirement: Baseline API protection
The backend SHALL use Helmet, JSON parsing, CORS configuration, and process-wide rate limiting for API requests, while authentication enforcement for individual progress routes remains an explicit future hardening task.

#### Scenario: API request exceeds the rate limit
- **WHEN** a client exceeds the configured request limit in the rate window
- **THEN** the server returns the configured rate-limit error response
