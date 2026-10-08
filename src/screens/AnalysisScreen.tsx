import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { formatCompactNumber } from '../services/yahooFinance';
import MetricCard from '../components/MetricCard';

export default function AnalysisScreen() {
  const { selectedSymbol, quote } = useAppStore();
  const [loading] = useState(false);

  const metrics = useMemo(
    () => [
      { label: 'Price', value: quote ? `$${quote.price.toFixed(2)}` : 'N/A', subtitle: 'Current' },
      { label: 'Market Cap', value: quote ? formatCompactNumber(quote.marketCap) : 'N/A', subtitle: 'Size' },
      { label: 'Dividend', value: quote?.dividendYield ? `${quote.dividendYield.toFixed(2)}%` : 'N/A', subtitle: 'Yield' },
      { label: 'Beta', value: quote?.beta ? quote.beta.toFixed(2) : 'N/A', subtitle: 'Volatility' },
    ],
    [quote],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Ratio analysis</Text>
      <Text style={styles.symbol}>{selectedSymbol}</Text>

      {loading ? (
        <Text style={styles.loading}>Loading ratios...</Text>
      ) : (
        <View style={styles.grid}>
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              subtitle={metric.subtitle}
              accent="#38BDF8"
            />
          ))}
        </View>
      )}
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
    marginBottom: 8,
  },
  symbol: {
    color: '#93C5FD',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loading: {
    color: '#CBD5E1',
    fontSize: 16,
    marginTop: 10,
  },
});
