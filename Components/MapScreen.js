// File: Components/MapScreen.js
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import COLORS from './Colors';
import { BREEDS, REGIONS, REGION_COLORS, COAT_TYPES } from './BreedData';
import AppModal from './AppModal';
import { ICONS } from './AssetRegistry';

const INITIAL_REGION = {
  latitude: 20,
  longitude: 20,
  latitudeDelta: 120,
  longitudeDelta: 120,
};

const MIN_CIRCLE = 38;
const MAX_CIRCLE = 82;

function CircleMarker({ count, maxCount, color, name, onPress }) {
  const size =
    MIN_CIRCLE +
    Math.round(((count - 1) / Math.max(maxCount - 1, 1)) * (MAX_CIRCLE - MIN_CIRCLE));
  const fontSize = size > 58 ? 16 : 13;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, borderColor: color },
        ]}>
        {/* semi-transparent fill without affecting text opacity */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: size / 2, backgroundColor: color, opacity: 0.22 },
          ]}
        />
        <Text style={[styles.circleCount, { fontSize }]}>{count}</Text>
      </View>
      <Text style={[styles.circleName, { color }]} numberOfLines={1}>
        {name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
}

function BreedListModal({ visible, breeds, regionName, onClose }) {
  const navigation = useNavigation();

  const goBreed = id => {
    onClose();
    setTimeout(() => navigation.navigate('BreedDetails', { breedId: id }), 150);
  };

  return (
    <AppModal
      visible={visible}
      title={regionName || 'Breeds in region'}
      primaryLabel="Close"
      onPrimary={onClose}
      onClose={onClose}
      maxHeight={320}>
      {breeds.length === 0 ? (
        <Text style={styles.noBreedText}>No breeds match your filters here.</Text>
      ) : (
        breeds.map(b => (
          <TouchableOpacity
            key={b.id}
            style={styles.breedRow}
            onPress={() => goBreed(b.id)}
            activeOpacity={0.8}>
            <View>
              <Text style={styles.breedRowName}>{b.name}</Text>
              <Text style={styles.breedRowMeta}>
                {b.coatType} coat · {b.temperament[0]}
              </Text>
            </View>
            <Text style={styles.breedRowArrow}>{'>'}</Text>
          </TouchableOpacity>
        ))
      )}
    </AppModal>
  );
}

export default function MapScreen() {
  const navigation = useNavigation();
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterCoat, setFilterCoat]     = useState('All');
  const [filterModal, setFilterModal]   = useState(false);
  const [markerModal, setMarkerModal]   = useState(false);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');

  const filteredBreeds = useMemo(() => {
    return BREEDS.filter(b => {
      const matchR = filterRegion === 'All' || b.originRegion === filterRegion;
      const matchC = filterCoat   === 'All' || b.coatType      === filterCoat;
      return matchR && matchC;
    });
  }, [filterRegion, filterCoat]);

  // Group filtered breeds by region → one circle per region
  const regionGroups = useMemo(() => {
    const groups = {};
    filteredBreeds.forEach(b => {
      if (!groups[b.originRegion]) {
        groups[b.originRegion] = {
          name: b.originRegion,
          lat: b.regionLatLng.lat,
          lng: b.regionLatLng.lng,
          color: REGION_COLORS[b.originRegion] || COLORS.accent1,
          breeds: [],
        };
      }
      groups[b.originRegion].breeds.push(b);
    });
    return Object.values(groups);
  }, [filteredBreeds]);

  const maxCount = useMemo(
    () => Math.max(...regionGroups.map(g => g.breeds.length), 1),
    [regionGroups],
  );

  const onCirclePress = useCallback(group => {
    setSelectedBreeds(group.breeds);
    setSelectedRegion(group.name);
    setMarkerModal(true);
  }, []);

  const activeFilters =
    (filterRegion !== 'All' ? 1 : 0) + (filterCoat !== 'All' ? 1 : 0);

  return (
    <View style={styles.root}>
      {/* Full-screen map */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        mapType="standard"
        userInterfaceStyle="dark">
        {regionGroups.map(group => (
          <Marker
            key={group.name}
            coordinate={{ latitude: group.lat, longitude: group.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}>
            <CircleMarker
              count={group.breeds.length}
              maxCount={maxCount}
              color={group.color}
              name={group.name}
              onPress={() => onCirclePress(group)}
            />
          </Marker>
        ))}
      </MapView>

      {/* Header overlay */}
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerInner}>
          <Text style={styles.headerTitle}>World Map</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
              onPress={() => setFilterModal(true)}
              activeOpacity={0.8}>
              <Text style={styles.filterBtnText}>
                Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gearBtn}
              onPress={() => navigation.getParent()?.navigate('Settings')}
              activeOpacity={0.7}>
              <Image
                source={ICONS.tab_settings}
                style={styles.gearIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Legend overlay */}
      <View style={styles.legend}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendContent}>
          {Object.entries(REGION_COLORS).map(([r, c]) => (
            <View key={r} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c }]} />
              <Text style={styles.legendText}>{r}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Filter modal */}
      <AppModal
        visible={filterModal}
        title="Filter Breeds"
        primaryLabel="Apply"
        onPrimary={() => setFilterModal(false)}
        secondaryLabel="Reset"
        onSecondary={() => {
          setFilterRegion('All');
          setFilterCoat('All');
          setFilterModal(false);
        }}
        onClose={() => setFilterModal(false)}>
        <Text style={styles.filterLabel}>Region</Text>
        <View style={styles.chipGrid}>
          {['All', ...REGIONS].map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, filterRegion === r && styles.chipActive]}
              onPress={() => setFilterRegion(r)}
              activeOpacity={0.75}>
              <Text style={[styles.chipText, filterRegion === r && styles.chipTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.filterLabel}>Coat Type</Text>
        <View style={styles.chipGrid}>
          {['All', ...COAT_TYPES].map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, filterCoat === c && styles.chipActive2]}
              onPress={() => setFilterCoat(c)}
              activeOpacity={0.75}>
              <Text style={[styles.chipText, filterCoat === c && styles.chipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </AppModal>

      {/* Marker detail modal */}
      <BreedListModal
        visible={markerModal}
        breeds={selectedBreeds}
        regionName={selectedRegion}
        onClose={() => setMarkerModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },

  // Header — floats over map
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(6,3,0,0.72)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  filterBtnActive: { backgroundColor: COLORS.accent2, borderColor: COLORS.accent2 },
  filterBtnText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },

  // Circle markers
  circle: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleCount: { color: '#fff', fontWeight: '800' },
  circleName: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: 82,
  },

  // Legend — floats above tab bar
  legend: {
    position: 'absolute',
    bottom: 105,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(6,3,0,0.82)',
    paddingVertical: 8,
  },
  legendContent: { paddingHorizontal: 12, gap: 12, alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: COLORS.textSecondary },

  // Filter modal
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardAlt,
  },
  chipActive:  { backgroundColor: COLORS.accent1, borderColor: COLORS.accent1 },
  chipActive2: { backgroundColor: COLORS.accent2, borderColor: COLORS.accent2 },
  chipText:     { fontSize: 12, color: COLORS.textSecondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  // Breed list modal
  breedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  breedRowName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  breedRowMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  breedRowArrow: { color: COLORS.accent1, fontSize: 14 },
  noBreedText: { color: COLORS.textMuted, fontSize: 14, paddingVertical: 8 },
});
