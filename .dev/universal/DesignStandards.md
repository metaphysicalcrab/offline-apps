# Universal Design Standards

> Cross-project UX principles, accessibility requirements, and design conventions.
> Project-specific overrides go in the project's `.dev/DesignStandards.md`.

## Design Principles

1. **Clarity over decoration** — Every visual element should serve communication. If it doesn't help the user understand or act, remove it.
2. **Progressive disclosure** — Show only what's needed now. Reveal complexity as the user needs it.
3. **Consistency breeds confidence** — Same action, same appearance, same location. Reduce cognitive load.
4. **Forgiveness** — Users will make mistakes. Undo, confirm destructive actions, auto-save state.
5. **Speed is a feature** — Perceived performance matters as much as actual performance. Show progress, use optimistic UI.

## Accessibility (WCAG 2.1 AA — All Projects)

### Non-Negotiables
- All interactive elements are keyboard-accessible
- Tab order follows visual/logical reading order
- Visible focus indicators on all focusable elements (never `outline: none` without replacement)
- Color is never the sole indicator of state (use icons, text, patterns alongside)
- Minimum contrast: 4.5:1 normal text, 3:1 large text and UI components
- Touch targets: 44x44px minimum
- All images have alt text; decorative images use `alt=""`
- All form fields have visible labels (not just placeholders)
- Error messages are associated with their fields via `aria-describedby`
- Page has a logical heading hierarchy (`h1` > `h2` > `h3`, no skips)
- Skip navigation link for keyboard users

### Motion & Animation
- Respect `prefers-reduced-motion` — disable or reduce all non-essential animation
- No auto-playing content that can't be paused
- Avoid flashing content (max 3 flashes per second)
- Transition durations: 150-300ms for micro-interactions, 300-500ms for page transitions

### Testing Cadence
- Keyboard-only navigation test: every new feature
- Screen reader spot-check (NVDA/VoiceOver): monthly or per milestone
- Lighthouse accessibility audit: per release
- Color contrast check: every new color addition

## Responsive Design

### Approach
- **Mobile-first** — Base styles target mobile. Enhance upward with `min-width` queries.
- Content determines breakpoints, not devices. Standard starting points:
  - `640px` — Small tablets / landscape phones
  - `768px` — Tablets
  - `1024px` — Small desktops / landscape tablets
  - `1280px` — Standard desktops
  - `1536px` — Wide screens

### Layout Strategy
- Fluid widths with `max-width` constraints for readability
- Content max-width: 65-75ch for prose, wider for data tables/dashboards
- Grid for page layout, Flexbox for component alignment
- Container queries for truly responsive components when supported

## Typography

- Body text: 16px minimum (`1rem`), 1.5 line height for readability
- Heading scale: use a consistent ratio (1.25 or 1.333 recommended)
- Maximum line length: 75 characters for body text
- Left-align body text (never justify on web — inconsistent word spacing)
- System font stack as default unless brand requires specific typefaces:
  ```css
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  ```

## Spacing

- Use a consistent spacing scale based on a base unit (typically 4px or 8px):
  - `4px` (0.25rem) — Tight gaps, icon padding
  - `8px` (0.5rem) — Related element spacing
  - `12px` (0.75rem) — Compact component padding
  - `16px` (1rem) — Standard padding, form gaps
  - `24px` (1.5rem) — Section separation within components
  - `32px` (2rem) — Component separation
  - `48px` (3rem) — Section separation
  - `64px` (4rem) — Major section breaks

## Color Usage

- Define semantic colors, not just values: `--color-success`, `--color-danger`, `--color-warning`, `--color-info`
- Dark mode: design for it from the start, even if implemented later. Use CSS custom properties.
- Use opacity/alpha variations rather than defining 20 shades of each color
- Interactive element states: default → hover → active → focus → disabled (all must be visually distinct)

## Interaction Patterns

### Forms
- Inline validation on blur, not on every keystroke
- Submit button disabled state only while processing (never as initial state)
- Clear error states when the user starts correcting
- Autosave for long forms when possible; otherwise, warn on unsaved changes before navigation
- Group related fields visually with fieldsets

### Loading States
- Skeleton screens for content areas (preferred over spinners for layout stability)
- Spinners for discrete actions (button submissions, modal loads)
- Progress bars for operations with known duration
- Optimistic UI for low-risk mutations (toggle, like, mark-as-read)

### Empty States
- Never show a blank screen — always communicate what's expected
- Include a clear action: "No time entries yet. [Create your first entry]"
- Use illustration sparingly; clarity of message matters more

### Error States
- Inline for field-level validation errors
- Toast/notification for transient server errors (with retry option)
- Full-page error for unrecoverable states (with clear recovery path)
- Never show raw error codes or stack traces to users

### Destructive Actions
- Require confirmation for any irreversible action
- Use distinct visual treatment (red/danger color, different button style)
- State consequences clearly: "This will permanently delete 47 time entries"
- Offer undo when technically feasible instead of pre-confirmation

## Game UI Specific

- HUD elements: consistent corner positioning (health top-left, minimap top-right is convention)
- Menu navigation must work with both mouse/touch and keyboard/gamepad
- In-game text: minimum 24px equivalent at 1080p, scalable
- Colorblind modes: provide alternative indicators (shapes, patterns) for color-coded information
- Pause menus must be accessible instantly with no animation delay
