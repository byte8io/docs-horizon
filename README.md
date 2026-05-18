# Byte8 Horizon — Documentation Site

Docusaurus 3 site for [Byte8 Horizon](https://byte8.io/products/horizon) — the MCP gateway for Magento 2 catalogs.

Hosted at **https://docs.byte8.io/horizon/** — served under the unified Byte8 docs domain via Cloudflare Pages and a path-based Worker router (see `infra/docs-router/` in the byte8.io monorepo).

## Local development

```bash
cd apps/horizon/docs
nvm use            # picks up Node 22 from .nvmrc
pnpm install
pnpm start
```

Opens at `http://localhost:3000/horizon/` (the `baseUrl` prefix is honoured in dev too).

## Production build

```bash
pnpm build
```

Output goes to `build/`. Deployed via **Cloudflare Pages**:

- **Project:** `docs-horizon` (TBD — confirm Cloudflare-assigned name on first deploy)
- **Build command:** `pnpm install --frozen-lockfile && pnpm build`
- **Build output:** `build`
- **Root directory:** _(blank if this is its own dedicated repo, or `docs` if it sits inside the monorepo when cloned)_
- **Production URL:** `https://docs.byte8.io/horizon/`

## Editing

- **Doc pages** live under `docs/` — mirror the order in `sidebars.ts`.
- **Marketing pages** (`/`) live under `src/pages/` — `index.tsx` is the homepage.
- **Theme overrides** live in `src/css/custom.css` — cyan accent (`#06B6D4`), matching the horizon.byte8.io dashboard primary colour.
- **Blog** = changelog. One markdown file per release under `blog/`, authored as `byte8` (see `blog/authors.yml`).

## Adding a doc page

1. Create the markdown file under `docs/<category>/<slug>.md`
2. Add front-matter:
   ```yaml
   ---
   sidebar_position: 1
   title: Page title
   description: One-sentence summary used by search and social cards.
   ---
   ```
3. Add the slug to `sidebars.ts` if it's not auto-discovered.

## Adding a release note

Drop a new file in `blog/` named `YYYY-MM-DD-<slug>.md` with front-matter:

```yaml
---
slug: v1-0-0-release
title: v1.0.0 — what shipped
authors: [byte8]
tags: [release]
---
```

Authors are defined in `blog/authors.yml`.
