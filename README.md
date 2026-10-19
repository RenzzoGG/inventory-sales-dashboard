# Inventory & Sales Dashboard

A responsive inventory and sales dashboard built with plain HTML, CSS and JavaScript. It shows a product list with summary cards, lets you search, filter and add products, and exports the current list to PDF or Excel.

**Live demo:** [inventory.renzzogg.com](https://inventory.renzzogg.com)

## Features

- **Summary cards:** total products, total sales, low-stock items and monthly revenue.
- **Search:** filter the product table by name as you type.
- **Category filter:** show only the products of one category.
- **Add products:** add new items through a modal form; the table and cards update instantly.
- **Export to PDF:** download the product list as `inventory_report.pdf` (jsPDF).
- **Export to Excel:** download the product list as `inventory_report.xlsx` (SheetJS).

The data is sample data kept in memory, so changes reset when the page reloads.

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
