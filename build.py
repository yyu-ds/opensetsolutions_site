#!/usr/bin/env python3
"""
build.py — regenerates the blog's derived artifacts from posts/*.html.

The post files are the single source of truth: each article's title, lede,
date, and tag are read out of its own markup, so adding a post is just
"write the post file, run this script". Running it rewrites:

  blog.html    — post list (featured + rows), tag filter chips, Blog JSON-LD
  posts/*.html — prev/next navigation and BlogPosting JSON-LD
  feed.xml     — RSS 2.0 feed
  sitemap.xml  — search-engine sitemap

Only the regions between <!-- build:NAME --> ... <!-- /build:NAME --> markers
are touched; everything else in the HTML files is left exactly as authored.

Usage:  python3 build.py
No dependencies beyond the Python 3 standard library.
"""

import hashlib
import json
import math
import random
import re
import sys
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = "https://opensetsolutions.com"
OG_IMAGE = f"{SITE}/og-image.png"

# ---------------------------------------------------------------- parsing --

def text_of(html_fragment):
    """Strip tags and collapse whitespace, keeping entities as-is."""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html_fragment)).strip()


def parse_post(path):
    html = path.read_text(encoding="utf-8")
    m_meta = re.search(
        r'<p class="article__meta"><time datetime="([^"]+)">([^<]+)</time>'
        r"\s*·\s*"
        r'<span class="tag">([^<]+)</span></p>',
        html,
    )
    m_title = re.search(r'<h1 class="article__title">(.*?)</h1>', html, re.S)
    m_lede = re.search(r'<p class="article__lede">(.*?)</p>', html, re.S)
    if not (m_meta and m_title and m_lede):
        sys.exit(f"error: could not parse metadata from {path.name}")
    date = m_meta.group(1)
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        sys.exit(
            f"error: {path.name} needs a full datetime (YYYY-MM-DD), got {date!r}"
        )
    return {
        "path": path,
        "slug": path.stem,
        "url": f"{SITE}/posts/{path.name}",
        "href": f"posts/{path.name}",
        "date": date,
        "date_display": m_meta.group(2).strip(),
        "tag": m_meta.group(3).strip(),
        "title": text_of(m_title.group(1)),
        "lede": text_of(m_lede.group(1)),
    }


def slugify(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def xml_escape(value):
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )

# ------------------------------------------------------ generative glyphs --

def glyph_svg(slug):
    """A small 'open set' mark — dashed organic region with interior points —
    deterministically seeded from the post slug so it never changes between
    builds but is unique per post. Colors come from CSS classes."""
    rng = random.Random(int(hashlib.md5(slug.encode()).hexdigest()[:12], 16))
    n = rng.randint(8, 11)
    pts = []
    for i in range(n):
        ang = (i / n) * 2 * math.pi + rng.uniform(-0.08, 0.08)
        r = 41 * (1 + rng.uniform(-0.16, 0.16))
        pts.append((60 + r * math.cos(ang), 60 + r * math.sin(ang)))

    def fmt(p):
        return f"{p[0]:.1f} {p[1]:.1f}"

    def mid(a, b):
        return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)

    d = f"M {fmt(mid(pts[-1], pts[0]))}"
    for i in range(n):
        p1, p2 = pts[i], pts[(i + 1) % n]
        d += f" Q {fmt(p1)} {fmt(mid(p1, p2))}"
    d += " Z"

    # one accent point with its ε-neighborhood, plus a couple of plain points
    ax, ay = 60 + rng.uniform(-13, 13), 60 + rng.uniform(-13, 13)
    nr = rng.uniform(10.5, 14)
    parts = [
        f'<path class="glyph-region" d="{d}"/>',
        f'<circle class="glyph-nbhd" cx="{ax:.1f}" cy="{ay:.1f}" r="{nr:.1f}"/>',
        f'<circle class="glyph-dot glyph-dot--accent" cx="{ax:.1f}" cy="{ay:.1f}" r="3"/>',
    ]
    for _ in range(rng.randint(1, 2)):
        ang = rng.uniform(0, 2 * math.pi)
        dist = rng.uniform(14, 24)
        px, py = 60 + dist * math.cos(ang), 60 + dist * math.sin(ang)
        parts.append(
            f'<circle class="glyph-dot" cx="{px:.1f}" cy="{py:.1f}" r="2.4"/>'
        )
    inner = "".join(parts)
    return (
        '<svg class="post-glyph__svg" viewBox="0 0 120 120" '
        f'xmlns="http://www.w3.org/2000/svg">{inner}</svg>'
    )

