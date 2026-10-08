import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { fetchQuoteSummary, formatCompactNumber } from '../services/yahooFinance';
import { useAppStore } from '../store/useAppStore';

export default function PortfolioScreen() {
  const { portfolio } = useAppStore();
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const result: Record<string, number> = {};

      for (const holding of portfolio) {
        try {
          const quote = await fetchQuoteSummary(holding.symbol);
          result[holding.symbol] = quote.price;
        } catch (error) {
          console.error(`Could not fetch price for ${holding.symbol}:`, error);
        }
      }

      setPrices(result);
    };

    load();
  }, [portfolio]);

  const totalInvested = useMemo(
    () => portfolio.reduce((sum, holding) => sum + holding.shares * holding.avgCost, 0),
    [portfolio],
  );

  const totalValue = useMemo(
    () => portfolio.reduce((sum, holding) => sum + holding.shares * (prices[holding.symbol] ?? holding.avgCost), 0),
    [portfolio, prices],
  );

  const gain = totalValue - totalInvested;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Portfolio</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Invested capital</Text>
        <Text style={styles.value}>{formatCompactNumber(totalInvested)}</Text>
        <Text style={[styles.change, { color: gain >= 0 ? '#4ADE80' : '#F87171' }]}>
          {gain >= 0 ? '+' : '-'}{formatCompactNumber(Math.abs(gain))}
        </Text>
      </View>

      {portfolio.map((holding) => {
        const currentValue = holding.shares * (prices[holding.symbol] ?? holding.avgCost);
        const currentPrice = prices[holding.symbol] ?? holding.avgCost;

        return (
          <View key={holding.symbol} style={styles.holdingRow}>
            <View>
              <Text style={styles.symbol}>{holding.symbol}</Text>
              <Text style={styles.meta}>{holding.shares} shares</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.symbol}>{formatCompactNumber(currentValue)}</Text>
              <Text style={styles.meta}>@ ${currentPrice.toFixed(2)}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020817',
  },
  content: {
    padding: 16,
  },
  header: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  value: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 8,
  },
  change: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  symbol: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 16,
  },
  meta: {
    color: '#94A3B8',
    marginTop: 4,
  },
});
