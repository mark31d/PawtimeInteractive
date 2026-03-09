// File: Components/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../App';
import COLORS from './Colors';
import { IMAGES } from './AssetRegistry';

const SLIDES = [
  {
    key: 'welcome',
    title: 'Welcome to Cat Atlas',
    body: 'Your complete guide to cat breeds, care routines, and personal notes — all in one place.',
    accentColor: COLORS.accent1,
  },
  {
    key: 'breeds',
    title: 'Explore 12+ Breeds',
    body: 'Detailed profiles with temperament, grooming needs, stats charts, and origin maps.',
    accentColor: COLORS.accent2,
  },
  {
    key: 'care',
    title: 'Daily Care Tracker',
    body: 'Build healthy habits with task checklists, mood logs, and streak tracking.',
    accentColor: COLORS.success,
  },
  {
    key: 'notes',
    title: 'Personal Notes',
    body: 'Attach observations to specific breeds, add tags, and search your notes easily.',
    accentColor: COLORS.accent3,
  },
];

export default function OnboardingScreen() {
  const { finishOnboarding } = useApp();
  const [slide, setSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (slide < SLIDES.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
      setSlide(s => s + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    finishOnboarding();
  };

  const current = SLIDES[slide];

  return (
    <ImageBackground source={IMAGES.bg} style={StyleSheet.absoluteFillObject} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <View style={styles.logoWrap}>
          <Image source={IMAGES.logo} style={styles.logo} resizeMode="contain" />
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.textCard}>
            <View style={[styles.accentBar, { backgroundColor: current.accentColor }]} />
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.body}>{current.body}</Text>
          </View>
        </Animated.View>

        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === slide && {
                  backgroundColor: current.accentColor,
                  width: 20,
                },
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnArea}>
          {slide < SLIDES.length - 1 ? (
            <>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: current.accentColor }]}
                onPress={goNext}
                activeOpacity={0.82}>
                <Text style={styles.btnText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={finish} style={styles.skipBtn} activeOpacity={0.6}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: current.accentColor }]}
              onPress={finish}
              activeOpacity={0.82}>
              <Text style={styles.btnText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  logoWrap: {
    alignItems: 'center',
    marginTop: 48,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  textCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  accentBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 38,
  },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cardBorder,
  },
  btnArea: {
    paddingHorizontal: 28,
    paddingBottom: 36,
    gap: 12,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
