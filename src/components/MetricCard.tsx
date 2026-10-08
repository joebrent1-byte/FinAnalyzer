import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

type MetricCardProps = {
  label: string;
  value: string;
  accent?: string;
  subtitle?: string;
};

export default function MetricCard({ label, value, accent = '#3B82F6', subtitle }: MetricCardProps) {
  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  cardValue: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  cardSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 6,
  },
});
