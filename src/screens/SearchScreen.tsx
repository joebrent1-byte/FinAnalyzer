import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { searchSymbol } from '../services/yahooFinance';
import { useAppStore } from '../store/useAppStore';
import { brand } from '../theme';

const sampleFilters = ['Blue Chip', 'Growth', 'Tech', 'Dividend', 'Macro'];

export const mockManagement = [
  {
    name: 'Jane Smith',
    title: 'Chief Executive Officer',
    cv: 'Leads strategic growth initiatives and oversees capital allocation across the group.',
  },
  {
    name: 'Michael Chen',
    title: 'Chief Financial Officer',
    cv: 'Responsible for financial planning, liquidity management, and investor communication.',
  },
  {
    name: 'Sofia Alvarez',
    title: 'Chief Operating Officer',
    cv: 'Drives operational efficiency, margin improvement, and execution of the operating plan.',
  },
];

export default function SearchScreen() {
  const { watchlist, setWatchlist, setSelectedSymbol } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [evEbitdaMax, setEvEbitdaMax] = useState('15');
  const [evEbitMax, setEvEbitMax] = useState('12');

  const handleSearch = async (nextQuery?: string) => {
    const term = (nextQuery ?? query).trim();
    if (!term) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const matches = await searchSymbol(term);
      setResults(matches);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
    setSelectedSymbol(symbol);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Research screen</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search company or ticker"
        placeholderTextColor={brand.textMuted}
        style={styles.input}
        onSubmitEditing={() => handleSearch()}
      />

      <View style={styles.filterRow}>
        {sampleFilters.map((filter) => (
          <Pressable key={filter} style={styles.filterChip} onPress={() => handleSearch(filter)}>
            <Text style={styles.filterText}>{filter}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.screeningCard}>
        <Text style={styles.sectionTitle}>Screening panel</Text>
        <View style={styles.filterGrid}>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>EV / EBITDA max</Text>
            <TextInput
              value={evEbitdaMax}
              onChangeText={setEvEbitdaMax}
              keyboardType="numeric"
              placeholder="15"
              placeholderTextColor={brand.textMuted}
              style={styles.filterInput}
            />
          </View>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>EV / EBIT max</Text>
            <TextInput
              value={evEbitMax}
              onChangeText={setEvEbitMax}
              keyboardType="numeric"
              placeholder="12"
              placeholderTextColor={brand.textMuted}
              style={styles.filterInput}
            />
          </View>
        </View>
      </View>

      <Pressable style={styles.actionButton} onPress={() => handleSearch()}>
        <Text style={styles.actionText}>Search</Text>
      </Pressable>

      {searching ? <ActivityIndicator size="large" color={brand.primary} style={{ marginTop: 16 }} /> : null}

      <View style={styles.resultsBox}>
        {results.map((item) => (
          <Pressable key={item.symbol} style={styles.resultRow} onPress={() => addToWatchlist(item.symbol)}>
            <View>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.name}>{item.shortname ?? item.longname ?? 'No company name'}</Text>
            </View>
            <Text style={styles.tag}>Add</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Active watchlist</Text>
      <View style={styles.watchlistBox}>
        {watchlist.map((symbol) => (
          <Pressable key={symbol} style={styles.watchItem} onPress={() => setSelectedSymbol(symbol)}>
            <Text style={styles.watchText}>{symbol}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.background },
  content: { padding: 16 },
  header: { fontSize: 28, fontWeight: '700', color: brand.text, marginBottom: 12 },
  input: {
    backgroundColor: brand.panelAlt,
    color: brand.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: brand.border,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 },
  filterChip: {
    backgroundColor: brand.panelAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: brand.border,
  },
  filterText: { color: brand.text, fontWeight: '600' },
  screeningCard: {
    backgroundColor: brand.panel,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: brand.border,
    marginBottom: 12,
  },
  filterGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  filterField: { width: '48%' },
  filterLabel: { color: brand.textMuted, fontSize: 12, marginBottom: 8 },
  filterInput: {
    backgroundColor: brand.backgroundAlt,
    color: brand.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: brand.border,
  },
  actionButton: {
    backgroundColor: brand.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  actionText: { color: brand.background, fontWeight: '700' },
  resultsBox: { marginTop: 20 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: brand.panelAlt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: brand.border,
  },
  symbol: { color: brand.text, fontWeight: '700' },
  name: { color: brand.textMuted, marginTop: 4 },
  tag: { color: brand.primary, fontWeight: '700' },
  sectionTitle: { color: brand.text, fontWeight: '700', fontSize: 18, marginTop: 22, marginBottom: 10 },
  watchlistBox: { flexDirection: 'row', flexWrap: 'wrap' },
  watchItem: {
    backgroundColor: brand.panelAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: brand.border,
  },
  watchText: { color: brand.text },
});
