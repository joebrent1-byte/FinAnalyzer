export type Quote = {
  symbol: string;
  shortName: string;
  price: number;
  changePercent: number;
  marketCap: number;
  previousClose: number;
  currency: string;
  peRatio?: number;
  dividendYield?: number;
  beta?: number;
  volume?: number;
};

export type PortfolioHolding = {
  symbol: string;
  shares: number;
  avgCost: number;
};

export type MarketDataPoint = {
  label: string;
  value: number;
};
