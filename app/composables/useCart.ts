import type { CartItem } from '#shared/types';

const STORAGE_KEY = 'anas-estate-cart';
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

let persistenceBound = false;

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(quantity)));
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.sku === 'string' && item.sku.trim().length > 0 && typeof item.quantity === 'number';
}

function normalizeCart(items: CartItem[]): CartItem[] {
  const quantities = new Map<string, number>();

  for (const item of items) {
    const sku = item.sku.trim();
    if (!sku) continue;
    const next = (quantities.get(sku) ?? 0) + clampQuantity(item.quantity);
    quantities.set(sku, Math.min(MAX_QUANTITY, next));
  }

  return Array.from(quantities.entries()).map(([sku, quantity]) => ({ sku, quantity }));
}

function readStoredCart(): CartItem[] {
  if (!import.meta.client) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return normalizeCart(parsed.filter(isCartItem));
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartItem[]): void {
  if (!import.meta.client) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useCart() {
  const items = useState<CartItem[]>('cart', () => []);
  const hydrated = useState('cart-hydrated', () => false);

  if (import.meta.client && !persistenceBound) {
    persistenceBound = true;

    watch(
      items,
      (next) => {
        if (!hydrated.value) return;
        writeStoredCart(normalizeCart(next));
      },
      { deep: true },
    );

    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return;
      items.value = readStoredCart();
    });
  }

  onMounted(() => {
    if (!import.meta.client || hydrated.value) return;
    items.value = readStoredCart();
    hydrated.value = true;
  });

  const itemCount = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  );

  function quantityFor(sku: string): number {
    return items.value.find((item) => item.sku === sku)?.quantity ?? 0;
  }

  function setCart(next: CartItem[]): void {
    items.value = normalizeCart(next);
  }

  function addItem(sku: string, quantity = 1): void {
    const cart = [...items.value];
    const existing = cart.find((item) => item.sku === sku);
    if (existing) {
      existing.quantity = clampQuantity(existing.quantity + quantity);
    } else {
      cart.push({ sku, quantity: clampQuantity(quantity) });
    }
    setCart(cart);
  }

  function setQuantity(sku: string, quantity: number): void {
    if (quantity < MIN_QUANTITY) {
      removeItem(sku);
      return;
    }
    const cart = items.value.filter((item) => item.sku !== sku);
    cart.push({ sku, quantity: clampQuantity(quantity) });
    setCart(cart);
  }

  function removeItem(sku: string): void {
    setCart(items.value.filter((item) => item.sku !== sku));
  }

  function clearCart(): void {
    setCart([]);
  }

  return {
    items,
    hydrated,
    itemCount,
    quantityFor,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    setCart,
  };
}
