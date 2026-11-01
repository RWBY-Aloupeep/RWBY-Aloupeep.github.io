# Diwen (Steven) Xu — personal homepage

https://rwby-aloupeep.github.io

A personal homepage written in Jekyll and built directly by GitHub Pages. Changes go live a few minutes after they are pushed to `master`. It uses no third-party theme and loads no external resources (the fonts live in the repository).

The whole site is a single page: after the opening and the introduction, the chapters (Study, Research, Life, Acknowledgments, Contact) follow one after another, and clicking a chapter in the top menu scrolls to it. The old addresses `/study/`, `/research/`, `/life/`, `/acks/`, `/contact/`, `/cv/`, `/resume/` and `/about/` all redirect to the matching place on this page.

The repository must stay **public**: GitHub Pages cannot publish from a private repository on a free account, so making it private takes the site offline. After making it public again, go to Settings → Pages and set Source back to “Deploy from a branch”, branch `master`, folder `/ (root)`; only then does the site come back online.

## Common edits

| What to change | Where |
| --- | --- |
| Name, email, GitHub, LinkedIn | `author` in `_config.yml` (if you change GitHub or LinkedIn, update `social.links` in the same file too) |
| Home page introduction | The body of `_pages/home.md` |
| Home page opening text (Welcome to my story.) | `hero` in `_pages/home.md` |
| The content of a chapter | The matching file in `_chapters/` (study, research, life, acks, contact) |
| Chapter order, names in the menu | `order` (position) and `nav` (short name in the menu; defaults to `title`) at the top of each chapter file |
| Education / honors | `_data/education.yml` / `_data/honors.yml` |
| Research experience | `_data/experience.yml` |
| Research interest tags | `topics` in `_chapters/research.md` |
| Hobby cards | `interests` in `_chapters/life.md` |
| Chapter epigraphs (quotes) | `epigraph` at the top of each chapter file |

In the timeline files (`education.yml`, `honors.yml`, `experience.yml`), `where` and `note` may contain Markdown links such as `[Prof. Bo Zhu](https://…)`; they open in a new tab.

### Add a new note

1. Upload the PDF to `files/`, for example `files/Linear-Algebra.pdf`.
2. Add two lines under the matching topic in `_data/notes.yml`:

   ```yaml
       - title: "Linear Algebra"
         file: "Linear-Algebra.pdf"
   ```

   For a new topic, add a new `- topic:` block.

### Add a new chapter

Create a Markdown file in `_chapters/`, for example `_chapters/projects.md`:

```yaml
---
order: 3.5        # Position: here, after Research (2) and Life (3)
numeral: "IV"     # A numbered chapter shows as “Chapter IV”; for an unnumbered one write label: "Interlude"
title: Projects
epigraph:         # Optional
  quote: "…"
  author: "…"
---
```

Write the body below it (Markdown, with `###` for subheadings). It appears on the home page according to its `order`, the menu gains an entry for it automatically, and its address is `/#projects` (taken from the file name). Numerals are not updated for you: remember to shift the `numeral` of the chapters after it.

### Replace photos

Photos live in `images/`. Each one comes in JPEG and WebP, at two sizes (for example the avatar is `avatar.jpg` at 960px wide and `avatar-480.jpg` at 480px wide, and the same for WebP). Shrink photos before uploading them rather than uploading camera originals (one earlier original was 29 MB).

## Layout

```
_config.yml        Site settings and personal details
_chapters/         The content of each chapter, shown on the home page in order
_data/             Experience, honors, notes and other data
_pages/            home (the opening and introduction), 404, and redirect pages from old addresses to chapters
_layouts/          default (the frame), home (the home page), page (the 404 page)
_includes/         Components: header, footer, timeline, note list, cards, icons and more
_sass/             Styles: tokens (colors, fonts), base, layout, components, chapter, home
assets/css/        Style entry point main.scss
assets/fonts/      Web fonts Cormorant Garamond and Source Serif 4 (with their OFL licenses)
assets/js/         site.js (theme toggle, mobile menu, highlighting the current chapter in the menu), stars.js (star animation on the home page)
files/             Note PDFs
images/            Photos, site icons, social preview image (og.jpg)
.github/workflows/ Automated check (see below)
```

Colors are defined in one place, `_sass/_tokens.scss`: a violet-black dark theme and a light violet theme. The site follows the visitor's system (browser) light or dark setting; once visitors pick one with the button at the top right of the header, the site keeps using their choice. Fonts are declared in `_sass/_fonts.scss` and their files live in `assets/fonts/`; they are not loaded from Google Fonts, which is unreachable from mainland China.

## Automated check

On every push to any branch, GitHub Actions builds the site with the same components as GitHub Pages and checks that every internal link, image and script points to a file that exists (catching, for example, a misspelled note PDF file name). The result is under “Check site” on the repository's Actions page, and GitHub sends an email when it fails. This step only checks; it does not affect publishing.

## Local preview

Requires Ruby 3.x:

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000. If the build fails with `invalid byte sequence in US-ASCII`, put `LANG=C.UTF-8` in front of the command.

You can also skip installing Ruby and use Docker: run `docker compose up` in the repository folder and open http://localhost:4000 as well, or open the Dev Container in VS Code with “Reopen in Container”.
