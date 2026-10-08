import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

type StockChartProps = {
  data: number[];
  color?: string;
};

export default function StockChart({ data, color = '#60A5FA' }: StockChartProps) {
  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Price trend</Text>
      <LineChart
        data={{
          labels: Array.from({ length: data.length }, (_, idx) => idx.toString()),
          datasets: [{ data }],
        }}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: '#0F172A',
          backgroundGradientFrom: '#0F172A',
          backgroundGradientTo: '#0F172A',
          decimalPlaces: 2,
          color: () => color,
          labelColor: () => '#94A3B8',
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '3',
            strokeWidth: '2',
            stroke: color,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 12,
    marginVertical: 12,
  },
  title: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 16,
  },
});
