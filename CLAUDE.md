# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal academic website for Hongjia (Alex) Huang, built on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme. Deployed to `https://scaliaven.github.io` via GitHub Pages (auto-deploys on push to `main`).

## Local development

**Recommended (Docker):**

```bash
docker compose pull
docker compose up
# Site runs at http://localhost:8080
```

**Slim image (~100MB):**

```bash
docker compose -f docker-compose-slim.yml up
```

**Legacy (requires Ruby + Bundler + Python):**

```bash
bundle install
pip install jupyter
bundle exec jekyll serve
# Site runs at http://localhost:4000
```

**Build static site only:**

```bash
bundle exec jekyll build
# Output in _site/
```

**Format with Prettier (HTML/Liquid):**

```bash
npx prettier --write .
```

## Key content files

| File/Dir                   | Purpose                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `_pages/about.md`          | Homepage / landing page                                                              |
| `_news/`                   | News/announcements (shown on homepage)                                               |
| `_posts/`                  | Blog posts                                                                           |
| `_projects/`               | Project cards                                                                        |
| `_bibliography/papers.bib` | Publications (rendered by jekyll-scholar)                                            |
| `_data/cv.yml`             | CV content, rendered as the HTML CV page at `/cv/`                                   |
| `_data/socials.yml`        | Social media links                                                                   |
| `assets/json/resume.json`  | JSON Resume format CV (unused — `jekyll_get_json` is commented out in `_config.yml`) |
| `assets/img/`              | Images (auto-converted to WebP at multiple widths by imagemagick)                    |

## Architecture notes

- **`_config.yml`** is the main configuration: site identity, feature flags (`enable_math`, `enable_darkmode`, etc.), Jekyll plugin config, and third-party library versions. Many pages are excluded from the build (e.g. `_pages/publications.md`, `_pages/teaching.md`) — to enable them, remove from the `exclude:` list.
- **Layouts** live in `_layouts/`; reusable components in `_includes/`. Liquid templating throughout.
- **Publications** are driven entirely by `_bibliography/papers.bib` via `jekyll/scholar`. Custom BibTeX fields like `abbr`, `selected`, `pdf`, `code`, `arxiv`, `preview` control how entries render.
- **CV page** (`/cv/`) renders `_data/cv.yml` through `_layouts/cv.liquid`. That layout prefers `site.data.resume` (JSON Resume, loaded by `jekyll_get_json`) when present; both blocks are commented out in `_config.yml` so the YAML path is used. Section `type:` values map to the partials in `_includes/cv/`. The PDF download button comes from `cv_pdf:` in the page front matter; `cv_pdf:` at site level in `_config.yml` drives the CV icon in `_includes/social.liquid` and, only when no `/cv/` page exists, a direct-to-PDF nav link.
- **Deployment** is handled by `.github/workflows/deploy.yml` — pushes to `main` build and push to the `gh-pages` branch automatically. Do not edit `gh-pages` directly.
- **Prettier** is configured (`.prettierrc`) for HTML/Liquid formatting. CI checks this via `.github/workflows/prettier.yml`.