# ------------------------------------------------------------- rendering --

def render_post_list(posts):
    items = []
    for i, post in enumerate(posts):
        featured = i == 0
        glyph = glyph_svg(post["slug"])
        badge = '<span class="post-feature__badge">Latest</span> ' if featured else ""
        li_class = "post-row post-feature" if featured else "post-row"
        link_class = (
            "post-row__link post-feature__link" if featured else "post-row__link"
        )
        title_class = (
            "post-row__title post-feature__title" if featured else "post-row__title"
        )
        glyph_class = "post-glyph post-glyph--lg" if featured else "post-glyph"
        items.append(f"""\
          <li class="{li_class}" data-tag="{slugify(post['tag'])}">
            <a class="{link_class}" href="{post['href']}">
              <div class="post-row__body">
                <p class="post-row__meta">{badge}<time datetime="{post['date']}">{post['date_display']}</time> · <span class="post-row__tag">{post['tag']}</span></p>
                <h2 class="{title_class}">{post['title']}</h2>
                <p class="post-row__excerpt">{post['lede']}</p>
                <span class="post-row__more">Read<span aria-hidden="true">→</span></span>
              </div>
              <span class="{glyph_class}" aria-hidden="true">{glyph}</span>
            </a>
          </li>""")
    return "\n\n".join(items)


def render_tag_chips(posts):
    tags = []
    for post in posts:
        if post["tag"] not in tags:
            tags.append(post["tag"])
    chips = [
        '          <button class="tag-chip is-active" data-tag="all" aria-pressed="true">All</button>'
    ]
    chips += [
        f'          <button class="tag-chip" data-tag="{slugify(t)}" aria-pressed="false">{t}</button>'
        for t in tags
    ]
    return "\n".join(chips)


def jsonld_script(data):
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    return f'<script type="application/ld+json">\n{payload}\n</script>'


ORG = {
    "@type": "Organization",
    "name": "Open Set Solutions LLC",
    "url": f"{SITE}/",
    "logo": f"{SITE}/favicon.svg",
}


def blog_jsonld(posts):
    return jsonld_script(
        {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Open Set Solutions — Blog",
            "description": "Notes, work, and thinking from Open Set Solutions — "
            "a boutique technology and AI consultancy.",
            "url": f"{SITE}/blog.html",
            "publisher": ORG,
            "blogPost": [
                {
                    "@type": "BlogPosting",
                    "headline": p["title"],
                    "description": p["lede"],
                    "datePublished": p["date"],
                    "url": p["url"],
                }
                for p in posts
            ],
        }
    )


def post_jsonld(post):
    return jsonld_script(
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post["title"],
            "description": post["lede"],
            "datePublished": post["date"],
            "url": post["url"],
            "mainEntityOfPage": post["url"],
            "image": OG_IMAGE,
            "articleSection": post["tag"],
            "author": ORG,
            "publisher": ORG,
        }
    )


def render_post_nav(newer, older):
    """Prev/next between articles. `newer`/`older` may be None."""
    parts = ['<nav class="post-nav" aria-label="More notes">']
    if older:
        parts.append(f"""\
          <a class="post-nav__item post-nav__item--prev" href="{older['path'].name}">
            <span class="post-nav__label"><span aria-hidden="true">←</span> Older</span>
            <span class="post-nav__title">{older['title']}</span>
          </a>""")
    if newer:
        parts.append(f"""\
          <a class="post-nav__item post-nav__item--next" href="{newer['path'].name}">
            <span class="post-nav__label">Newer <span aria-hidden="true">→</span></span>
            <span class="post-nav__title">{newer['title']}</span>
          </a>""")
    parts.append("        </nav>")
    return "\n".join(parts)

