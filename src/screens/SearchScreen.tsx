import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { searchSymbol } from '../services/yahooFinance';

export default function SearchScreen() {
  const { watchlist, setWatchlist, setSelectedSymbol } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const matches = await searchSymbol(query);
      setResults(matches);
    } catch (error) {
      console.error('Search failed:', error);
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
      <Text style={styles.header}>Stock screening</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by company or ticker"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        onSubmitEditing={handleSearch}
      />

      <Pressable style={styles.actionButton} onPress={handleSearch}>
        <Text style={styles.actionText}>Search</Text>
      </Pressable>

      {searching ? <ActivityIndicator size="large" color="#60A5FA" style={{ marginTop: 16 }} /> : null}

      <View style={styles.resultsBox}>
        {results.map((item) => (
          <Pressable key={item.symbol} style={styles.resultRow} onPress={() => addToWatchlist(item.symbol)}>
            <View>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.name}>{item.shortname ?? item.longname ?? 'No name'}</Text>
            </View>
            <Text style={styles.tag}>Add</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Watchlist</Text>
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
  actionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
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
