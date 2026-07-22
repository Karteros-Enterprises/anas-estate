import type { CartItemInput } from "../types/cart";

export function dedupeCartItems(items: CartItemInput[]): CartItemInput[] {
    const quantities = new Map<string, number>();
  
    for (const item of items) {
      const next = (quantities.get(item.sku) ?? 0) + item.quantity;
      quantities.set(item.sku, Math.min(99, next));
    }
  
    return Array.from(quantities.entries()).map(([sku, quantity]) => ({ sku, quantity }));
  }