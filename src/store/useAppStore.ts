import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PortfolioHolding, Quote } from '../types';

type AppState = {
  selectedSymbol: string;
  watchlist: string[];
  portfolio: PortfolioHolding[];
  quote: Quote | null;
  setSelectedSymbol: (symbol: string) => void;
  setQuote: (quote: Quote | null) => void;
  setWatchlist: (symbols: string[]) => void;
  addToPortfolio: (holding: PortfolioHolding) => void;
  removeFromPortfolio: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedSymbol: 'AAPL',
      watchlist: ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'META'],
      portfolio: [
        { symbol: 'AAPL', shares: 20, avgCost: 175 },
        { symbol: 'MSFT', shares: 10, avgCost: 320 },
        { symbol: 'NVDA', shares: 8, avgCost: 132 },
      ],
      quote: null,
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol.toUpperCase() }),
      setQuote: (quote) => set({ quote }),
      setWatchlist: (symbols) => set({ watchlist: symbols }),
      removeFromWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
        })),
      addToPortfolio: (holding) =>
        set((state) => {
          const existing = state.portfolio.find((item) => item.symbol === holding.symbol);
          if (existing) {
            return {
              portfolio: state.portfolio.map((item) =>
                item.symbol === holding.symbol
                  ? {
                      ...item,
                      shares: item.shares + holding.shares,
                      avgCost: (item.avgCost + holding.avgCost) / 2,
                    }
                  : item,
              ),
            };
          }

          return { portfolio: [...state.portfolio, holding] };
        }),
      removeFromPortfolio: (symbol) =>
        set((state) => ({
          portfolio: state.portfolio.filter((item) => item.symbol !== symbol),
        })),
    }),
    {
      name: 'finanalyzer-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
