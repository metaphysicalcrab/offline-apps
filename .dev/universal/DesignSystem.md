# Universal Design System Defaults

> Baseline design tokens and component patterns. Projects should override these
> in their project-level `.dev/DesignSystem.md` with project-specific branding.

## Default Design Tokens

### Color Primitives
```css
:root {
  /* Neutrals (adapt per project) */
  --color-neutral-50:  #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;

  /* Semantic (override per project with brand colors) */
  --color-primary:   #3b82f6;
  --color-secondary: #6366f1;
  --color-success:   #22c55e;
  --color-warning:   #eab308;
  --color-danger:    #ef4444;
  --color-info:      #06b6d4;

  /* Surfaces */
  --color-bg-primary:   #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-elevated:  #ffffff;
  --color-text-primary:   #171717;
  --color-text-secondary: #525252;
  --color-text-muted:     #a3a3a3;
  --color-border:         #e5e5e5;
}

/* Dark mode defaults */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary:   #0a0a0a;
    --color-bg-secondary: #171717;
    --color-bg-elevated:  #262626;
    --color-text-primary:   #fafafa;
    --color-text-secondary: #a3a3a3;
    --color-text-muted:     #525252;
    --color-border:         #404040;
  }
}
```

### Typography Scale
```css
:root {
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  --font-family-mono: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;

  /* Type scale (1.25 ratio) */
  --font-size-xs:   0.75rem;   /* 12px */
  --font-size-sm:   0.875rem;  /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg:   1.25rem;   /* 20px */
  --font-size-xl:   1.563rem;  /* 25px */
  --font-size-2xl:  1.953rem;  /* 31px */
  --font-size-3xl:  2.441rem;  /* 39px */
  --font-size-4xl:  3.052rem;  /* 49px */

  --line-height-tight:  1.25;
  --line-height-normal: 1.5;
  --line-height-loose:  1.75;

  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;
}
```

### Spacing Scale
```css
:root {
  --space-1:  0.25rem;  /* 4px */
  --space-2:  0.5rem;   /* 8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### Border & Shadow
```css
:root {
  --radius-sm:   0.25rem;  /* 4px */
  --radius-md:   0.5rem;   /* 8px */
  --radius-lg:   0.75rem;  /* 12px */
  --radius-xl:   1rem;     /* 16px */
  --radius-full: 9999px;

  --shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

### Breakpoints
```css
/* Mobile-first: base styles are mobile */
/* sm */  @media (min-width: 640px)  { }
/* md */  @media (min-width: 768px)  { }
/* lg */  @media (min-width: 1024px) { }
/* xl */  @media (min-width: 1280px) { }
/* 2xl */ @media (min-width: 1536px) { }
```

### Transitions
```css
:root {
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   350ms ease;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast:   0ms;
    --transition-normal: 0ms;
    --transition-slow:   0ms;
  }
}
```

## Default Component Patterns

### Buttons
- Primary: Filled with `--color-primary`, white text
- Secondary: Outlined with `--color-primary` border
- Ghost: No background, text-only, subtle hover
- Danger: Filled with `--color-danger` for destructive actions
- Sizes: `sm` (32px height), `md` (40px), `lg` (48px)
- All buttons: `border-radius: var(--radius-md)`, `font-weight: var(--font-weight-medium)`
- Disabled: 50% opacity, `cursor: not-allowed`

### Inputs
- Height: 40px default, 32px compact
- Border: 1px solid `--color-border`, focus: `--color-primary` with ring
- Error state: `--color-danger` border + inline error message below
- Label above input, never inside (placeholders are hints, not labels)

### Cards
- Background: `--color-bg-elevated`
- Border: 1px solid `--color-border`
- Border radius: `--radius-lg`
- Padding: `--space-6`
- Shadow: `--shadow-sm`, hover: `--shadow-md` if interactive

### Modals/Dialogs
- Backdrop: black at 50% opacity
- Max width: 480px for confirms, 640px for forms, 800px for content
- Padding: `--space-6`
- Close button always present (top-right)
- Focus trapped inside while open
- Dismiss on Escape key

### Tables
- Striped rows for readability on data-heavy tables
- Sticky header when scrollable
- Responsive: horizontal scroll on mobile, or card layout for narrow screens
- Sortable columns: clear visual indicator for sort direction
