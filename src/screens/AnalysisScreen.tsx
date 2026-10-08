import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { fetchQuoteSummary } from '../services/yahooFinance';
import { useAppStore } from '../store/useAppStore';
import MetricCard from '../components/MetricCard';

export default function AnalysisScreen() {
  const { selectedSymbol, setQuote, quote } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchQuoteSummary(selectedSymbol);
        setQuote(result);
      } catch (error) {
        console.error('Analysis load failed', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedSymbol]);

  const metrics = [
    { label: 'P/E', value: quote?.peRatio ? quote.peRatio.toFixed(1) : 'N/A', subtitle: 'Valuation' },
    { label: 'P/S', value: quote ? (quote.marketCap / (quote.price * 1_000_000)).toFixed(2) : 'N/A', subtitle: 'Revenue multiple' },
    { label: 'Dividend', value: quote?.dividendYield ? `${quote.dividendYield.toFixed(2)}%` : 'N/A', subtitle: 'Yield' },
    { label: 'Beta', value: quote?.beta ? quote.beta.toFixed(2) : 'N/A', subtitle: 'Risk' },
  ];

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
