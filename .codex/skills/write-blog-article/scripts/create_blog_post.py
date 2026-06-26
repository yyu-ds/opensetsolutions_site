#!/usr/bin/env python3
"""Scaffold an Open Set Solutions static blog post and listing entry."""

from __future__ import annotations

import argparse
import html
import re
from datetime import date
from pathlib import Path


MONTHS = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
}


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    if not value:
        raise SystemExit("Could not derive a slug from the title; pass --slug.")
    return value[:80].strip("-")


def normalize_date(value: str) -> tuple[str, str]:
    """Return (datetime_value, display_value)."""
    match = re.fullmatch(r"(\d{4})-(\d{2})(?:-\d{2})?", value)
    if not match or match.group(2) not in MONTHS:
        raise SystemExit("Use --date as YYYY-MM or YYYY-MM-DD.")
    year, month = match.group(1), match.group(2)
    return f"{year}-{month}", f"{MONTHS[month]} {year}"


def default_body() -> str:
    return """          <p>Write the opening paragraph here.</p>

          <h2>What changed</h2>
          <p>Describe the work, the decision behind it, and the outcome for the client.</p>

          <h2>Why it matters</h2>
          <p>Connect the implementation to business value, user experience, and technical quality.</p>"""


def article_template(
    *,
    title: str,
    description: str,
    slug: str,
    datetime_value: str,
    display_date: str,
    tag: str,
    lede: str,
    body_html: str,
) -> str:
    e_title = html.escape(title)
    e_description = html.escape(description)
    e_tag = html.escape(tag)
    e_lede = html.escape(lede)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{e_title} - Open Set Solutions</title>
  <meta name="description" content="{e_description}" />

  <link rel="icon" href="../favicon.svg" type="image/svg+xml" />
  <meta name="theme-color" content="#1C1A16" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="{e_title}" />
  <meta property="og:description" content="{e_description}" />
  <meta property="og:url" content="https://opensetsolutions.com/posts/{slug}.html" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Schibsted+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="../styles.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header" id="site-header">
    <div class="container header-inner">
      <a class="wordmark" href="../index.html" aria-label="Open Set Solutions - home">
        <span class="wordmark__glyph" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30">
            <circle class="g-ring" cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.6 3.4" stroke-linecap="round"/>
            <circle cx="12.4" cy="14.2" r="1.9" fill="var(--accent)"/>
            <circle cx="19.6" cy="13.6" r="1.5" fill="currentColor"/>
            <circle cx="16.2" cy="20.4" r="1.6" fill="currentColor"/>
          </svg>
        </span>
        <span class="wordmark__text">Open&nbsp;Set <span>Solutions</span></span>
      </a>
      <nav class="nav" id="nav" aria-label="Primary">
        <ul class="nav__list">
          <li><a href="../index.html#services">Services</a></li>
          <li><a href="../index.html#about">About</a></li>
          <li><a href="../blog.html">Blog</a></li>
          <li><a href="../index.html#contact" class="nav__cta">Start a conversation</a></li>
        </ul>
      </nav>
      <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav">
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
      </button>
    </div>
  </header>

  <main id="main">
    <article class="article">
      <div class="container article__inner">
        <a class="back-link" href="../blog.html"><span aria-hidden="true">&larr;</span> All notes</a>

        <p class="article__meta"><time datetime="{datetime_value}">{display_date}</time> &middot; <span class="tag">{e_tag}</span></p>
        <h1 class="article__title">{e_title}</h1>
        <p class="article__lede">{e_lede}</p>

        <div class="prose">
{body_html}
        </div>

        <div class="article__foot">
          <a class="back-link" href="../index.html#contact">Start a conversation <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <a class="wordmark wordmark--sm" href="../index.html" aria-label="Open Set Solutions - home">
        <span class="wordmark__glyph" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="24" height="24">
            <circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.6 3.4" stroke-linecap="round"/>
            <circle cx="12.4" cy="14.2" r="1.9" fill="var(--accent)"/>
            <circle cx="19.6" cy="13.6" r="1.5" fill="currentColor"/>
            <circle cx="16.2" cy="20.4" r="1.6" fill="currentColor"/>
          </svg>
        </span>
        <span class="wordmark__text">Open Set Solutions</span>
      </a>
      <p class="footer-note">Boutique technology &amp; AI consultancy.</p>
      <p class="footer-legal">&copy; <span id="year">{date.today().year}</span> Open Set Solutions LLC. All rights reserved.</p>
    </div>
  </footer>

  <script src="../main.js" defer></script>
