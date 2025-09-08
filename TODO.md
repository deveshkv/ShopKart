# TODO List for Replacing Gender with Color Filter

## 1. Update app.py
- [x] Add helper functions to extract color and brand from text
- [x] Update scrape_flipkart to add color and brand
- [x] Update scrape_amazon to add color and brand
- [x] Update scrape_myntra to add color and brand
- [x] Update scrape_google_shopping to add color and brand
- [x] Update /api/search to include Myntra products

## 2. Update templates/products.html
- [x] Replace gender select with color select

## 3. Update static/js/products.js
- [x] Add function to populate color options from products
- [x] Update applyFilters to filter by color instead of gender
- [x] Add fallback logic for brand and color filters
