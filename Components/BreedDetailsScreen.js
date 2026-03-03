// File: Components/BreedDetailsScreen.js
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../App';
import COLORS from './Colors';
import { BREEDS } from './BreedData';
import { IMAGES } from './AssetRegistry';
import DataTable from './DataTable';
import { BarChartSimple } from './Charts';

const { width: W } = Dimensions.get('window');
const CARD_H_MARGIN = 12;
const CARD_PADDING  = 10;
// chart width = card width minus both paddings
const CHART_W = W - CARD_H_MARGIN * 2 - CARD_PADDING * 2;

const AVG_SHED  = BREEDS.reduce((s, b) => s + b.sheddingLevel,    0) / BREEDS.length;
const AVG_GROOM = BREEDS.reduce((s, b) => s + b.groomingPerWeek,  0) / BREEDS.length;

export default function BreedDetailsScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { state, setState } = useApp();

  const breedId   = route.params?.breedId;
  const breed     = BREEDS.find(b => b.id === breedId);
  const isFavorite = (state.favorites || []).includes(breedId);

  const toggleFav = useCallback(() => {
    setState(prev => {
      const favs = prev.favorites || [];
      return {
        ...prev,
        favorites: favs.includes(breedId)
          ? favs.filter(f => f !== breedId)
          : [...favs, breedId],
      };
    });
  }, [breedId, setState]);

  if (!breed) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorText}>Breed not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tableRows = [
    ['Weight',     `${breed.weightKgMin}–${breed.weightKgMax} kg`],
    ['Lifespan',   `${breed.lifespanYearsMin}–${breed.lifespanYearsMax} yr`],
    ['Grooming',   `${breed.groomingPerWeek}x / week`],
    ['Daily play', `${breed.dailyPlayMin} min`],
    ['Shedding',   `${breed.sheddingLevel} / 5`],
    ['Coat',       breed.coatType],
    ['Origin',     breed.originRegion],
  ];

  const chartData = [
    { label: `Shed\n(${breed.name})`,  value: breed.sheddingLevel,               color: COLORS.accent1 },
    { label: 'Avg\nShed',              value: parseFloat(AVG_SHED.toFixed(1)),   color: COLORS.textMuted },
    { label: `Groom\n(${breed.name})`, value: breed.groomingPerWeek,             color: COLORS.accent2 },
    { label: 'Avg\nGroom',             value: parseFloat(AVG_GROOM.toFixed(1)), color: COLORS.textMuted },
  ];

  return (
    <View style={styles.root}>
      {/* Top bar — back + save — floats above scroll */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.favBtn, isFavorite && styles.favBtnActive]}
          onPress={toggleFav}
          activeOpacity={0.75}>
          <Text style={styles.favBtnText}>{isFavorite ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* Single solid card — all content inside */}
        <View style={styles.card}>

          {/* Breed name & region */}
          <Text style={styles.name}>{breed.name}</Text>
          <Text style={styles.region}>{breed.originRegion}</Text>

          {/* Temperament tags */}
          <View style={styles.temperRow}>
            {breed.temperament.map(t => (
              <View key={t} style={styles.temperTag}>
                <Text style={styles.temperText}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Breed image — full, unclipped, inside the card */}
          <View style={styles.imgWrap}>
            <Image
              source={IMAGES[breed.imageKey] || IMAGES.logo}
              style={styles.breedImg}
              resizeMode="cover"
            />
          </View>

          {/* Description */}
          <Text style={styles.description}>{breed.descriptionShort}</Text>

          {/* Stats */}
          <Text style={styles.sectionTitle}>Stats</Text>
          <DataTable
            headers={['Attribute', 'Value']}
            rows={tableRows}
            columnWidths={[1.4, 1]}
            fillWidth
          />

          {/* Chart */}
          <Text style={styles.sectionTitle}>Shedding & Grooming vs Average</Text>
          <View style={styles.chartWrap}>
            <BarChartSimple data={chartData} width={CHART_W} height={150} />
          </View>

          {/* Care tips */}
          <Text style={styles.sectionTitle}>Care Tips</Text>
          {(breed.careTips || []).map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  backBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  favBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: COLORS.accent1,
  },
  favBtnActive: { backgroundColor: COLORS.accent1 },
  favBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  scroll: { paddingBottom: 32 },

  // Solid opaque card
  card: {
    marginHorizontal: CARD_H_MARGIN,
    marginTop: 8,
    padding: CARD_PADDING,
    backgroundColor: COLORS.card,   // #1C0900 — fully opaque
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  name:   { fontSize: 28, fontWeight: '800', color: COLORS.text },
  region: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, marginBottom: 10 },

  temperRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  temperTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(25,118,210,0.15)',
    borderWidth: 1,
    borderColor: COLORS.accent2,
  },
  temperText: { fontSize: 12, color: COLORS.accent2, fontWeight: '600' },

  imgWrap: {
    height: 430,
    marginHorizontal: 4,
    backgroundColor: COLORS.cardAlt,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  breedImg: { width: '100%', height: 430 },

  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },

  chartWrap: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  tipBullet: {
    width: 7, height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.accent1,
    marginTop: 6,
    flexShrink: 0,
  },
  tipText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.text, fontSize: 18 },
  backLink:  { color: COLORS.accent1, marginTop: 12, fontSize: 15 },
});
