# ShopSavvy for Alfred

Search products, compare prices, and browse deals from Alfred.

## Keywords

- **`ss`** `<query>` — Search products (e.g., `ss AirPods Pro`)
- **`ssp`** `<identifier>` — Check prices for a product by ASIN/barcode/URL
- **`ssd`** — Browse trending deals

## Actions

- **Enter** — Open in browser
- **Cmd+Enter** — Copy identifier
- **Alt+Enter** — Check prices (from search results)

## Setup

1. Download the `.alfredworkflow` file from [Releases](https://github.com/shopsavvy/alfred-shopsavvy/releases)
2. Double-click to install
3. Set your API key in the workflow variables (`api_key`)
4. Get your API key at [shopsavvy.com/data](https://shopsavvy.com/data)

## Requirements

- [Alfred Powerpack](https://www.alfredapp.com/powerpack/)
- [Bun](https://bun.sh) runtime

## Development

```bash
git clone https://github.com/shopsavvy/alfred-shopsavvy.git
cd alfred-shopsavvy
bun install

# Test search
SHOPSAVVY_API_KEY=ss_live_yourkey bun run src/search.ts "AirPods Pro"

# Test price check
SHOPSAVVY_API_KEY=ss_live_yourkey bun run src/price.ts B0D1XD1ZV3

# Test deals
SHOPSAVVY_API_KEY=ss_live_yourkey bun run src/deals.ts
```

## License

MIT
