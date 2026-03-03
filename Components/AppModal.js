// File: Components/AppModal.js
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import COLORS from './Colors';

const { width: SCREEN_W } = Dimensions.get('window');

/**
 * Universal modal component.
 *
 * Props:
 *   visible: bool
 *   title: string
 *   onClose: fn  (called on backdrop tap or close)
 *   primaryLabel: string
 *   onPrimary: fn
 *   secondaryLabel?: string
 *   onSecondary?: fn
 *   primaryDanger?: bool  (makes primary button red)
 *   maxHeight?: number
 *   children: ReactNode
 */
export default function AppModal({
  visible = false,
  title = '',
  onClose,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDanger = false,
  maxHeight,
  children,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(30);
    }
  }, [visible, opacity, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}>
        <Animated.View
          style={[styles.sheet, { opacity, transform: [{ translateY }] }]}>
          <TouchableOpacity activeOpacity={1}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            <ScrollView
              style={maxHeight ? { maxHeight } : { maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
            {(primaryLabel || secondaryLabel) ? (
              <View style={styles.btnRow}>
                {secondaryLabel ? (
                  <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={onSecondary || onClose}
                    activeOpacity={0.75}>
                    <Text style={styles.btnSecondaryText}>{secondaryLabel}</Text>
                  </TouchableOpacity>
                ) : null}
                {primaryLabel ? (
                  <TouchableOpacity
                    style={[
                      styles.btnPrimary,
                      primaryDanger && styles.btnDanger,
                      !secondaryLabel && styles.btnPrimaryFull,
                    ]}
                    onPress={onPrimary}
                    activeOpacity={0.8}>
                    <Text style={styles.btnPrimaryText}>{primaryLabel}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: Math.min(SCREEN_W - 40, 400),
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.accent1,
    alignItems: 'center',
  },
  btnPrimaryFull: {
    flex: 1,
  },
  btnDanger: {
    backgroundColor: COLORS.warning,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
