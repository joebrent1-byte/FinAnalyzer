import { create } from 'zustand';
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
};

export const useAppStore = create<AppState>((set) => ({
  selectedSymbol: 'AAPL',
  watchlist: ['AAPL', 'MSFT', 'NVDA', 'AMZN'],
  portfolio: [
    { symbol: 'AAPL', shares: 20, avgCost: 175 },
    { symbol: 'MSFT', shares: 10, avgCost: 320 },
  ],
  quote: null,
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setQuote: (quote) => set({ quote }),
  setWatchlist: (symbols) => set({ watchlist: symbols }),
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
}));