# ----------------------------------------------------------- feed/sitemap --

def as_datetime(date_str):
    return datetime.strptime(date_str, "%Y-%m-%d").replace(
        hour=9, tzinfo=timezone.utc
    )


def render_feed(posts):
    items = []
    for p in posts:
        items.append(f"""\
    <item>
      <title>{xml_escape(p['title'])}</title>
      <link>{p['url']}</link>
      <guid isPermaLink="true">{p['url']}</guid>
      <pubDate>{format_datetime(as_datetime(p['date']))}</pubDate>
      <category>{xml_escape(p['tag'])}</category>
      <description>{xml_escape(p['lede'])}</description>
    </item>""")
    newest = format_datetime(as_datetime(posts[0]["date"]))
    body = "\n".join(items)
    return f"""\
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Open Set Solutions — Blog</title>
    <link>{SITE}/blog.html</link>
    <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Notes, work, and thinking from Open Set Solutions — a boutique technology and AI consultancy.</description>
    <language>en</language>
    <lastBuildDate>{newest}</lastBuildDate>
{body}
  </channel>
</rss>
"""


def render_sitemap(posts):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    urls = [
        (f"{SITE}/", posts[0]["date"]),
        (f"{SITE}/blog.html", posts[0]["date"]),
    ]
    urls += [(p["url"], p["date"]) for p in posts]
    entries = "\n".join(
        f"""\
  <url>
    <loc>{loc}</loc>
    <lastmod>{lastmod}</lastmod>
  </url>"""
        for loc, lastmod in urls
    )
    return f"""\
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{entries}
</urlset>
"""

# ------------------------------------------------------------ marker glue --

def replace_block(html, name, content, path):
    start, end = f"<!-- build:{name} -->", f"<!-- /build:{name} -->"
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    if not pattern.search(html):
        sys.exit(f"error: marker build:{name} not found in {path.name}")
    return pattern.sub(lambda _: f"{start}\n{content}\n        {end}", html)


def main():
    posts = sorted(
        (parse_post(p) for p in (ROOT / "posts").glob("*.html")),
        key=lambda p: p["date"],
        reverse=True,
    )
    if not posts:
        sys.exit("error: no posts found")

    # blog.html — list, chips, JSON-LD
    blog_path = ROOT / "blog.html"
    blog = blog_path.read_text(encoding="utf-8")
    blog = replace_block(blog, "tags", render_tag_chips(posts), blog_path)
    blog = replace_block(blog, "posts", render_post_list(posts), blog_path)
    blog = replace_block(blog, "jsonld", "  " + blog_jsonld(posts), blog_path)
    blog_path.write_text(blog, encoding="utf-8")

    # each post — prev/next nav + JSON-LD
    for i, post in enumerate(posts):
        newer = posts[i - 1] if i > 0 else None
        older = posts[i + 1] if i < len(posts) - 1 else None
        html = post["path"].read_text(encoding="utf-8")
        html = replace_block(html, "postnav", render_post_nav(newer, older), post["path"])
        html = replace_block(html, "jsonld", "  " + post_jsonld(post), post["path"])
        post["path"].write_text(html, encoding="utf-8")

    (ROOT / "feed.xml").write_text(render_feed(posts), encoding="utf-8")
    (ROOT / "sitemap.xml").write_text(render_sitemap(posts), encoding="utf-8")

    names = ", ".join(p["slug"] for p in posts)
    print(f"built: blog.html, {len(posts)} posts ({names}), feed.xml, sitemap.xml")


if __name__ == "__main__":
    main()
