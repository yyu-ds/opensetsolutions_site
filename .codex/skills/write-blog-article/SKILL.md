---
name: write-blog-article
description: Create and publish Open Set Solutions static blog articles. Use when the user asks to write, add, draft, publish, or update a post for this repository's Blog tab, including creating a new `posts/*.html` article, adding screenshots or other local assets, styling article image comparisons, and inserting the newest-first listing entry in `blog.html`.
---

# Write Blog Article

## Overview

Use this skill for blog work in the Open Set Solutions static website. The site has no CMS or build step:

- `blog.html` is the blog listing page.
- `posts/*.html` contains one complete HTML file per article.
- Article assets should live under `uploads/blog/<post-slug>/`.

## Workflow

1. Inspect the current blog structure before editing:
   - Read `README.md` blog instructions if needed.
   - Read `blog.html` around `<ul class="post-list">`.
   - Read one recent post in `posts/` for page chrome, metadata, and content style.
2. Choose a slug:
   - Use short lowercase hyphen-case, for example `acupuncture-health-center-rebuild`.
   - The final article URL is `posts/<slug>.html`.
3. Create the article:
   - Prefer `scripts/create_blog_post.py` for a correctly wired starter file and listing entry.
   - Then edit the article body manually to match the user's brief and the site's voice.
4. Update `blog.html`:
   - Insert one `<li class="post-row">` block at the top of `<ul class="post-list">`.
   - Keep posts newest-first.
   - Update `href`, `time datetime`, display date, tag, title, and excerpt.
5. Add screenshots/assets when useful:
   - Store images in `uploads/blog/<slug>/`.
   - Reference article images with `../uploads/blog/<slug>/<file>`.
   - Use `figure` and `figcaption`; use `.case-study-grid` for before/after comparisons if available.
   - If adding new article layout patterns, keep CSS scoped under `.prose`.
6. Validate:
   - Check the new post path and all referenced images exist.
   - Start a local static server when previewing: `python3 -m http.server 8000 --bind 127.0.0.1`.
   - Preview `http://127.0.0.1:8000/blog.html` and the new post.
   - Stop the server before finishing unless the user wants it left running.

## Helper Script

Use the helper from the repository root:

```bash
python3 .codex/skills/write-blog-article/scripts/create_blog_post.py \
  --title "Article title" \
  --date "2026-06" \
  --tag "Case Study" \
  --lede "One-sentence article lede." \
  --excerpt "Short blog listing excerpt."
```

Useful options:

- `--slug custom-slug`
- `--description "SEO meta description"`
- `--body-file /path/to/body.html`
- `--no-update-blog` to create only the article file
- `--force` to overwrite an existing post file

The script scaffolds a full article shell and inserts the blog listing entry. It intentionally leaves substantive writing to Codex so the article can follow the user's specific brief.

## Writing Style

Write the article as a polished consultancy note:

- Lead with the client/business situation, then the design and technical work.
- Show concrete before/after comparisons when screenshots are available.
- Explain why each change matters for business outcomes, not only aesthetics.
- For case studies, connect design taste, conversion clarity, SEO/AI-agent readiness, trust signals, and implementation quality.
- Keep claims grounded in observed site content or supplied user context.

## Safety Notes

- Do not stage `.DS_Store` files.
- Do not remove `CNAME`.
- Do not edit unrelated posts or global styles unless the article needs the pattern.
- If a screenshot requires browsing live websites, capture current evidence and save it locally under the post slug.
