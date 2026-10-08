import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { searchSymbol } from '../services/yahooFinance';
import { useAppStore } from '../store/useAppStore';

const sampleFilters = ['Blue Chip', 'Growth', 'Tech', 'Dividend', 'Macro'];

export default function SearchScreen() {
  const { watchlist, setWatchlist, setSelectedSymbol } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

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
        placeholderTextColor="#94A3B8"
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

      <Pressable style={styles.actionButton} onPress={() => handleSearch()}>
        <Text style={styles.actionText}>Search</Text>
      </Pressable>

      {searching ? <ActivityIndicator size="large" color="#60A5FA" style={{ marginTop: 16 }} /> : null}

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
  container: {
    flex: 1,
    backgroundColor: '#020817',
  },
  content: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  filterText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  actionText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  resultsBox: {
    marginTop: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  symbol: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  name: {
    color: '#94A3B8',
    marginTop: 4,
  },
  tag: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 18,
    marginTop: 22,
    marginBottom: 10,
  },
  watchlistBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  watchItem: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  watchText: {
    color: '#F8FAFC',
  },
});
