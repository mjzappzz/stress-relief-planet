# Whisper Treehole Specification

## Purpose

悄悄话树洞是解压星球的安静表达空间：用户可以把一句心事、愿望或未说出口的话暂时留在页面里，并通过彩色光线和星点的缓慢响应获得一个轻柔的结束动作。

## Requirements

### Requirement: Private transient writing
The whisper activity SHALL accept a visitor's text locally for the current page session and SHALL clearly state that the text is not uploaded or retained after refresh or close.

#### Scenario: Visitor writes a whisper
- **WHEN** the visitor enters text in the whisper textarea
- **THEN** the text is kept in the current page state, the character count is shown, and the privacy notice remains visible

### Requirement: Guided release flow
The activity SHALL provide an explicit release flow with writing, releasing, and completion states.

#### Scenario: Visitor releases a non-empty whisper
- **WHEN** the visitor submits non-whitespace text
- **THEN** the activity enters a releasing state, triggers the visual pulse, and then shows a quiet completion message

### Requirement: Invalid release prevention
The release action SHALL remain unavailable for empty or whitespace-only text and SHALL prevent duplicate releases while a release is in progress.

#### Scenario: Visitor submits an empty whisper
- **WHEN** the textarea contains no non-whitespace characters
- **THEN** the release action is disabled and no release animation starts

### Requirement: Responsive field layouts
The visual field SHALL support arc and stars layouts and interpolate between them without replacing the writing experience.

#### Scenario: Visitor switches field layout
- **WHEN** the visitor selects `弧形` or `满天星`
- **THEN** the canvas field transitions to the selected distribution and the selected control exposes its pressed state

### Requirement: Pointer-responsive field
The field SHALL smoothly orient its line elements toward the pointer on pointer-capable devices and settle when the pointer leaves or the activity enters a quiet writing/releasing state.

#### Scenario: Visitor moves the pointer across the field
- **WHEN** the pointer moves over the canvas field
- **THEN** the field elements ease toward the pointer direction without blocking text input

### Requirement: Wheel scale control
The visitor SHALL be able to change the field scale with the mouse wheel over the background, within a bounded range, without hijacking wheel events over controls or text input.

#### Scenario: Visitor scrolls over the background
- **WHEN** the visitor scrolls vertically over the background field without modifier keys
- **THEN** the field scale changes within its allowed range and the page does not scroll for that gesture

### Requirement: Motion accessibility
The whisper field SHALL reduce animation and pointer motion when the browser requests reduced motion.

#### Scenario: Reduced motion is enabled
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** the field settles without continuous decorative animation and the writing and release flow remains available
