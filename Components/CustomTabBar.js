// File: Components/CustomTabBar.js
import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, G } from 'react-native-svg';
import COLORS from './Colors';
import { ICONS } from './AssetRegistry';

const TABS = [
  { name: 'CatsTab', label: 'Cats', icon: ICONS.tab_cats },
  { name: 'CareTab', label: 'Care', icon: ICONS.tab_care },
  { name: 'NotesTab', label: 'Pawlog', icon: ICONS.tab_notes },
  { name: 'StatsTab', label: 'Stats', icon: ICONS.tab_stats },
  { name: 'MapTab', label: 'Map', icon: ICONS.tab_map },
];

const PAW_SIZE = 64;
const ICON_SIZE = 28;
const ICON_TOP = Math.round(PAW_SIZE * (22 / 32) - ICON_SIZE / 2);

const PAD_BROWN = '#6B2E00';

function PawPrint({ color }) {
  return (
    <Svg width={PAW_SIZE} height={PAW_SIZE} viewBox="0 0 32 32">
      {/* Main pad — outer + inner brown oval */}
      <Ellipse cx={16} cy={22} rx={11} ry={10}   fill={color} />
      <Ellipse cx={16} cy={22} rx={9.5}  ry={9.5} fill={PAD_BROWN} />
      {/* Toe pads — outer orange + inner brown */}
      <G>
        <Ellipse cx={4.5}  cy={11.5} rx={3.5} ry={4.8}
          transform="rotate(-28 4.5 11.5)"  fill={color} />
        <Ellipse cx={4.5}  cy={11.5} rx={2.1} ry={2.9}
          transform="rotate(-28 4.5 11.5)"  fill={PAD_BROWN} />

        <Ellipse cx={11}   cy={6}    rx={3.5} ry={4.8}
          transform="rotate(-10 11 6)"      fill={color} />
        <Ellipse cx={11}   cy={6}    rx={2.1} ry={2.9}
          transform="rotate(-10 11 6)"      fill={PAD_BROWN} />

        <Ellipse cx={21}   cy={6}    rx={3.5} ry={4.8}
          transform="rotate(10 21 6)"       fill={color} />
        <Ellipse cx={21}   cy={6}    rx={2.1} ry={2.9}
          transform="rotate(10 21 6)"       fill={PAD_BROWN} />

        <Ellipse cx={27.5} cy={11.5} rx={3.5} ry={4.8}
          transform="rotate(28 27.5 11.5)"  fill={color} />
        <Ellipse cx={27.5} cy={11.5} rx={2.1} ry={2.9}
          transform="rotate(28 27.5 11.5)"  fill={PAD_BROWN} />
      </G>
    </Svg>
  );
}

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <View style={[styles.wrapper, { bottom: bottomPad }]}>
      <View style={styles.pill}>
        {TABS.map((tab, index) => {
          const isFocused = state.index === index;
          const route = state.routes[index];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabBtn}
              onPress={onPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}>

              <View style={styles.iconWrap}>
                {isFocused && (
                  <View style={styles.pawBg} pointerEvents="none">
                    <PawPrint color={COLORS.accent3} />
                  </View>
                )}
                <Image
                  source={tab.icon}
                  style={[
                    styles.icon,
                    { marginTop: ICON_TOP },
                    isFocused ? styles.iconActive : styles.iconInactive,
                  ]}
                  resizeMode="contain"
                />
              </View>

              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(6,3,0,0.85)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,140,0,0.35)',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 20,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 2,
    paddingBottom: 16,
  },
  iconWrap: {
    width: PAW_SIZE,
    height: PAW_SIZE,
    alignItems: 'center',
  },
  pawBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PAW_SIZE,
    height: PAW_SIZE,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  iconInactive: {
    tintColor: COLORS.textMuted,
  },
  iconActive: {
    tintColor: '#FFFFFF',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    color: COLORS.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: COLORS.accent3,
    fontWeight: '700',
  },
});
