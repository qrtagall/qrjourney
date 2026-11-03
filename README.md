# qrjourney

Public marketing site for [qrtagall.com](https://qrtagall.com) and category verticals (`safety.`, `craft.`, …).

## Link banner tags (process / claimed QR pages)

After a QR is claimed, owners edit each link’s **Description** (spreadsheet cell **B2**) on [process.qrtagall.com](https://process.qrtagall.com). Optional tags control how that banner behaves:

| Tag | Effect |
|-----|--------|
| `<NOID>` / `<NOOWNER>` | Hide ID or owner in the banner info row |
| `<COL:X>` | Soft pastel shade (`X` = 1–100) |
| `<EXPAND>` / `<EX>` | Open the section by default |
| `<EXPAND=DISABLE>` | Stay collapsed; tap shows **Disabled** (no expand). Owners can still open while editing. |
| `<EXPAND=AUTH=code>` | Stay collapsed; tap asks for auth code (max **8** ASCII chars). Unlock lasts until page refresh. |
| `<BALOON:text>` + optional `<ANIMATE>` | Promo capsule on the banner |

Full guide (TEXT formatting + banner tags):  
https://process.qrtagall.com/text-formatting-guide.html

Category pages here only mint / route QRs; banner tag behavior runs on the process app.
