# QRJourney — category branch pages

Vertical landing pages synced with `data/usecases.json` and configured in `data/site-config.json`.

## URLs

| Folder | Subdomain (production) | Code |
|--------|------------------------|------|
| `categories/1-safety-emergency/` | `safety.qrtagall.com` | SER |
| `categories/2-craft-art-culture/` | `craft.qrtagall.com` | CAC |
| `categories/3-education-professional/` | `education.qrtagall.com` | EP |
| `categories/4-memory-celebrations/` | `memory.qrtagall.com` | MC |
| `categories/5-plants-nature/` | `plants.qrtagall.com` | PN |
| `categories/6-home-property/` | `home.qrtagall.com` | HP |
| `categories/7-enterprise-operations/` | `enterprise.qrtagall.com` | EO |

Local preview: `http://localhost/categories/1-safety-emergency/` (or your static server root).

Until category subdomains are live, **`categoryUrlMode`** in `site-config.json` is `"path"` — explore links on the main page use `/categories/{id}/` on `qrtagall.com`. Set `"subdomain"` when DNS is ready.

**QR ID prefixes** on child pages: `{categoryCode}{letter}` per use case (e.g. Safety: `SERA_` Medical, `SERB_` Vehicle, `SERC_` Personal). Defined in `useCaseTemplates` in `site-config.json`.

## Regenerate HTML shells

```bash
python scripts/gen_category_pages.py
```

## Config

- **`data/site-config.json`** — emails, QR prefixes, subdomain map, per-vertical copy, `useCaseTemplates` → MasterTemplate sheet names.
- **`categories/{id}/overrides.json`** — optional per-use-case overrides (`EnableBuy`, `hidden`, etc.) without editing master `usecases.json`.

## QR generation

Category pages mint IDs with per-use-case prefix (`SERA_`, `SERB_`, …). Process app routes them via `git/qrprocess/config/cells.json` (`prefixAliases` → **IN** cell). Claim URLs are clean: `https://process.qrtagall.com?id=SERA_…` only.

## Shared assets

- `css/qr-shared.css`
- `js/qr-config.js`, `qr-usecases.js`, `qr-generate.js`, `qr-site-common.js`, `qr-category-page.js`
