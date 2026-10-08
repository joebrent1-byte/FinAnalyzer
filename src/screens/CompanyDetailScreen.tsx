import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Pressable, Linking, TextInput } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { fetchCompanyProfile, fetchQuoteSummary, fetchChartData, formatCompactNumber } from '../services/yahooFinance';
import { useAppStore } from '../store/useAppStore';
import StockChart from '../components/StockChart';
import { brand } from '../theme';
import { mockManagement } from './SearchScreen';

export default function CompanyDetailScreen() {
  const route = useRoute<RouteProp<any, any>>();
  const symbolParam = route.params?.symbol ?? 'AAPL';
  const { selectedSymbol, setSelectedSymbol, quote, setQuote, watchlist, setWatchlist, portfolio, addToPortfolio } = useAppStore();
  const [profile, setProfile] = useState<any>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionInput, setPositionInput] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'valuation' | 'management'>('overview');
  const activeSymbol = symbolParam || selectedSymbol;
  const isInWatchlist = watchlist.includes(activeSymbol);

  useEffect(() => {
    setSelectedSymbol(activeSymbol);
  }, [activeSymbol, setSelectedSymbol]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileData, quoteData, historyData] = await Promise.all([
          fetchCompanyProfile(activeSymbol),
          fetchQuoteSummary(activeSymbol),
          fetchChartData(activeSymbol),
        ]);
        setProfile(profileData);
        setQuote(quoteData);
        setChartData(historyData);
      } catch (error) {
        console.error('Company detail load error:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeSymbol, setQuote]);

  const existingPosition = useMemo(
    () => portfolio.find((item) => item.symbol === activeSymbol),
    [portfolio, activeSymbol],
  );

  const toggleWatchlist = () => {
    if (isInWatchlist) {
      setWatchlist(watchlist.filter((s) => s !== activeSymbol));
    } else {
      setWatchlist([...watchlist, activeSymbol]);
    }
  };

  const handleAddToPortfolio = () => {
    const count = Number(positionInput);
    if (!count || count <= 0) return;

    addToPortfolio({
      symbol: activeSymbol,
      shares: count,
      avgCost: quote?.price ?? 0,
    });
    setPositionInput('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loading ? (
        <ActivityIndicator size="large" color={brand.primary} style={{ marginVertical: 24 }} />
      ) : (
        <>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.ticker}>{activeSymbol}</Text>
              <Text style={styles.name}>{quote?.shortName ?? activeSymbol}</Text>
            </View>
            <Pressable style={[styles.watchBtn, isInWatchlist && styles.watchBtnActive]} onPress={toggleWatchlist}>
              <Text style={styles.watchBtnText}>{isInWatchlist ? '★' : '☆'}</Text>
            </Pressable>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.price}>${quote?.price?.toFixed(2) ?? '0.00'}</Text>
            <Text style={[styles.change, { color: (quote?.changePercent ?? 0) >= 0 ? brand.success : brand.danger }]}>
              {quote?.changePercent ? `${quote.changePercent.toFixed(2)}%` : '0.00%'}
            </Text>
          </View>

          <View style={styles.tabRow}>
            {['overview', 'valuation', 'management'].map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab as 'overview' | 'valuation' | 'management')}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              >
                <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                  {tab === 'overview' ? 'Overview' : tab === 'valuation' ? 'Valuation' : 'Management'}
                </Text>
              </Pressable>
            ))}
          </View>

          {chartData.length > 0 ? <StockChart data={chartData} /> : null}

          {activeTab === 'overview' && (
            <>
              <Text style={styles.sectionTitle}>Company profile</Text>
              <Text style={styles.description}>{profile?.longBusinessSummary ?? 'No company description available.'}</Text>

              <View style={styles.grid}>
                <View style={styles.metricCard}><Text style={styles.metricLabel}>Sector</Text><Text style={styles.metricValue}>{profile?.sector ?? 'N/A'}</Text></View>
                <View style={styles.metricCard}><Text style={styles.metricLabel}>Industry</Text><Text style={styles.metricValue}>{profile?.industry ?? 'N/A'}</Text></View>
                <View style={styles.metricCard}><Text style={styles.metricLabel}>HQ</Text><Text style={styles.metricValue}>{profile?.city ? `${profile.city}${profile.state ? ', ' + profile.state : ''}` : 'N/A'}</Text></View>
                <View style={styles.metricCard}><Text style={styles.metricLabel}>Employees</Text><Text style={styles.metricValue}>{profile?.employees ? profile.employees.toLocaleString() : 'N/A'}</Text></View>
              </View>
            </>
          )}

          {activeTab === 'valuation' && (
            <>
              <Text style={styles.sectionTitle}>Valuation</Text>
              <View style={styles.grid}>
                {[
                  { label: 'Market Cap', value: formatCompactNumber(quote?.marketCap ?? 0) },
                  { label: 'P/E Ratio', value: quote?.peRatio ? quote.peRatio.toFixed(1) : 'N/A' },
                  { label: 'Dividend', value: quote?.dividendYield ? `${quote.dividendYield.toFixed(2)}%` : 'N/A' },
                  { label: 'Beta', value: quote?.beta ? quote.beta.toFixed(2) : 'N/A' },
                  { label: 'EV / EBITDA', value: quote?.evEbitda ? quote.evEbitda.toFixed(2) : 'N/A' },
                  { label: 'EV / EBIT', value: quote?.evEbit ? quote.evEbit.toFixed(2) : 'N/A' },
                ].map((metric) => (
                  <View key={metric.label} style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {activeTab === 'management' && (
            <>
              <Text style={styles.sectionTitle}>Management</Text>
              {mockManagement.map((person) => (
                <View key={person.name} style={styles.personCard}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personTitle}>{person.title}</Text>
                  <Text style={styles.personCV}>{person.cv}</Text>
                </View>
              ))}
            </>
          )}

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Add to portfolio</Text>
            <View style={styles.positionRow}>
              <Text style={styles.positionLabel}>Existing shares</Text>
              <Text style={styles.positionValue}>{existingPosition ? existingPosition.shares : 0}</Text>
            </View>
            <TextInput
              value={positionInput}
              onChangeText={setPositionInput}
              keyboardType="numeric"
              placeholder="Enter shares"
              placeholderTextColor={brand.textMuted}
              style={styles.input}
            />
            <Pressable style={styles.addButton} onPress={handleAddToPortfolio}>
              <Text style={styles.addButtonText}>Add position</Text>
            </Pressable>
          </View>

          {profile?.website ? (
            <Pressable style={styles.linkButton} onPress={() => Linking.openURL(profile.website)}>
              <Text style={styles.linkButtonText}>Visit company website</Text>
            </Pressable>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: brand.background },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  ticker: { color: brand.primary, fontSize: 24, fontWeight: '700' },
  name: { color: brand.textMuted, marginTop: 4 },
  watchBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: brand.panelAlt, borderWidth: 1, borderColor: brand.border, alignItems: 'center', justifyContent: 'center' },
  watchBtnActive: { borderColor: brand.primary },
  watchBtnText: { fontSize: 24, color: brand.text },
  priceCard: { backgroundColor: brand.panel, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: brand.border, marginBottom: 16 },
  price: { color: brand.text, fontSize: 32, fontWeight: '800' },
  change: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  tabRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  tabButton: { flex: 1, backgroundColor: brand.panelAlt, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: brand.border },
  tabButtonActive: { backgroundColor: brand.panel, borderColor: brand.primary },
  tabLabel: { color: brand.textMuted, fontWeight: '700' },
  tabLabelActive: { color: brand.primary },
  sectionTitle: { color: brand.text, fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  description: { color: brand.secondary, fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 },
  metricCard: { backgroundColor: brand.panelAlt, borderRadius: 12, padding: 14, width: '48%', marginBottom: 10, borderWidth: 1, borderColor: brand.border },
  metricLabel: { color: brand.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  metricValue: { color: brand.text, fontSize: 18, marginTop: 8, fontWeight: '700' },
  formCard: { backgroundColor: brand.panel, borderRadius: 12, padding: 16, marginTop: 20, borderWidth: 1, borderColor: brand.border },
  positionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  positionLabel: { color: brand.textMuted },
  positionValue: { color: brand.text, fontWeight: '700' },
  input: { backgroundColor: brand.backgroundAlt, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: brand.text, borderWidth: 1, borderColor: brand.border, marginBottom: 12 },
  addButton: { backgroundColor: brand.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  addButtonText: { color: brand.background, fontWeight: '700' },
  personCard: { backgroundColor: brand.panelAlt, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: brand.border },
  personName: { color: brand.text, fontSize: 18, fontWeight: '700' },
  personTitle: { color: brand.primary, marginTop: 4, fontWeight: '600' },
  personCV: { color: brand.secondary, marginTop: 8, lineHeight: 20 },
  linkButton: { backgroundColor: brand.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 20, marginBottom: 20 },
  linkButtonText: { color: brand.background, fontWeight: '700' },
});
