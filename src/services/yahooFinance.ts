import axios from 'axios';
import type { Quote } from '../types';

const yahooClient = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0',
  },
});

type SearchQuoteResult = {
  symbol: string;
  shortname?: string;
  longname?: string;
  exch?: string;
  typeDisp?: string;
};

export async function searchSymbol(query: string): Promise<SearchQuoteResult[]> {
  const safeQuery = query.trim();
  if (!safeQuery) {
    return [];
  }

  const response = await yahooClient.get('https://query1.finance.yahoo.com/v1/finance/search', {
    params: {
      q: safeQuery,
      quotesCount: 8,
      newsCount: 0,
    },
  });

  return (response.data?.quotes ?? []).filter(
    (item: SearchQuoteResult) => item.symbol && (item.typeDisp === 'Equity' || item.typeDisp === undefined),
  );
}

export async function fetchQuoteSummary(symbol: string): Promise<Quote> {
  const ticker = symbol.toUpperCase();
  const response = await yahooClient.get(
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}`,
    {
      params: {
        modules: 'price,financialData,defaultKeyStatistics,summaryDetail',
      },
    },
  );

  const result = response.data?.quoteSummary?.result?.[0];
  if (!result) {
    throw new Error(`No quote summary found for ${ticker}`);
  }

  const price = Number(result.price?.regularMarketPrice?.raw ?? result.price?.regularMarketPrice ?? 0);
  const previousClose = Number(result.price?.regularMarketPreviousClose?.raw ?? price);
  const changePercent = previousClose ? ((price - previousClose) / previousClose) * 100 : 0;

  return {
    symbol: result.price?.symbol ?? ticker,
    shortName: result.price?.shortName ?? ticker,
    price,
    changePercent,
    marketCap: Number(result.price?.marketCap?.raw ?? result.summaryDetail?.marketCap?.raw ?? 0),
    previousClose,
    currency: result.price?.currency ?? 'USD',
    peRatio: result.defaultKeyStatistics?.trailingPE?.raw ?? null,
    dividendYield: result.summaryDetail?.dividendYield?.raw ?? result.financialData?.dividendYield?.raw ?? null,
    beta: result.defaultKeyStatistics?.beta?.raw ?? null,
    volume: result.summaryDetail?.volume?.raw ?? null,
    evEbitda: result.defaultKeyStatistics?.enterpriseToEbitda?.raw ?? null,
    evEbit: result.defaultKeyStatistics?.enterpriseToEbit?.raw ?? null,
  };
}

export async function fetchChartData(symbol: string): Promise<number[]> {
  const ticker = symbol.toUpperCase();
  const response = await yahooClient.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`, {
    params: {
      range: '1mo',
      interval: '1d',
    },
  });

  const points = response.data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
  return points.filter((value: number | null) => value !== null && value > 0).slice(-30);
}

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return '$0';
  }

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return `$${value.toFixed(0)}`;
}
