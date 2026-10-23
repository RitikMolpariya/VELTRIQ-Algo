# Veltriq Capital — upgraded trading technology website

This enhancement preserves the original plain HTML/CSS/vanilla JavaScript architecture, brand name, product category modal, mobile navigation, and configuration-driven contact links. It adds workbook-sourced portfolio reporting, annual/monthly charts, a monthly heatmap, expanded automation services, a technology section, and a validated inquiry form.

## Files

- `index.html` — existing page structure, upgraded content, performance and service sections
- `styles.css` — original styling plus responsive premium charcoal/bronze dashboard styles
- `script.js` — original navigation and product modal plus chart rendering, heatmap, detailed statistics, and form validation
- `config.js` — editable brand/contact/product settings
- `performance-data.json` — data extracted from the supplied workbook; charts read from this file
- `assets/favicon.svg` — site favicon

## Run locally on Windows

Use a local server because the charts load `performance-data.json` using `fetch()`.

1. Extract the ZIP.
2. Open PowerShell in the extracted `veltriq-capital-upgraded` folder.
3. Run:

   ```powershell
   py -m http.server 8000
   ```

4. Visit `http://localhost:8000`.
5. Keep the terminal open while testing. Press `Ctrl+C` to stop the server.

## Performance data and integrity

Source: supplied workbook, worksheets `Sheet1` and `Annual & Monthly PnL`.

- Reporting period: 03 Jan 2021 – 02 Oct 2026.
- Results are combined across four strategies; no individual-strategy results are inferred.
- Values are shown in account-currency units because the workbook does not confirm the currency.
- The workbook does not establish whether results are backtested, simulated, or live, or whether they were independently audited.
- 2026 is year-to-date through 2 October 2026, not a completed year.
- Missing 2026 November and December heatmap observations remain `null`, not zero.
- No equity curve, CAGR, percentage return, or live-data feed is fabricated.
- The maximum drawdown metric is labeled as closed-trade drawdown, not intratrade equity drawdown.

## Configure contact links

Open `config.js` in a text editor and set only real contact details:

- `whatsappUrl`: e.g. `https://wa.me/91...`
- `email`: a business email address, without `mailto:`
- `instagramUrl`, `telegramUrl`, `tradingViewUrl`: actual public profile links if needed.

The form validates required fields locally. If `email` is configured, the submit button opens a prefilled email draft; it does not send the message automatically. If you need real form submissions, configure and test a backend/form provider and wire it securely. The current static project intentionally does not pretend a message was delivered. `contactFormEndpoint` is a placeholder only; the current front-end does not post to it.

Do not place API keys, broker passwords, webhook secrets, or credentials in public JavaScript/configuration files.

## Hosting

For this static website, Cloudflare Pages or any static host that serves HTML/CSS/JS/JSON/SVG is suitable. Upload the entire folder, preserve the `assets` directory, and use the folder root as the static site root. No build command is required. Test the deployed site before sharing it. A custom domain is optional.

## Production checklist

- [ ] Configure and test real contact destinations.
- [ ] Test desktop, tablet, and mobile layouts.
- [ ] Confirm chart values against the supplied workbook before publishing.
- [ ] Confirm the reporting methodology and whether results are backtest, simulation, or live before making any stronger claim.
- [ ] Confirm account currency before adding a currency symbol.
- [ ] Add a backend/form provider if inquiries must be submitted rather than prepared as an email draft.
- [ ] Review legal/regulatory requirements applicable to the services and jurisdictions where they are offered.
- [ ] Test integrations in demo environments; compatibility and execution outcomes are not guaranteed.

Trading involves risk. Historical performance does not guarantee future results. Website information is not individualized investment advice.


## DHURANDHAR dashboard update

The performance section now presents the **Our Flagship Strategy / DHURANDHAR / Precision. Discipline. Performance.** heading, a year-wise P&L heatmap, a multi-year zero-based cumulative P&L curve with Last 3 Years / Last 5 Years selection, and a separate 2026 YTD equity curve. Existing KPI values and the calendar-month aggregate chart are retained.

The workbook provides monthly P&L observations for the equity curves, not individual trade timestamps or an opening account balance. Accordingly, the curves use monthly chronological points and a zero baseline, and the Y-axis represents cumulative P&L rather than account balance. Annual heatmap figures use the workbook's annual totals; 2026 is YTD through 2 October 2026.
