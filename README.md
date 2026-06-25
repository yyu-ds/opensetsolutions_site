# Open Set Solutions website

Static single-page website for Open Set Solutions LLC. It is designed to run directly on GitHub Pages at `opensetsolutions.com` with no framework, build step, backend, or local storage.

## Files

- `index.html` - page content and section anchors.
- `styles.css` - visual system, responsive layout, accessibility states, and reduced-motion handling.
- `main.js` - mobile navigation, scroll reveal, hero canvas animation, and mailto contact form.
- `favicon.svg` - browser favicon.
- `CNAME` - GitHub Pages custom domain.
- `.nojekyll` - tells GitHub Pages not to process the site with Jekyll.

## Publish on GitHub Pages

1. Create a GitHub repository for the site, for example `opensetsolutions_site`.
2. Commit and push these files to the repository.
3. In GitHub, open **Settings > Pages**.
4. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Save the settings.
6. Confirm the custom domain field shows `opensetsolutions.com`. The `CNAME` file in this repo should keep it in sync.
7. After DNS is configured, enable **Enforce HTTPS** once GitHub allows it.

## GoDaddy DNS setup

In GoDaddy, open the DNS records for `opensetsolutions.com`.

Add or update these A records for the apex domain:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 1 hour |
| A | @ | 185.199.109.153 | 1 hour |
| A | @ | 185.199.110.153 | 1 hour |
| A | @ | 185.199.111.153 | 1 hour |

Optional but recommended for `www`:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| CNAME | www | opensetsolutions.com | 1 hour |

Remove conflicting parked-domain A records or forwarding rules if GoDaddy created them automatically. DNS can take a few minutes to several hours to propagate.

## Editing content

Most visible copy lives in `index.html`. Look for the section comments:

- `Hero`
- `Domains`
- `Services`
- `Approach`
- `About`
- `Work`
- `Contact`

The current employer is intentionally unnamed in the About section. The Work cards are intentionally generic templates so they can be replaced later with anonymized case studies.

To update the placeholder email, change `hello@opensetsolutions.com` in both `index.html` and `main.js`.

To update the placeholder case-study metrics, search for `add your result metric` in `index.html`.

## Contact form behavior

The form has no backend. On submit, `main.js` validates the required fields and opens a `mailto:` draft to `hello@opensetsolutions.com` with the message details filled in.

To switch to Formspree later:

1. Create a Formspree form and copy its endpoint URL.
2. In `index.html`, add `action="https://formspree.io/f/your-id"` and `method="POST"` to the contact form.
3. In `main.js`, remove or bypass the `submit` listener for `#contact-form`.
4. Keep the existing required fields and validation messages for accessibility.
