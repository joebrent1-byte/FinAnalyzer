import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { formatCompactNumber } from '../services/yahooFinance';
import { brand } from '../theme';

export default function PortfolioScreen() {
  const navigation = useNavigation<any>();
  const { portfolio, removeFromPortfolio } = useAppStore();

  const totalInvested = portfolio.reduce((sum, holding) => sum + holding.shares * holding.avgCost, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Portfolio</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.label}>Invested capital</Text>
        <Text style={styles.value}>{formatCompactNumber(totalInvested)}</Text>
      </View>

      {portfolio.length === 0 ? (
        <Text style={styles.emptyState}>No positions yet. Add one from the research screen.</Text>
      ) : (
        portfolio.map((holding) => (
          <View key={holding.symbol} style={styles.holdingRow}>
            <Pressable onPress={() => navigation.navigate('CompanyDetail', { symbol: holding.symbol })}>
              <Text style={styles.symbol}>{holding.symbol}</Text>
              <Text style={styles.meta}>{holding.shares} shares</Text>
            </Pressable>
            <View style={styles.rightBlock}>
              <Text style={styles.amount}>${(holding.shares * holding.avgCost).toFixed(2)}</Text>
              <Pressable onPress={() => removeFromPortfolio(holding.symbol)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.background },
  content: { padding: 16 },
  header: { color: brand.text, fontSize: 28, fontWeight: '700', marginBottom: 16 },
  summaryCard: {
    backgroundColor: brand.panel,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: brand.border,
  },
  label: { color: brand.textMuted, textTransform: 'uppercase', letterSpacing: 0.7 },
  value: { color: brand.text, fontSize: 30, fontWeight: '800', marginTop: 8 },
  emptyState: { color: brand.textMuted, fontSize: 14, marginTop: 8 },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: brand.panelAlt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: brand.border,
  },
  symbol: { color: brand.text, fontWeight: '700', fontSize: 16 },
  meta: { color: brand.textMuted, marginTop: 4 },
  rightBlock: { alignItems: 'flex-end' },
  amount: { color: brand.text, fontWeight: '700' },
  deleteButton: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: brand.panel,
  },
  deleteText: { color: brand.danger, fontWeight: '700', fontSize: 12 },
});
