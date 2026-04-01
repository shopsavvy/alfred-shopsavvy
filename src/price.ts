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

const identifier = process.argv[2] || ""
if (!identifier) {
  console.log(JSON.stringify({
    items: [{
      title: "Check Price",
      subtitle: "Enter an ASIN, barcode, or product URL...",
      icon: { path: "icon.png" },
      valid: false,
    }]
  }))
  process.exit(0)
}

async function main() {
  try {
    const client = new ShopSavvyDataAPI({ apiKey: apiKey! })
    const result = await client.getCurrentOffers(identifier)
    const product = result.data?.[0] || result.data || {}
    const offers = product.offers || product.data || []

    if (offers.length === 0) {
      console.log(JSON.stringify({
        items: [{
          title: "No offers found",
          subtitle: `No prices available for ${identifier}`,
          icon: { path: "icon.png" },
          valid: false,
        }]
      }))
      return
    }

    const sorted = [...offers].sort((a: any, b: any) =>
      parseFloat(a.price ?? a.price_retailer ?? Infinity) - parseFloat(b.price ?? b.price_retailer ?? Infinity)
    )

    const items = sorted.map((offer: any, i: number) => {
      const price = parseFloat(offer.price ?? offer.price_retailer ?? 0)
      const retailer = offer.retailer || offer.store || offer.merchant || "Unknown"
      const condition = offer.condition ? ` (${offer.condition})` : ""
      const best = i === 0 ? " ★ Best Price" : ""

      return {
        uid: `${retailer}-${i}`,
        title: `$${price.toFixed(2)} — ${retailer}${best}`,
        subtitle: `${condition}`.trim(),
        arg: offer.url || "",
        icon: { path: "icon.png" },
        text: {
          copy: `$${price.toFixed(2)} at ${retailer}`,
          largetype: `$${price.toFixed(2)} at ${retailer}${condition}`,
        },
      }
    })

    console.log(JSON.stringify({ items }))
  } catch (err: any) {
    console.log(JSON.stringify({
      items: [{
        title: "Error",
        subtitle: err.message || "Price check failed",
        icon: { path: "icon.png" },
        valid: false,
      }]
    }))
  }
}

main()
