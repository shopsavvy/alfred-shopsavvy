#!/usr/bin/env bun
import { ShopSavvyDataAPI } from "@shopsavvy/sdk"

const apiKey = process.env.api_key || process.env.SHOPSAVVY_API_KEY
if (!apiKey) {
  console.log(JSON.stringify({
    items: [{
      title: "API Key Not Set",
      subtitle: "Set your ShopSavvy API key in the workflow variables",
      icon: { path: "icon.png" },
      valid: false,
    }]
  }))
  process.exit(0)
}

const query = process.argv[2] || ""
if (!query) {
  console.log(JSON.stringify({
    items: [{
      title: "Search ShopSavvy",
      subtitle: "Type a product name to search...",
      icon: { path: "icon.png" },
      valid: false,
    }]
  }))
  process.exit(0)
}

async function main() {
  try {
    const client = new ShopSavvyDataAPI({ apiKey: apiKey! })
    const result = await client.searchProducts(query, { limit: 9 })
    const products = result.data || []

    if (products.length === 0) {
      console.log(JSON.stringify({
        items: [{
          title: "No products found",
          subtitle: `No results for "${query}"`,
          icon: { path: "icon.png" },
          valid: false,
        }]
      }))
      return
    }

    const items = products.map((product: any) => {
      const name = product.name || product.title || "Unknown Product"
      const price = product.lowest_price ?? product.price
      const priceStr = price != null ? `$${Number(price).toFixed(2)}` : ""
      const brand = product.brand ? ` — ${product.brand}` : ""
      const identifier = product.asin || product.upc || product.barcode || ""
      const url = product.shopsavvy_url || product.url || `https://shopsavvy.com`

      return {
        uid: identifier || name,
        title: name,
        subtitle: `${priceStr}${brand}`,
        arg: url,
        icon: { path: "icon.png" },
        mods: {
          cmd: {
            subtitle: identifier ? `Copy: ${identifier}` : "No identifier",
            arg: identifier,
          },
          alt: {
            subtitle: `Check prices for ${identifier || name}`,
            arg: identifier,
          },
        },
        text: {
          copy: identifier || name,
          largetype: `${name}\n${priceStr}${brand}`,
        },
      }
    })

    console.log(JSON.stringify({ items }))
  } catch (err: any) {
    console.log(JSON.stringify({
      items: [{
        title: "Error",
        subtitle: err.message || "Search failed",
        icon: { path: "icon.png" },
        valid: false,
      }]
    }))
  }
}

main()
