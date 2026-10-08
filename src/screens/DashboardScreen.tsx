import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchChartData, fetchQuoteSummary, formatCompactNumber } from '../services/yahooFinance';
import { useAppStore } from '../store/useAppStore';
import MetricCard from '../components/MetricCard';
import StockChart from '../components/StockChart';
import { brand } from '../theme';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { selectedSymbol, setSelectedSymbol, quote, setQuote, watchlist } = useAppStore();
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbolInput, setSymbolInput] = useState(selectedSymbol);

  useEffect(() => {
    setSymbolInput(selectedSymbol);
  }, [selectedSymbol]);

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
  }, [selectedSymbol, setQuote]);

  const marketMetrics = useMemo(
    () => [
      { label: 'Market Cap', value: quote ? formatCompactNumber(quote.marketCap) : '$0', subtitle: 'Size' },
      { label: 'P/E', value: quote?.peRatio ? quote.peRatio.toFixed(1) : 'N/A', subtitle: 'Valuation' },
      { label: 'Dividend', value: quote?.dividendYield ? `${quote.dividendYield.toFixed(2)}%` : 'N/A', subtitle: 'Yield' },
      { label: 'Beta', value: quote?.beta ? quote.beta.toFixed(2) : 'N/A', subtitle: 'Risk' },
    ],
    [quote],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Investment overview</Text>

      <TextInput
        value={symbolInput}
        onChangeText={setSymbolInput}
        placeholder="Enter ticker"
        placeholderTextColor={brand.textMuted}
        style={styles.input}
        onSubmitEditing={() => setSelectedSymbol(symbolInput)}
        autoCapitalize="characters"
      />

      {loading ? (
        <ActivityIndicator size="large" color={brand.primary} style={{ marginVertical: 24 }} />
      ) : (
        <>
          <Pressable style={styles.heroCard} onPress={() => navigation.navigate('CompanyDetail', { symbol: selectedSymbol })}>
            <Text style={styles.ticker}>{quote?.symbol ?? selectedSymbol}</Text>
            <Text style={styles.price}>${quote?.price?.toFixed(2) ?? '0.00'}</Text>
            <Text style={[styles.change, { color: (quote?.changePercent ?? 0) >= 0 ? brand.success : brand.danger }]}>
              {quote?.changePercent ? `${quote.changePercent.toFixed(2)}%` : '0.00%'}
            </Text>
            <Text style={styles.subtitle}>{quote?.shortName ?? 'Market data'}</Text>
          </Pressable>

          <Text style={styles.sectionLabel}>Watchlist</Text>
          <View style={styles.watchlistRow}>
            {watchlist.map((symbol) => (
              <Pressable
                key={symbol}
                style={[styles.watchChip, symbol === selectedSymbol && styles.watchChipActive]}
                onPress={() => {
                  setSelectedSymbol(symbol);
                  navigation.navigate('CompanyDetail', { symbol });
                }}
              >
                <Text style={styles.watchChipText}>{symbol}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.metricsRow}>
            {marketMetrics.map((metric) => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} subtitle={metric.subtitle} />
            ))}
          </View>

          {chartData.length > 0 ? <StockChart data={chartData} /> : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.background },
  content: { padding: 16 },
  header: { color: brand.text, fontSize: 28, fontWeight: '700', marginBottom: 12 },
  input: {
    backgroundColor: brand.panelAlt,
    color: brand.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: brand.border,
  },
  heroCard: {
    backgroundColor: brand.panel,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: brand.border,
  },
  ticker: { color: brand.primary, fontSize: 18, fontWeight: '700' },
  price: { color: brand.text, fontSize: 36, fontWeight: '800', marginTop: 8 },
  change: { fontSize: 18, fontWeight: '700', marginTop: 6 },
  subtitle: { color: brand.textMuted, marginTop: 8 },
  sectionLabel: { color: brand.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  watchlistRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  watchChip: {
    backgroundColor: brand.panelAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: brand.border,
  },
  watchChipActive: { backgroundColor: brand.panel, borderColor: brand.primary },
  watchChipText: { color: brand.text, fontWeight: '600' },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
