# Diwen (Steven) Xu — personal homepage

https://rwby-aloupeep.github.io

A personal homepage written in Jekyll and built directly by GitHub Pages. Changes go live a few minutes after they are pushed to `master`. It uses no third-party theme and loads no external resources (the fonts live in the repository).

The whole site is a single page: after the introduction, the chapters (Experience, Notes, Life, Acknowledgments, Contact) follow one after another, and clicking a chapter in the top menu scrolls to it. The old addresses `/study/`, `/research/`, `/life/`, `/acks/`, `/contact/`, `/cv/`, `/resume/` and `/about/` all redirect to the matching place on this page (`/study/`, `/research/`, `/cv/` and `/resume/` go to Experience).

The repository must stay **public**: GitHub Pages cannot publish from a private repository on a free account, so making it private takes the site offline. After making it public again, go to Settings → Pages and set Source back to “Deploy from a branch”, branch `master`, folder `/ (root)`; only then does the site come back online.

## Common edits

| What to change | Where |
| --- | --- |
| Name, email, GitHub, LinkedIn | `author` in `_config.yml` (if you change GitHub or LinkedIn, update `social.links` in the same file too) |
| Home page introduction | The body of `_pages/home.md` |
| Research interest tags | `topics` in `_pages/home.md` |
| The welcome line under the portrait (Welcome to my story. Enjoy~) | `welcome` in `_pages/home.md` |
| The content of a chapter | The matching file in `_chapters/` (experience, notes, life, acks, contact) |
| Chapter order, names in the menu | `order` (position) and `nav` (short name in the menu; defaults to `title`) at the top of each chapter file |
| Schools, research, projects, honors, motivations | `_data/path.yml` (see below) |
| Hobby cards | `interests` in `_chapters/life.md` |
| Chapter epigraphs (quotes, shown at the head of the chapter's content) | `epigraph` at the top of each chapter file |

### The Experience timeline

`_data/path.yml` is one timeline, newest first. Each top-level entry is a place you belonged to, a school now and a company later; it sits on the line. Under it, `items` lists what you did while you were there (research, projects, short programs), newest first; these hang off the line, indented. Honors from a school go in its `honors`.

```yaml
- year: "2025–2027"
  org: "[University of Washington, Seattle](https://amath.washington.edu/)"
  title: "Master of Science in Computational and Applied Mathematics"
  why: [Physics-informed machine learning, Optimization]   # optional: a few keywords
  items:
    - year: "2026–Present"
      title: "Research Collaborator"
      where: "GaTech · Supervised by [Prof.&nbsp;Bo&nbsp;Zhu](https://…)"
      why: [Fluid simulation, Flow map]
```

`why` is the motivation, shown as small gold tags: a list of keywords, or one short phrase; leave it out when there is none. An entry whose `year` contains “Present” twinkles. As visitors scroll down, the timeline lights up from the top, node by node, and goes out again as they scroll back up (`assets/js/path.js`). `org`, `title`, `where` and `note` may contain Markdown links such as `[Prof. Bo Zhu](https://…)`; they open in a new tab. A `title` or `where` made of several parts separated by ` · ` (like `GaTech · Supervised by …`) wraps between the parts, never inside one.

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
order: 2.5        # Position: here, after Notes (2) and before Life (3)
label: "…"        # Optional: a small line above the title
title: Projects
wide: true        # Optional: the content goes under the title, across the full width, instead of beside it
epigraph:         # Optional
  quote: "…"
  author: "…"
---
```

Write the body below it (Markdown, with `###` for subheadings). It appears on the home page according to its `order`, the menu gains an entry for it automatically, and its address is `/#projects` (taken from the file name).

### Replace photos

Photos live in `images/`. Each one comes in JPEG and WebP, at two sizes (for example the avatar is `avatar.jpg` at 960px wide and `avatar-480.jpg` at 480px wide, and the same for WebP). Shrink photos before uploading them rather than uploading camera originals (one earlier original was 29 MB).

## Layout

```
_config.yml        Site settings and personal details
_chapters/         The content of each chapter, shown on the home page in order
_data/             The Experience timeline (path.yml) and the lecture notes (notes.yml)
_pages/            home (the opening and introduction), 404, and redirect pages from old addresses to chapters
_layouts/          default (the frame), home (the home page), page (the 404 page)
_includes/         Components: header, footer, Experience timeline, note list, cards, icons and more
_sass/             Styles: tokens (colors, fonts), base, layout, components, chapter, home
assets/css/        Style entry point main.scss
assets/fonts/      Web fonts Cormorant Garamond and Source Serif 4 (with their OFL licenses)
assets/js/         site.js (theme toggle, mobile menu, highlighting the current chapter in the menu), stars.js (star animation on the home page), path.js (lights the Experience timeline up and down with scrolling)
files/             Note PDFs
images/            Photos, site icons, social preview image (og.jpg)
.github/workflows/ Automated check (see below)
```

Colors are defined in one place, `_sass/_tokens.scss`: a violet-black dark theme and a light violet theme. The site follows the visitor's system (browser) light or dark setting; once visitors pick one with the button at the top right of the header, the site keeps using their choice. Fonts are declared in `_sass/_fonts.scss` and their files live in `assets/fonts/`; they are not loaded from Google Fonts, which is unreachable from mainland China.

## Automated check

On every push to any branch, GitHub Actions builds the site with the same components as GitHub Pages and checks that every internal link, image and script points to a file that exists (catching, for example, a misspelled note PDF file name). The result is under “Check site” on the repository's Actions page, and GitHub sends an email when it fails. This step only checks; it does not affect publishing.

## Local preview

Requires Ruby 3.x (3.3, like the automated check; Ruby 4 is too new for the Jekyll that GitHub Pages uses):

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000. If the build fails with `invalid byte sequence in US-ASCII`, put `LANG=C.UTF-8` in front of the command.

You can also skip installing Ruby and use Docker: run `docker compose up` in the repository folder and open http://localhost:4000 as well, or open the Dev Container in VS Code with “Reopen in Container”.
