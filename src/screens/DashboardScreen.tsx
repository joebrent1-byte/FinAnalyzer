import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { fetchChartData, fetchQuoteSummary, searchSymbol } from '../services/yahooFinance';
import { useAppStore } from '../store/useAppStore';
import MetricCard from '../components/MetricCard';
import StockChart from '../components/StockChart';

export default function DashboardScreen() {
  const { selectedSymbol, setSelectedSymbol, quote, setQuote } = useAppStore();
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [summary, history] = await Promise.all([
          fetchQuoteSummary(selectedSymbol),
          fetchChartData(selectedSymbol),
        ]);

        setQuote(summary);
        setChartData(history);
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSymbol]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Market overview</Text>

      <TextInput
        value={selectedSymbol}
        onChangeText={setSelectedSymbol}
        placeholder="Enter ticker"
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#60A5FA" style={{ marginVertical: 24 }} />
      ) : (
        <>
          <View style={styles.heroCard}>
            <Text style={styles.ticker}>{quote?.symbol ?? selectedSymbol}</Text>
            <Text style={styles.price}>${quote?.price?.toFixed(2) ?? '0.00'}</Text>
            <Text style={styles.change}>{quote?.changePercent ? `${quote.changePercent.toFixed(2)}%` : '0.00%'}</Text>
            <Text style={styles.subtitle}>{quote?.shortName ?? 'Market data'}</Text>
          </View>

          <View style={styles.metricsRow}>
            <MetricCard label="Market Cap" value={quote ? `$${(quote.marketCap / 1_000_000_000).toFixed(1)}B` : '$0.0B'} />
            <MetricCard label="P/E" value={quote?.peRatio ? quote.peRatio.toFixed(1) : 'N/A'} />
            <MetricCard label="Dividend" value={quote?.dividendYield ? `${quote.dividendYield.toFixed(2)}%` : 'N/A'} />
            <MetricCard label="Beta" value={quote?.beta ? quote.beta.toFixed(2) : 'N/A'} />
          </View>

          {chartData.length > 0 ? <StockChart data={chartData} /> : null}
        </>
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
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  ticker: {
    color: '#93C5FD',
    fontSize: 18,
    fontWeight: '700',
  },
  price: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 8,
  },
  change: {
    color: '#4ADE80',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
