# Product Experience Specification

## Purpose

解压星球为压力、疲惫或需要短暂独处的用户提供低门槛的浏览器解压活动。产品优先营造安静、柔和、可随时退出的体验，不把用户的放松过程变成必须完成的任务。

## Requirements

### Requirement: Low-pressure entry
The product SHALL let a visitor reach a relaxation activity from the home page without requiring an account first.

#### Scenario: Anonymous visitor starts exploring
- **WHEN** an anonymous visitor opens the home page
- **THEN** the visitor can see activity entry points and open an activity without logging in

### Requirement: Activity navigation
The product SHALL expose the available relaxation activities through a consistent navigation shell while keeping the active activity as the visual focus.

#### Scenario: Visitor moves between activities
- **WHEN** a visitor selects another activity from the navigation
- **THEN** the application changes to the corresponding client-side route without a full document reload

### Requirement: Calm interaction language
Interactive states SHALL use restrained motion, clear focus states, and non-judgmental copy that does not score or shame the visitor during relaxation.

#### Scenario: Visitor uses keyboard navigation
- **WHEN** a visitor navigates controls with a keyboard
- **THEN** the focused control has a visible focus indicator and remains operable

### Requirement: Reduced-motion respect
The product SHALL respect the user's `prefers-reduced-motion` preference for animated relaxation surfaces.

#### Scenario: Reduced motion is enabled
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** decorative and transition animations are reduced or disabled without blocking the activity

### Requirement: User-controlled exit
Every activity SHALL let the visitor leave or return to the main navigation without requiring completion.

#### Scenario: Visitor wants to stop early
- **WHEN** a visitor decides not to continue an activity
- **THEN** the visitor can navigate away without an error or forced completion flow
