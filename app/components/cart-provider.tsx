"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PrintFormat } from "../data/products";

export type CartFrame = "unframed" | "standard-black" | "aluminium-silver" | "aluminium-black" | "aluminium-gold";
export type CartItem = {
  key: string;
  type: "product" | "surprise";
  productId?: string;
  slug?: string;
  title: string;
  artist?: string;
  image?: string | null;
  format?: PrintFormat;
  frameId?: CartFrame;
  quantity: number;
  unitPrice: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "key" | "quantity">) => void;
  addSurprise: () => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  upgradeFrame: (key: string, frameId: CartFrame, surcharge: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "cgm-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]"); if (Array.isArray(saved)) setItems(saved); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) window.localStorage.setItem(storageKey, JSON.stringify(items)); }, [items, ready]);
  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    addItem: item => setItems(current => {
      const key = `${item.productId}-${item.format}-${item.frameId}`;
      const existing = current.find(entry => entry.key === key);
      return existing ? current.map(entry => entry.key === key ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { ...item, key, quantity: 1 }];
    }),
    addSurprise: () => setItems(current => {
      const existing = current.find(entry => entry.key === "surprise-postcards");
      return existing ? current.map(entry => entry.key === existing.key ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { key: "surprise-postcards", type: "surprise", title: "5 Surprise-Postkarten", quantity: 1, unitPrice: 10 }];
    }),
    removeItem: key => setItems(current => current.filter(item => item.key !== key)),
    setQuantity: (key, quantity) => setItems(current => quantity < 1 ? current.filter(item => item.key !== key) : current.map(item => item.key === key ? { ...item, quantity } : item)),
    upgradeFrame: (key, frameId, surcharge) => setItems(current => current.map(item => item.key === key ? { ...item, key: `${item.productId}-${item.format}-${frameId}`, frameId, unitPrice: item.unitPrice + surcharge } : item)),
    clear: () => setItems([]),
  }), [items, ready]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