</body>
</html>
"""


def blog_entry(
    *,
    slug: str,
    datetime_value: str,
    display_date: str,
    tag: str,
    title: str,
    excerpt: str,
) -> str:
    return f"""
          <li class="post-row">
            <a class="post-row__link" href="posts/{slug}.html">
              <p class="post-row__meta"><time datetime="{datetime_value}">{display_date}</time> &middot; <span class="post-row__tag">{html.escape(tag)}</span></p>
              <h2 class="post-row__title">{html.escape(title)}</h2>
              <p class="post-row__excerpt">{html.escape(excerpt)}</p>
              <span class="post-row__more">Read<span aria-hidden="true">&rarr;</span></span>
            </a>
          </li>
"""


def insert_blog_entry(blog_html: Path, entry: str, slug: str) -> None:
    text = blog_html.read_text(encoding="utf-8")
    href = f'posts/{slug}.html'
    if href in text:
        raise SystemExit(f"{href} is already listed in blog.html.")
    marker = '<ul class="post-list">'
    if marker not in text:
        raise SystemExit('Could not find <ul class="post-list"> in blog.html.')
    text = text.replace(marker, marker + "\n" + entry, 1)
    blog_html.write_text(text, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=".", help="Repository root. Defaults to cwd.")
    parser.add_argument("--title", required=True)
    parser.add_argument("--slug")
    parser.add_argument("--date", required=True, help="YYYY-MM or YYYY-MM-DD")
    parser.add_argument("--tag", default="Thinking")
    parser.add_argument("--lede", required=True)
    parser.add_argument("--excerpt", required=True)
    parser.add_argument("--description")
    parser.add_argument("--body-file", help="HTML fragment to place inside <div class='prose'>.")
    parser.add_argument("--no-update-blog", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    repo = Path(args.repo_root).resolve()
    posts_dir = repo / "posts"
    blog_html = repo / "blog.html"
    if not posts_dir.is_dir() or not blog_html.is_file():
        raise SystemExit("Run from the site repository root or pass --repo-root.")

    slug = args.slug or slugify(args.title)
    datetime_value, display_date = normalize_date(args.date)
    post_path = posts_dir / f"{slug}.html"
    if post_path.exists() and not args.force:
        raise SystemExit(f"{post_path} already exists. Pass --force to overwrite.")

    body_html = Path(args.body_file).read_text(encoding="utf-8") if args.body_file else default_body()
    description = args.description or args.excerpt
    post_path.write_text(
        article_template(
            title=args.title,
            description=description,
            slug=slug,
            datetime_value=datetime_value,
            display_date=display_date,
            tag=args.tag,
            lede=args.lede,
            body_html=body_html,
        ),
        encoding="utf-8",
    )

    if not args.no_update_blog:
        insert_blog_entry(
            blog_html,
            blog_entry(
                slug=slug,
                datetime_value=datetime_value,
                display_date=display_date,
                tag=args.tag,
                title=args.title,
                excerpt=args.excerpt,
            ),
            slug,
        )

    print(f"Created {post_path.relative_to(repo)}")
    if not args.no_update_blog:
        print("Updated blog.html")
    print(f"Asset folder suggestion: uploads/blog/{slug}/")


if __name__ == "__main__":
    main()
