# Inventory & Sales Dashboard

A responsive inventory and sales dashboard built with plain HTML, CSS and JavaScript. It tracks products and sample sales, shows key metrics, lets you search, filter and add products, and exports reports to PDF or Excel.

**Live demo:** [inventory.renzzogg.com](https://inventory.renzzogg.com)

## Features

- **Dashboard:** product count, revenue for the last 30 days, low-stock items and total inventory value, plus low-stock and recent-sales lists. Every number is calculated from the sample data, so the cards always agree with each other.
- **Products:** search by name or category combined with a category filter, low-stock badges, and an accessible "Add product" form with validation (keyboard friendly, closes with Escape).
- **Sales:** order history with date, quantity, unit price and total.
- **Reports:** inventory and revenue summarized by category, with totals that match the dashboard.
- **Settings:** change the low-stock threshold or reset the demo data.
- **Export to PDF and Excel:** the Products page exports the filtered list; Reports exports the full inventory. PDFs paginate automatically and Excel keeps prices as numbers with currency formatting.
- **US formatting:** prices and dates use `Intl.NumberFormat` / `Intl.DateTimeFormat` (`$1,149.00`, `Oct 19, 2026`).
- **Responsive:** the sidebar becomes a top navigation bar on tablets and phones, and wide tables scroll horizontally.

Navigation uses URL hashes (`#products`, `#sales`, …), so the browser's back button works without any server configuration. The data is sample data kept in memory, so changes reset when the page reloads. Sample sales dates are relative to today, so the demo always shows recent activity.

## Tech stack

- HTML
- CSS
- JavaScript (no frameworks, no build step)
- [jsPDF](https://github.com/parallax/jsPDF) 2.5.1 (loaded from cdnjs)
- [SheetJS](https://sheetjs.com/) 0.18.5 (loaded from cdnjs)

## Run it locally

No installation needed. From the repository root, start any static server, for example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. You can also open `index.html` directly in the browser. An internet connection is needed for the PDF and Excel export libraries.

## Deployment

Deployed on [Railway](https://railway.com) as a static site at [inventory.renzzogg.com](https://inventory.renzzogg.com). Railway's builder (Railpack) detects `index.html` in the repository root and serves the folder as static files.

## Part of my portfolio

This project is part of the portfolio of **Renzzo Gracia Gomez** — see more at [renzzogg.com](https://renzzogg.com).
