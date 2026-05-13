import { create } from 'zustand';
import { Product, QuoteItem, PriceCalculation } from '../types';

interface ClientData {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  cuit: string;
  notas: string;
}

interface QuoteStore {
  // Steps
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Client data
  clientData: ClientData;
  setClientData: (data: Partial<ClientData>) => void;

  // Selected items
  items: QuoteItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, updates: Partial<QuoteItem>) => void;
  clearItems: () => void;

  // Price calculation
  calculation: PriceCalculation | null;
  setCalculation: (calc: PriceCalculation) => void;
  descuentoPct: number;
  setDescuento: (pct: number) => void;

  // Submitted quote
  submittedQuoteId: string | null;
  submittedQuoteNumero: string | null;
  setSubmitted: (id: string, numero: string) => void;

  // Reset
  reset: () => void;
}

const defaultClient: ClientData = {
  nombre: '', email: '', telefono: '', empresa: '', cuit: '', notas: '',
};

export const useQuoteStore = create<QuoteStore>((set) => ({
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

  clientData: defaultClient,
  setClientData: (data) => set((s) => ({ clientData: { ...s.clientData, ...data } })),

  items: [],
  addItem: (product) =>
    set((s) => {
      if (s.items.find((i) => i.productId === product.id)) return s;
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 86400000);
      return {
        items: [
          ...s.items,
          {
            productId: product.id,
            product,
            cantidad: 1,
            fechaInicio: today.toISOString().split('T')[0],
            fechaFin: nextWeek.toISOString().split('T')[0],
          },
        ],
      };
    }),
  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  updateItem: (productId, updates) =>
    set((s) => ({
      items: s.items.map((i) => (i.productId === productId ? { ...i, ...updates } : i)),
    })),
  clearItems: () => set({ items: [] }),

  calculation: null,
  setCalculation: (calc) => set({ calculation: calc }),
  descuentoPct: 0,
  setDescuento: (pct) => set({ descuentoPct: pct }),

  submittedQuoteId: null,
  submittedQuoteNumero: null,
  setSubmitted: (id, numero) => set({ submittedQuoteId: id, submittedQuoteNumero: numero }),

  reset: () =>
    set({
      currentStep: 1,
      clientData: defaultClient,
      items: [],
      calculation: null,
      descuentoPct: 0,
      submittedQuoteId: null,
      submittedQuoteNumero: null,
    }),
}));
