// File: Components/StatsScreen.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp, shortDay } from '../App';
import COLORS from './Colors';
import { ICONS } from './AssetRegistry';
import { BREEDS, REGION_COLORS } from './BreedData';
import DataTable from './DataTable';
import { BarChartSimple, DonutChartSimple, LineChartSimple } from './Charts';

const { width: W } = Dimensions.get('window');
const CHART_W = W - 48;

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

const CAT_COLORS = {
  play:    '#FF8C00',
  feed:    '#4CAF50',
  groom:   '#9B59B6',
  vet:     '#E74C3C',
  nap:     '#3498DB',
  observe: '#3EB3C2',
};

export default function StatsScreen() {
  const navigation = useNavigation();
  const { state } = useApp();
  const entries  = state.notes || [];
  const favorites = state.favorites || [];

  // Activity breakdown by category
  const activityBreakdown = useMemo(() => {
    const counts = {};
    entries.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: count,
      color: CAT_COLORS[cat] || COLORS.accent1,
    }));
  }, [entries]);

  // Region distribution (breed count by region)
  const regionDist = useMemo(() => {
    const counts = {};
    BREEDS.forEach(b => {
      counts[b.originRegion] = (counts[b.originRegion] || 0) + 1;
    });
    return Object.entries(counts).map(([r, v]) => ({
      label: r,
      value: v,
      color: REGION_COLORS[r] || COLORS.accent1,
    }));
  }, []);

  // Mood last 14 days (avg per day from Pawlog entries)
  const moodLine = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days.map(d => {
      const dayEntries = entries.filter(e => e.createdAtISO?.slice(0, 10) === d);
      const avg = dayEntries.length > 0
        ? dayEntries.reduce((s, e) => s + (e.mood || 0), 0) / dayEntries.length
        : 0;
      return { label: shortDay(d), value: parseFloat(avg.toFixed(1)) };
    });
  }, [entries]);

  // Average grooming per region
  const groomingPerRegion = useMemo(() => {
    const sums = {};
    const counts2 = {};
    BREEDS.forEach(b => {
      sums[b.originRegion] = (sums[b.originRegion] || 0) + b.groomingPerWeek;
      counts2[b.originRegion] = (counts2[b.originRegion] || 0) + 1;
    });
    return Object.entries(sums).map(([r, s]) => ({
      label: r.split(' ')[0],
      value: parseFloat((s / counts2[r]).toFixed(1)),
      color: REGION_COLORS[r] || COLORS.accent1,
    }));
  }, []);

  // Summary stats
  const totalEntries = entries.length;
  const totalFavs    = favorites.length;
  const moodEntries  = entries.filter(e => e.mood > 0);
  const avgMood = moodEntries.length > 0
    ? (moodEntries.reduce((s, e) => s + e.mood, 0) / moodEntries.length).toFixed(1)
    : 'N/A';

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerInner}>
            <Text style={styles.headerTitle}>Stats</Text>
            <TouchableOpacity
              style={styles.gearBtn}
              onPress={() => navigation.getParent()?.navigate('Settings')}
              activeOpacity={0.7}>
              <Image source={ICONS.tab_settings} style={styles.gearIcon} resizeMode="contain" />
            </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Summary row */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Entries', value: totalEntries },
            { label: 'Favorites', value: totalFavs },
            { label: 'Avg mood', value: avgMood },
            { label: 'Breeds', value: 12 },
          ].map(s => (
            <View key={s.label} style={styles.summaryBox}>
              <Text style={styles.summaryVal}>{s.value}</Text>
              <Text style={styles.summaryLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Activity breakdown */}
        <Card title="Pawlog Activity Breakdown">
          {activityBreakdown.length === 0 ? (
            <Text style={styles.noDataText}>
              Log cat activities in Pawlog to see the breakdown.
            </Text>
          ) : (
            <>
              <DataTable
                headers={['Activity', 'Count']}
                rows={activityBreakdown.map(a => [a.label, a.value])}
                columnWidths={[2, 1]}
                fillWidth
              />
              <View style={styles.chartArea}>
                <BarChartSimple
                  data={activityBreakdown}
                  width={CHART_W}
                  height={130}
                />
              </View>
            </>
          )}
        </Card>

        {/* Region donut */}
        <Card title="Breeds by Region">
          <View style={styles.donutWrap}>
            <DonutChartSimple data={regionDist} size={160} />
            <View style={styles.donutLegend}>
              {regionDist.map(r => (
                <View key={r.label} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: r.color }]} />
                  <Text style={styles.legendText}>
                    {r.label} ({r.value})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Mood line from Pawlog */}
        <Card title="Cat Mood — Last 14 Days">
          {entries.length === 0 ? (
            <Text style={styles.noDataText}>
              Log activities in Pawlog to track mood trends.
            </Text>
          ) : (
            <View style={styles.chartArea}>
              <LineChartSimple
                data={moodLine}
                width={CHART_W}
                height={130}
                lineColor={COLORS.success}
                fillColor={COLORS.success}
              />
            </View>
          )}
        </Card>

        {/* Grooming by region */}
        <Card title="Avg Grooming/Week by Region">
          <View style={styles.chartArea}>
            <BarChartSimple
              data={groomingPerRegion}
              width={CHART_W}
              height={140}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: { backgroundColor: 'transparent' },
  headerInner: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: { width: 24, height: 24, tintColor: COLORS.accent1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  scroll: { padding: 16, gap: 14, paddingBottom: 120 },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  summaryVal: { fontSize: 22, fontWeight: '800', color: COLORS.accent1 },
  summaryLbl: { fontSize: 10, color: COLORS.textMuted, marginTop: 3 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  chartArea: { marginTop: 12 },
  noDataText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  donutWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  donutLegend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
});
