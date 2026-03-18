# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

This is a Shopify theme (Savor v3.2.1) exported from www.dummiez.co. It is a production Liquid theme with no local build step — files are deployed directly to Shopify via the Shopify CLI.

## Development Workflow

Use [Shopify CLI](https://shopify.dev/docs/storefronts/themes/tools/cli) to develop and deploy:

```bash
# Start a local development server (hot reload against a live store)
shopify theme dev --store=www.dummiez.co

# Push theme to store
shopify theme push

# Pull latest theme from store
shopify theme pull

# Check theme for errors
shopify theme check
```

There is no `npm install`, no bundler, and no compiled output — the assets in `/assets/` are the final files.

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `assets/` | JS modules (ES2020), CSS, SVGs — served directly by Shopify CDN |
| `blocks/` | Reusable block components, all prefixed with `_` (e.g. `_card.liquid`) |
| `sections/` | Page sections composed of blocks |
| `snippets/` | Shared Liquid partials rendered with `{% render %}` |
| `templates/` | JSON page templates wiring sections together |
| `layout/` | Root layout wrappers (`theme.liquid`, `password.liquid`) |
| `config/` | `settings_schema.json` (defines customizer UI) and `settings_data.json` (current values) |
| `locales/` | Translation files; `en.default.json` is the primary locale |

## Key Architectural Patterns

### Blocks vs Snippets
- **Blocks** (`blocks/_name.liquid`): Dynamically composed via `{% content_for 'block', type: '_name' %}`. Blocks have their own `block.settings` scope.
- **Snippets** (`snippets/name.liquid`): Statically included via `{% render 'name', param: value %}`. Isolated variable scope.

### JavaScript — Web Components & Custom Elements
- JS files in `assets/` are ES2020 modules with JSDoc type annotations (no TypeScript compilation).
- `assets/jsconfig.json` configures the path alias `@theme/*` → `assets/`.
- Base class `Component` (in `component.js`) handles refs, mutation observers, and shadow DOM.
- Components use a **declarative shadow DOM** pattern: `<template shadowrootmode="open">`.
- DOM refs use the `ref="name"` / `ref="items[]"` attribute convention.

### Color Scheme System
- 7 color schemes (scheme-1 through scheme-7) defined in `config/settings_schema.json`.
- Each scheme compiles to CSS variables: `--color-background`, `--color-primary`, etc.
- Applied via class `.color-{{ scheme.id }}` on container elements.
- `snippets/color-schemes.liquid` outputs all scheme CSS variable definitions.

### Settings
- Section-level settings: `section.settings.key`
- Block-level settings: `block.settings.key`
- Global theme settings: `settings.key`
- Inline styles are output via helper snippets: `spacing-style`, `size-style`, `gap-style`, `layout-panel-style`.

### Localization
- Translation keys use `t:` syntax: `{{ 'key.subkey' | t }}` in Liquid.
- Schema labels reference locale keys: `"label": "t:sections.hero.label"`.
- Primary locale file: `locales/en.default.json`; schema translations: `locales/en.default.schema.json`.
