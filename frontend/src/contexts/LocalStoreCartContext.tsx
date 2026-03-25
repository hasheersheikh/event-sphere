import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartProduct {
  storeId: string;
  storeName: string;
  productId: string;
  name: string;
  price: number;
  discountPercent?: number;
  image?: string;
  quantity: number;
}

interface LocalStoreCartContextType {
  items: CartProduct[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartProduct, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const LocalStoreCartContext = createContext<LocalStoreCartContextType | undefined>(undefined);

export const LocalStoreCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartProduct, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => {
    const discounted = i.price * (1 - (i.discountPercent || 0) / 100);
    return sum + discounted * i.quantity;
  }, 0);

  return (
    <LocalStoreCartContext.Provider
      value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}
    >
      {children}
    </LocalStoreCartContext.Provider>
  );
};

export const useLocalStoreCart = () => {
  const ctx = useContext(LocalStoreCartContext);
  if (!ctx) throw new Error("useLocalStoreCart must be used within LocalStoreCartProvider");
  return ctx;
};
