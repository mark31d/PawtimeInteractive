// File: Components/CatCatalogScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../App';
import COLORS from './Colors';
import { BREEDS, COAT_TYPES } from './BreedData';
import { IMAGES, ICONS } from './AssetRegistry';

const REGIONS = ['All', 'North America', 'Europe', 'Asia', 'Africa'];
const COAT_FILTER = ['All', ...COAT_TYPES];

function BreedCard({ breed, isFavorite, onToggleFavorite }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={() => navigation.navigate('BreedDetails', { breedId: breed.id })}>
      <Image
        source={IMAGES[breed.imageKey] || IMAGES.logo}
        style={styles.cardImg}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{breed.name}</Text>
          <TouchableOpacity
            onPress={() => onToggleFavorite(breed.id)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            activeOpacity={0.7}>
            <View
              style={[
                styles.favDot,
                isFavorite && styles.favDotActive,
              ]}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardRegion}>{breed.originRegion}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{breed.coatType}</Text>
          </View>
          {breed.temperament.slice(0, 2).map(t => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>
            Shed: {breed.sheddingLevel}/5
          </Text>
          <Text style={styles.statItem}>
            Groom: {breed.groomingPerWeek}x/wk
          </Text>
          <Text style={styles.statItem}>
            Play: {breed.dailyPlayMin}min/d
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CatCatalogScreen() {
  const navigation = useNavigation();
  const { state, setState } = useApp();
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [coatFilter, setCoatFilter] = useState('All');

  const filtered = useMemo(() => {
    return BREEDS.filter(b => {
      const matchQ =
        !query ||
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.originRegion.toLowerCase().includes(query.toLowerCase());
      const matchR = regionFilter === 'All' || b.originRegion === regionFilter;
      const matchC = coatFilter === 'All' || b.coatType === coatFilter;
      return matchQ && matchR && matchC;
    });
  }, [query, regionFilter, coatFilter]);

  const toggleFavorite = id => {
    setState(prev => {
      const favs = prev.favorites || [];
      const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
      return { ...prev, favorites: next };
    });
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={IMAGES.bg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerInner}>
            <View>
              <Text style={styles.headerTitle}>Pawtime Interactive</Text>
              <Text style={styles.headerSub}>{BREEDS.length} breeds</Text>
            </View>
            <TouchableOpacity
              style={styles.gearBtn}
              onPress={() => navigation.getParent()?.navigate('Settings')}
              activeOpacity={0.7}>
              <Image source={ICONS.tab_settings} style={styles.gearIcon} resizeMode="contain" />
            </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search breeds or regions..."
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {/* Region filter chips */}
      <View style={styles.chipRow}>
        {REGIONS.map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, regionFilter === r && styles.chipActive]}
            onPress={() => setRegionFilter(r)}
            activeOpacity={0.75}>
            <Text
              style={[styles.chipText, regionFilter === r && styles.chipTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Coat filter chips */}
      <View style={styles.chipRow}>
        {COAT_FILTER.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, coatFilter === c && styles.chipActive2]}
            onPress={() => setCoatFilter(c)}
            activeOpacity={0.75}>
            <Text
              style={[styles.chipText, coatFilter === c && styles.chipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={b => b.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No breeds match your filters.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <BreedCard
            breed={item}
            isFavorite={(state.favorites || []).includes(item.id)}
            onToggleFavorite={toggleFavorite}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { backgroundColor: 'transparent' },
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  headerSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  searchInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
    marginVertical: 2,
  },
  chipActive: {
    backgroundColor: COLORS.accent1,
    borderColor: COLORS.accent1,
  },
  chipActive2: {
    backgroundColor: COLORS.accent2,
    borderColor: COLORS.accent2,
  },
  chipText: { fontSize: 12, color: COLORS.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 12, gap: 12, paddingBottom: 110 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardImg: { width: 90, height: 100 },
  cardBody: { flex: 1, padding: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  favDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.accent1,
    backgroundColor: 'transparent',
  },
  favDotActive: { backgroundColor: COLORS.accent1 },
  cardRegion: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(110,168,255,0.1)',
  },
  tagText: { fontSize: 10, color: COLORS.accent1 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  statItem: { fontSize: 10, color: COLORS.textSecondary },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.textMuted, fontSize: 15 },
});
