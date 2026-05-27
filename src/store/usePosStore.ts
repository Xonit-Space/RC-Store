import { create } from 'zustand';

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    imageUrl?: string;
}

interface PosState {
    orderItems: OrderItem[];
    addItem: (item: { id: number | string; name: string; price: number; image?: string }) => void;
    increaseQty: (id: string) => void;
    decreaseQty: (id: string) => void;
    setQty: (id: string, qty: number) => void;
    clearCart: () => void;
}

export const usePosStore = create<PosState>((set) => ({
    orderItems: [],
    addItem: (item) => set((state) => {
        const existing = state.orderItems.find((it) => it.id === String(item.id));
        if (existing) {
            return {
                orderItems: state.orderItems.map((it) =>
                    it.id === String(item.id) ? { ...it, qty: it.qty + 1 } : it
                ),
            };
        }
        return {
            orderItems: [
                ...state.orderItems,
                {
                    id: String(item.id),
                    name: item.name,
                    price: item.price,
                    qty: 1,
                    imageUrl: item.image,
                },
            ],
        };
    }),
    increaseQty: (id) => set((state) => ({
        orderItems: state.orderItems.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it)),
    })),
    decreaseQty: (id) => set((state) => ({
        orderItems: state.orderItems
            .map((it) => (it.id === id ? { ...it, qty: it.qty - 1 } : it))
            .filter((it) => it.qty > 0),
    })),
    setQty: (id, qty) => set((state) => ({
        orderItems: state.orderItems.map((it) => (it.id === id ? { ...it, qty } : it)),
    })),
    clearCart: () => set({ orderItems: [] }),
}));
