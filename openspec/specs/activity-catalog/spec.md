# Activity Catalog Specification

## Purpose

解压星球将多个轻量互动活动组织成可直接访问的 React 客户端路由。每个活动可以独立使用，同时共享导航、页脚和基础视觉框架。

## Requirements

### Requirement: Stable activity routes
The frontend SHALL provide client-side routes for bubble wrap, maze, coloring, breathing, piano, profile, statistics, authentication, and whisper activities.

#### Scenario: Activity route is opened directly
- **WHEN** a visitor opens `/bubble`, `/maze`, `/coloring`, `/breathing`, `/piano`, or `/whisper`
- **THEN** the corresponding activity page renders through the SPA route configuration

### Requirement: Shared application shell
The frontend SHALL render the shared navigation and footer around routed pages.

#### Scenario: Route changes inside the application
- **WHEN** the visitor changes from one activity route to another
- **THEN** the shared shell remains available while the routed page content changes

### Requirement: Mobile activity access
Activity pages SHALL remain usable on narrow viewports and provide access to the navigation through the responsive menu.

#### Scenario: Visitor uses a phone-sized viewport
- **WHEN** the viewport is narrower than the desktop layout breakpoint
- **THEN** the page remains readable and the navigation can still be opened and used

### Requirement: Client-side session state
The frontend SHALL keep transient user and activity state in the client store and SHALL persist only the authentication token through browser storage.

#### Scenario: Visitor reloads without a token
- **WHEN** the page reloads and no authentication token exists in browser storage
- **THEN** the application starts without an authenticated user
