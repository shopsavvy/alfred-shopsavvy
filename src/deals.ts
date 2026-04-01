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

async function main() {
  try {
    const client = new ShopSavvyDataAPI({ apiKey: apiKey! })
    const result = await client.getDeals({ limit: 15, sort: "hot" as any })
    const deals = result.data || []

    if (deals.length === 0) {
      console.log(JSON.stringify({
        items: [{
          title: "No deals right now",
          subtitle: "Check back later for new deals",
          icon: { path: "icon.png" },
          valid: false,
        }]
      }))
      return
    }

    const items = deals.map((deal: any, i: number) => {
      const title = deal.title || deal.name || "Untitled Deal"
      const grade = deal.grade ? `[${deal.grade}] ` : ""
      const votes = deal.votes != null ? ` (${deal.votes > 0 ? "+" : ""}${deal.votes} votes)` : ""
      const url = deal.url || (deal.path ? `https://shopsavvy.com${deal.path}` : "https://shopsavvy.com")

      return {
        uid: `deal-${i}`,
        title: `${grade}${title}`,
        subtitle: votes.trim(),
        arg: url,
        icon: { path: "icon.png" },
        text: {
          copy: title,
          largetype: `${title}${votes}`,
        },
      }
    })

    console.log(JSON.stringify({ items }))
  } catch (err: any) {
    console.log(JSON.stringify({
      items: [{
        title: "Error",
        subtitle: err.message || "Failed to load deals",
        icon: { path: "icon.png" },
        valid: false,
      }]
    }))
  }
}

main()
