# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal academic website for Hongjia (Alex) Huang, built on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme. Deployed to `https://scaliaven.github.io` via GitHub Pages (auto-deploys on push to `main`).

## Before you push

1. `npx prettier --write . && npx prettier . --check` — CI enforces this and will fail the build otherwise. The Liquid plugin reformats multi-line HTML comments, so hand-written comments almost always need a formatting pass.
2. `bundle exec jekyll build` — must complete with no errors.
3. Check the built output, not just the source. Several classes of bug here are silent: Liquid renders a missing value as an empty string rather than failing.
4. If you touched `.github/workflows/**`, the push needs the `workflow` OAuth scope. The osxkeychain helper holds a token without it, so a normal push is rejected. Use:
   ```bash
   git -c credential.helper= -c credential.helper='!gh auth git-credential' push origin main
   ```

## Local development

**Recommended (Docker):**

```bash
docker compose pull
docker compose up
# Site runs at http://localhost:8080
```

**Native build.** System Ruby is too old for the pinned bundler, and Homebrew's default `ruby` (4.x) is too new for Jekyll 4.3.4. Use the versioned formula:

```bash
brew install ruby@3.3
export PATH="$(brew --prefix ruby@3.3)/bin:$PATH"
gem install bundler:2.6.2
bundle config set --local path 'vendor/bundle'
bundle install
bundle exec jekyll build     # output in _site/
```

Note that `_site/` from a plain `jekyll build` is a **dev** build — unminified, HTML comments retained. Production sets `JEKYLL_ENV=production`, which strips comments. If you are comparing local output against the live site, that difference is expected and is not drift.

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
| `_data/socials.yml`        | Social links, contact email, `rss_icon` — **not** `_config.yml`                      |
| `assets/json/resume.json`  | JSON Resume format CV (unused — `jekyll_get_json` is commented out in `_config.yml`) |
| `assets/img/`              | Images (auto-converted to WebP at multiple widths by imagemagick)                    |
| `apple-touch-icon.png`     | iOS home-screen icon; at repo root deliberately (see gotchas)                        |

## Architecture notes

- **`_config.yml`** is the main configuration: site identity, feature flags (`enable_math`, `enable_darkmode`, etc.), Jekyll plugin config, and third-party library versions. Many pages are excluded from the build (e.g. `_pages/publications.md`, `_pages/teaching.md`) — to enable them, remove from the `exclude:` list.
- **Layouts** live in `_layouts/`; reusable components in `_includes/`. Liquid templating throughout.
- **Publications** are driven entirely by `_bibliography/papers.bib` via `jekyll/scholar`. Custom BibTeX fields like `abbr`, `selected`, `pdf`, `code`, `arxiv`, `preview` control how entries render.
- **CV page** (`/cv/`) renders `_data/cv.yml` through `_layouts/cv.liquid`. Section `type:` values map to the partials in `_includes/cv/`. The PDF download button comes from `cv_pdf:` in the page front matter; `cv_pdf:` at site level in `_config.yml` drives the CV icon in `_includes/social.liquid`.
- **Deployment** is handled by `.github/workflows/deploy.yml` — pushes to `main` build and push to the `gh-pages` branch automatically. Do not edit `gh-pages` directly. Its `paths:` filter deliberately excludes `broken-links.yml` and `prettier.yml`, so a commit touching only those does not redeploy.
- **Distill is not installed.** `_layouts/distill.liquid`, `_includes/distill_scripts.liquid` and `assets/js/distillpub/` were removed; no content uses `layout: distill`. `_sass/_distill.scss` and the `.distill` rules in `_base.scss` are leftover dead CSS.

## Gotchas

These have each caused a real, silent bug in this repo.

**Socials live in `_data/socials.yml`, not `_config.yml`.** This fork moved them; upstream's includes still read `site.orcid_id`, `site.github_username`, `site.scholar_userid` and friends, which are all nil here. `_includes/metadata.liquid` was repointed at `site.data.socials.*`; if you touch anything social-related, check which form the include uses. `rss_icon` is the same trap — it is an entry in `socials.yml`, and setting `rss_icon:` in `_config.yml` does nothing.

**Two independent flags gate `<head>` metadata**: `serve_og_meta` (Open Graph + Twitter cards) and `serve_schema_org` (JSON-LD `sameAs`). Enabling one does nothing for the other.

**SRI hashes in `third_party_libraries` must match the bytes the CDN serves.** A stale hash makes the browser refuse the resource with no visible error — this shipped a broken profile-photo slider for months. Verify before trusting a pinned hash:

```bash
curl -sL "<url>" | openssl dgst -sha256 -binary | openssl base64 -A
```

**Six library keys are read by templates but have no `third_party_libraries` entry**: `plotly`, `lightbox2`, `spotlight`, `venobox`, `photoswipe`, `photoswipe-lightbox`. Setting the matching front matter (`page.chart.plotly`, `page.images.lightbox2`, …) emits `<script src="">` — a request to the page itself — with no build error. Add the config entry first.

**Pinned libraries with known CVEs that no page currently loads**: mermaid 10.7.0 (8 advisories, one high), vega 5.27.0, echarts 5.5.0. Bump them before enabling `page.mermaid`, `page.chart.vega_lite` or `page.chart.echarts`.

**`assets/img/` is processed by imagemagick** (`.jpg .jpeg .png .tiff .gif` → WebP at 480/800/1400). Don't put small fixed-size assets there; that is why `apple-touch-icon.png` sits at the repo root.

**`.bib` `doi` fields take a bare DOI.** `bib.liquid` prefixes `https://doi.org/` itself, so `doi = {https://doi.org/10.x/y}` renders a doubled URL.

**Link checker.** `.github/workflows/broken-links.yml` pins both the action (`@v2.9.0`) and the binary (`lycheeVersion: v0.24.2`), and they must stay compatible — action ≤ v2.1.0 cannot install lychee ≥ 0.18, whose tarball nests the binary in a subdirectory. Before changing its `args:`, reproduce locally:

```bash
brew install lychee
# then run the exact args: line from the workflow
```

It checks `.md`, `.html`, `_bibliography/*.bib` and `_data/*.yml`. `--accept` tolerates publisher/CDN bot walls (403/429) and figshare's 202; `--root-dir .` resolves root-relative asset paths.

## Upstream

al-folio moved to a **gem architecture** at v1.0, and renamed its default branch `master` → `main`. `_layouts/`, `_includes/`, `_sass/` and `assets/js/` no longer exist upstream — they live in `al_folio_core` and ~15 sibling gems. This fork is a pre-v1.0 monolith and shares no git history with upstream.

- **Do not cherry-pick from `upstream/master`.** It predates this fork's template base and is behind it on effectively every file; taking its versions would reintroduce fixed bugs.
- **Do not leave an `upstream` remote configured.** `gh` then resolves `gh run`/`gh api` to `alshedivat/al-folio` instead of this repo, which silently reports the wrong CI results.
- **Migrating to v1.x is a 3–5 day project**, dominated by two things: rewriting `_data/cv.yml` into RenderCV schema (which has no advisor field, does not list ORCID in its `social_networks` enum, flattens nested highlights, and re-sorts entries chronologically regardless of source order), and restyling ~780 lines of Bootstrap-targeted SCSS against Tailwind DOM. `al_folio_bootstrap_compat` does not bridge this and is removed in v2.0.
