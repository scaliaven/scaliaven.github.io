# scaliaven.github.io

Personal academic website of **Hongjia (Alex) Huang** — MSR student at the [CMU Robotics Institute](https://www.ri.cmu.edu/), working on physically grounded AI across robotics, computer vision, and physics-informed video generation.

**Live at [scaliaven.github.io](https://scaliaven.github.io)**

[![Deploy site](https://github.com/scaliaven/scaliaven.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/scaliaven/scaliaven.github.io/actions/workflows/deploy.yml)
[![Prettier](https://github.com/scaliaven/scaliaven.github.io/actions/workflows/prettier.yml/badge.svg)](https://github.com/scaliaven/scaliaven.github.io/actions/workflows/prettier.yml)
[![Broken links](https://github.com/scaliaven/scaliaven.github.io/actions/workflows/broken-links.yml/badge.svg)](https://github.com/scaliaven/scaliaven.github.io/actions/workflows/broken-links.yml)

## Content

| Path                       | What it holds                                                                     |
| -------------------------- | --------------------------------------------------------------------------------- |
| `_pages/about.md`          | Homepage — bio, profile photo, news and latest-posts feeds                        |
| `_data/cv.yml`             | CV content, rendered as an HTML page at [`/cv/`](https://scaliaven.github.io/cv/) |
| `_data/socials.yml`        | Contact email and social links                                                    |
| `_news/`                   | Short announcements shown on the homepage                                         |
| `_posts/`                  | Blog posts                                                                        |
| `_projects/`               | Project cards                                                                     |
| `_bibliography/papers.bib` | Publications, rendered by jekyll-scholar                                          |
| `assets/img/`              | Images, auto-converted to WebP at several widths by imagemagick                   |
| `assets/pdf/`              | CV and project PDFs                                                               |

Site-wide configuration, feature flags and pinned third-party library versions all live in `_config.yml`.

## Local development

**Docker (recommended):**

```bash
docker compose pull
docker compose up
# http://localhost:8080
```

**Native.** System Ruby is too old for the pinned bundler, and Homebrew's default `ruby` (4.x) is too new for Jekyll 4.3.4, so use the versioned formula:

```bash
brew install ruby@3.3
export PATH="$(brew --prefix ruby@3.3)/bin:$PATH"
gem install bundler:2.6.2
bundle config set --local path 'vendor/bundle'
bundle install

bundle exec jekyll serve   # http://localhost:4000
bundle exec jekyll build   # output in _site/
```

A plain `jekyll build` produces a **dev** build — unminified, with HTML comments retained. Production sets `JEKYLL_ENV=production`, which strips them, so local output will not match the live site byte for byte.

## Checks

Three workflows run on every push, and all three must pass:

```bash
npx prettier --write . && npx prettier . --check   # CI enforces formatting
bundle exec jekyll build                           # must build cleanly
```

The link checker (`.github/workflows/broken-links.yml`) covers Markdown, HTML, `_bibliography/*.bib` and `_data/*.yml`. To reproduce it locally, `brew install lychee` and run the `args:` line from that workflow.

Pushing a change under `.github/workflows/` requires the `workflow` OAuth scope on your git credential.

## Deployment

Pushes to `main` are built and published to the `gh-pages` branch by `.github/workflows/deploy.yml`. Never edit `gh-pages` directly.

Note that `deploy.yml`'s `paths:` filter deliberately skips `broken-links.yml` and `prettier.yml`, so a commit touching only those workflows will not trigger a redeploy.

## Notes for contributors and agents

`CLAUDE.md` documents this repo's silent-failure modes — social keys that moved to `_data/socials.yml`, the two independent `<head>` metadata flags, SRI hashes that must match the bytes a CDN serves, and library keys that templates read but `_config.yml` does not define. Read it before changing configuration or templates.

## Credits

Built on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme by Maruan Al-Shedivat and contributors, used under the MIT License (see [`LICENSE`](LICENSE)).

This fork tracks al-folio's pre-v1.0 monolithic layout. Upstream has since moved the theme into a set of gems, so its current `main` is not a drop-in source for changes here.
