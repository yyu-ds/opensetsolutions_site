# Open Set Solutions — website

The static marketing site for **Open Set Solutions LLC**, a boutique technology
and AI consultancy. Plain HTML, CSS, and vanilla JavaScript — no framework, no
build step, no backend. Built to be hosted on **GitHub Pages** at the apex
domain **opensetsolutions.com**.

```
index.html      → the whole single-page site (all sections)
blog.html       → the blog listing page
posts/          → one HTML file per blog post
styles.css      → all styling + design tokens
main.js         → hamburger menu, scroll reveals, hero animation
favicon.svg     → the dashed-circle "open set" glyph
CNAME           → custom domain for GitHub Pages (opensetsolutions.com)
.nojekyll       → tells Pages to serve files as-is (no Jekyll processing)
README.md       → this file
```

---

## Editing the content

Everything you'll likely want to change lives in **`index.html`**, in plain text
between the tags. Search for the section comments (e.g. `<!-- SERVICES -->`).

- **Your email address** — currently `hello@opensetsolutions.com`. It appears in
  the contact section. Search `index.html` for `hello@opensetsolutions.com` and
  replace **both** occurrences (the `href="mailto:..."` and the visible button
  text). To change the pre-filled subject line, edit the `?subject=...` part.
- **Headline / tagline** — inside `<h1 class="hero__heading">` and the
  `<p class="hero__lede">` just below it.
- **Services** — each card is an `<li class="card">`. Edit the `card__title`
  and `card__body`. Add or remove a card by copying/deleting a whole `<li>`.
- **About** — the paragraphs inside `<div class="about__body">`, and the three
  `principles` rows.
- **Nav links** — inside `<nav class="nav">`. Each link's `href="#id"` points at
  a section's `id`.

### Changing colors / fonts
Open **`styles.css`**. The palette and fonts are defined once at the very top
under `:root` (the `--paper`, `--ink`, `--accent`, `--font-*` variables). Change
a value there and it updates everywhere. Fonts are loaded from Google Fonts via
the `<link>` in `index.html`'s `<head>`.

### Previewing locally
Just double-click `index.html` to open it in a browser. (For the Google Fonts to
load you'll need an internet connection; everything else works offline.)

---

## Deploying to GitHub Pages

### 1. Create the repository & push these files
Put all the files in this folder at the **root** of a GitHub repository.

```bash
git init
git add .
git commit -m "Open Set Solutions website"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

> The repo can be named anything. The `CNAME` file is what binds the site to
> `opensetsolutions.com`, not the repo name.

### 2. Turn on GitHub Pages
1. In the repo, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set **Branch** to `main` and folder to **`/ (root)`**, then **Save**.
4. Wait ~1 minute for the first build. Your site goes live (initially at
   `https://<username>.github.io/<repo>/`).

### 3. Set the custom domain
The included `CNAME` file already contains `opensetsolutions.com`, so GitHub
should pick it up automatically. To confirm: **Settings → Pages → Custom
domain** should show `opensetsolutions.com`. If it's blank, type it in and
**Save** (this just rewrites the `CNAME` file).

Leave **Enforce HTTPS** unchecked until the DNS below has propagated and the
certificate is issued — then check it.

---

## DNS setup at GoDaddy

You're pointing the **apex/root domain** (`opensetsolutions.com`, no `www`) at
GitHub Pages. In the GoDaddy dashboard go to **My Products → Domains →
opensetsolutions.com → DNS / Manage DNS**.

### A. Apex domain → GitHub's IP addresses
Add **four A records**. For each: Type `A`, Name `@`, and one of these IPs, TTL
default (1 hour):

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

> If GoDaddy already has a parked/forwarding A record on `@`, delete it first —
> you should end up with exactly these four A records on `@`.

### B. (Recommended) www → your Pages site
Add a **CNAME record** so `www.opensetsolutions.com` also works and redirects:

```
Type:  CNAME
Name:  www
Value: <your-username>.github.io        (note the trailing dot if GoDaddy adds one)
TTL:   1 hour
```

### C. Remove conflicting records
- Delete any **Domain Forwarding** GoDaddy set up by default (Domain Settings →
  Forwarding → remove), as it conflicts with the A records.
- Make sure there's no other `@` A record or `@`/`www` CNAME pointing elsewhere.

### D. Wait, then verify
DNS changes can take anywhere from a few minutes to a few hours. Once propagated,
GitHub (**Settings → Pages**) will show a green check next to the custom domain.
Then enable **Enforce HTTPS**. Visiting `https://opensetsolutions.com` should
load the site.

You can check propagation with:

```bash
dig opensetsolutions.com +short      # should list the four 185.199.x.x IPs
dig www.opensetsolutions.com +short  # should resolve to <username>.github.io
```

---

### Nav links
Inside `<nav class="nav">`. Each link's `href="#id"` points at a section's `id`.
The **Blog** link points at `blog.html` (a separate page).

---

## The blog

The blog is just static HTML — no database, no build step. There are two pieces:

- **`blog.html`** — the listing page (the index of all posts).
- **`posts/*.html`** — one file per post (two starter posts are included).

### Adding a new post
1. **Copy an existing post file** in `posts/` (e.g. duplicate
   `posts/building-with-room-to-grow.html`) and rename it to a short, lowercase,
   hyphenated slug, e.g. `posts/our-new-case-study.html`. The filename becomes
   part of the URL.
2. **Edit the article** in that new file: the `<title>` and `<meta>` tags in the
   `<head>`, then the `article__meta` (date + tag), `article__title`,
   `article__lede`, and the paragraphs/headings/lists inside `<div class="prose">`.
   Leave the header, footer, and `../` paths alone.
3. **List it on `blog.html`**: open `blog.html`, find the `<ul class="post-list">`,
   copy one `<li class="post-row">` block, paste it at the **top** (newest first),
   and update its link `href`, date, tag, title, and excerpt to match your new post.

That's it — commit and push, and the post is live.

### Article building blocks (inside `<div class="prose">`)
Use plain HTML; the stylesheet handles the look:
- `<p>…</p>` — a paragraph
- `<h2>…</h2>` / `<h3>…</h3>` — section headings
- `<ul><li>…</li></ul>` — a bulleted list (open-ring bullets)
- `<blockquote>…</blockquote>` — a pull quote
- `<strong>…</strong>`, `<em>…</em>`, `<a href="…">…</a>` — inline emphasis / links

---

## Notes
- **Don't delete `.nojekyll`.** It stops GitHub from running Jekyll, which can
  otherwise ignore files and folders that start with an underscore.
- **Don't delete `CNAME`.** Removing it (or pushing without it) resets the custom
  domain in GitHub Pages.
- The site is responsive to mobile, keyboard-accessible with visible focus
  styles, and respects `prefers-reduced-motion` (the hero animation freezes to a
  single static frame for users who request reduced motion).
