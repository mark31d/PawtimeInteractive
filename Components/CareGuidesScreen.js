// File: Components/CareGuidesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import COLORS from './Colors';
import { ICONS, IMAGES } from './AssetRegistry';

const FREQ_COLORS = {
  Daily:    '#4CAF50',
  Weekly:   '#1976D2',
  Monthly:  '#9B59B6',
  Seasonal: '#FF8C00',
  Annual:   '#E74C3C',
};

const GUIDES = [
  {
    key: 'grooming',
    title: 'Grooming',
    color: COLORS.accent1,
    frequency: 'Weekly',
    content:
      'Regular grooming keeps your cat comfortable and reduces hairballs. Short-haired cats need brushing 1-2x per week; long-haired breeds 4-7x. Use a slicker brush and follow with a metal comb. Check ears for wax and trim nails every 2-3 weeks.',
    tips: [
      'Short-haired cats: brush 1-2x per week',
      'Long-haired cats: brush 4-7x per week',
      'Trim nails every 2-3 weeks to prevent overgrowth',
      'Check and clean ears monthly for wax build-up',
      'Use a damp cloth to wipe around eyes if needed',
    ],
  },
  {
    key: 'feeding',
    title: 'Feeding',
    color: COLORS.success,
    frequency: 'Daily',
    content:
      'Cats are obligate carnivores. Feed high-protein wet or dry food formulated for their life stage. Adult cats typically need 2 meals per day. Always provide fresh water. Avoid human food, onions, garlic, grapes, and chocolate.',
    tips: [
      'Feed 2 measured meals per day — avoid free-feeding',
      'Always keep fresh water available',
      'Wet food supports hydration and kidney health',
      'Transition to new food gradually over 7-10 days',
      'Never feed onions, garlic, grapes, or chocolate',
    ],
  },
  {
    key: 'health',
    title: 'Health',
    color: COLORS.warning,
    frequency: 'Annual',
    content:
      'Annual vet visits are essential. Keep vaccinations up to date. Use vet-prescribed flea and parasite prevention monthly. Watch for changes in eating, litter habits, or behavior — early detection matters. Dental cleanings help prevent serious disease.',
    tips: [
      'Schedule a vet visit at least once per year',
      'Keep core vaccinations up to date',
      'Apply flea and parasite prevention monthly',
      'Watch for sudden changes in eating or drinking',
      'Dental disease affects most cats over 3 — ask your vet',
    ],
  },
  {
    key: 'play',
    title: 'Play & Enrichment',
    color: COLORS.accent2,
    frequency: 'Daily',
    content:
      'Cats need mental and physical stimulation daily. Use wand toys, puzzle feeders, and cat trees. Rotate toys to keep interest high. Indoor cats especially benefit from window perches and safe outdoor enclosures. Aim for 15-30 min of active play per session.',
    tips: [
      'Aim for 2 play sessions of 10-15 min each day',
      'Wand toys mimic hunting and engage instincts',
      'Rotate toys weekly to maintain interest',
      'Puzzle feeders slow eating and stimulate the mind',
      'Window perches reduce boredom for indoor cats',
    ],
  },
  {
    key: 'litter',
    title: 'Litter & Hygiene',
    color: COLORS.accent3,
    frequency: 'Daily',
    content:
      'Provide one litter box per cat, plus one extra. Scoop daily and do a full clean weekly. Cats prefer unscented clumping litter. Place boxes in quiet, private areas away from food. Sudden litter avoidance can indicate a health issue.',
    tips: [
      'Rule: one litter box per cat, plus one spare',
      'Scoop at least once daily',
      'Replace all litter and clean the box weekly',
      'Use unscented clumping litter — cats dislike strong scents',
      'Litter avoidance may signal a UTI or stress',
    ],
  },
  {
    key: 'travel',
    title: 'Travel & Transport',
    color: '#FF9D5C',
    frequency: 'Seasonal',
    content:
      'Acclimate your cat to their carrier well before travel. Line it with familiar bedding. Use calming sprays before long trips. Never leave a cat in a car in warm weather. For air travel, check airline pet policies and get a health certificate from your vet.',
    tips: [
      'Leave the carrier out at home so your cat explores it',
      'Line the carrier with a worn T-shirt for familiarity',
      'Pheromone sprays can reduce travel anxiety',
      'Never leave your cat alone in a parked car',
      'Get a vet health certificate at least 10 days before flying',
    ],
  },
];

function FrequencyBadge({ label }) {
  const color = FREQ_COLORS[label] || COLORS.accent1;
  return (
    <View style={[styles.freqBadge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.freqText, { color }]}>{label}</Text>
    </View>
  );
}

function AccordionCard({ guide }) {
  const [open, setOpen] = useState(false);
  const anim = useState(new Animated.Value(0))[0];

  const toggle = () => {
    Animated.spring(anim, {
      toValue: open ? 0 : 1,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
    setOpen(o => !o);
  };

  return (
    <View style={[styles.card, { borderLeftColor: guide.color, borderLeftWidth: 3 }]}>
      <TouchableOpacity style={styles.cardHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>{guide.title}</Text>
          <FrequencyBadge label={guide.frequency} />
        </View>
        <View style={[styles.chevron, open && styles.chevronOpen]}>
          <View style={[styles.chevLine, styles.chevLineLeft, { backgroundColor: guide.color }]} />
          <View style={[styles.chevLine, styles.chevLineRight, { backgroundColor: guide.color }]} />
        </View>
      </TouchableOpacity>

      <Animated.View
        style={{
          maxHeight: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 500] }),
          overflow: 'hidden',
        }}>
        <View style={styles.cardContent}>
          <Text style={styles.cardText}>{guide.content}</Text>

          <View style={styles.tipsHeader}>
            <View style={[styles.tipsDot, { backgroundColor: guide.color }]} />
            <Text style={[styles.tipsTitle, { color: guide.color }]}>Key tips</Text>
          </View>
          {guide.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.bullet, { backgroundColor: guide.color }]} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

export default function CareGuidesScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <ImageBackground source={IMAGES.bg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerInner}>
          <Text style={styles.headerTitle}>Care Guides</Text>
          <TouchableOpacity
            style={styles.gearBtn}
            onPress={() => navigation.getParent()?.navigate('Settings')}
            activeOpacity={0.7}>
            <Image source={ICONS.tab_settings} style={styles.gearIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {GUIDES.map(g => (
          <AccordionCard key={g.key} guide={g} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: { backgroundColor: 'transparent' },
  headerInner: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  gearBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1, borderColor: COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  gearIcon: { width: 24, height: 24, tintColor: COLORS.accent1 },

  list: { padding: 16, gap: 10, paddingBottom: 110 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  freqBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  freqText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  chevron: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  chevLine: { position: 'absolute', width: 9, height: 2, borderRadius: 1 },
  chevLineLeft:  { transform: [{ rotate: '-35deg' }, { translateX: -3 }] },
  chevLineRight: { transform: [{ rotate: '35deg' },  { translateX: 3 }] },

  cardContent: { paddingHorizontal: 16, paddingBottom: 16 },
  cardText: {
    fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 14,
  },

  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  tipsDot: { width: 8, height: 8, borderRadius: 4 },
  tipsTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },

  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 7 },
  bullet: { width: 5, height: 5, borderRadius: 2.5, marginTop: 7, flexShrink: 0 },
  tipText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});
