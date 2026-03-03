// File: Components/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { useApp } from '../App';
import COLORS from './Colors';
import AppModal from './AppModal';

const APP_VERSION = '1.0.0';

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({ label, sub, onPress, right, last }) {
  const Inner = (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {right ? <View style={styles.rowRight}>{right}</View> : null}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {Inner}
      </TouchableOpacity>
    );
  }
  return Inner;
}

export default function SettingsScreen({ navigation }) {
  const { state, setState, resetAll } = useApp();
  const [resetModal, setResetModal]       = useState(false);
  const [resetDoneModal, setResetDoneModal] = useState(false);

  const prefs   = state.preferences || {};
  const profile = state.profile     || {};

  const toggleUnits = () => {
    setState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        units: prev.preferences?.units === 'metric' ? 'imperial' : 'metric',
      },
    }));
  };

  const doReset = async () => {
    await resetAll();
    setResetModal(false);
    setResetDoneModal(true);
  };

  const pickAvatar = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      response => {
        if (!response.didCancel && !response.errorCode && response.assets?.[0]?.uri) {
          const uri = response.assets[0].uri;
          setState(prev => ({
            ...prev,
            profile: { ...prev.profile, avatarUri: uri },
          }));
        }
      },
    );
  };

  const onNameChange = text => {
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, name: text },
    }));
  };

  const initials = profile.name
    ? profile.name.trim().charAt(0).toUpperCase()
    : '?';

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backArrow}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <Section title="Profile">
          <View style={styles.profileBlock}>
            {/* Avatar */}
            <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} style={styles.avatarWrap}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{initials}</Text>
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarBadgeText}>+</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickAvatar} activeOpacity={0.75} style={styles.photoBtn}>
              <Text style={styles.photoBtnText}>Choose photo</Text>
            </TouchableOpacity>

            {/* Name */}
            <View style={styles.nameWrap}>
              <Text style={styles.nameLabel}>Name</Text>
              <TextInput
                style={styles.nameInput}
                value={profile.name || ''}
                onChangeText={onNameChange}
                placeholder="Your name"
                placeholderTextColor={COLORS.textMuted}
                maxLength={40}
                returnKeyType="done"
              />
            </View>
          </View>
        </Section>

        {/* About */}
        <Section title="About">
          <Row
            label="Cat Atlas"
            sub={`Version ${APP_VERSION} — Your complete cat care companion.`}
            last
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <Row
            label="Units"
            sub={prefs.units === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lb, in)'}
            last
            right={
              <Switch
                value={prefs.units === 'metric'}
                onValueChange={toggleUnits}
                trackColor={{ false: COLORS.cardBorder, true: COLORS.accent1 }}
                thumbColor={COLORS.white}
              />
            }
          />
        </Section>

        {/* Data */}
        <Section title="Data">
          <Row
            label="Breeds in catalog"
            sub="12 breeds built-in, no internet required"
          />
          <Row
            label="Pawlog entries"
            sub={`${(state.notes || []).length} ${(state.notes || []).length === 1 ? 'entry' : 'entries'} saved`}
            last
          />
        </Section>

        {/* Reset */}
        <Section title="Reset">
          <Row
            label="Delete all data"
            sub="Clears notes, logs, favorites, and preferences."
            onPress={() => setResetModal(true)}
            right={<Text style={styles.dangerArrow}>Delete</Text>}
            last
          />
        </Section>
      </ScrollView>

      {/* Reset confirmation */}
      <AppModal
        visible={resetModal}
        title="Delete All Data"
        primaryLabel="Delete Everything"
        primaryDanger
        onPrimary={doReset}
        secondaryLabel="Cancel"
        onSecondary={() => setResetModal(false)}
        onClose={() => setResetModal(false)}>
        <Text style={styles.modalText}>
          This will permanently delete all your notes, care logs, favorites, and
          preferences. This action cannot be undone.
        </Text>
      </AppModal>

      {/* Reset done */}
      <AppModal
        visible={resetDoneModal}
        title="Data Cleared"
        primaryLabel="OK"
        onPrimary={() => setResetDoneModal(false)}
        onClose={() => setResetDoneModal(false)}>
        <Text style={styles.modalText}>
          All data has been cleared. The app has been reset to its default state.
        </Text>
      </AppModal>
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
  },
  backBtn: { marginRight: 12, padding: 4 },
  backArrow: { fontSize: 22, color: COLORS.accent1, fontWeight: '700' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },

  scroll: { padding: 16, gap: 4, paddingBottom: 48 },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },

  // Profile block
  profileBlock: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: COLORS.accent1,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.cardAlt,
    borderWidth: 2.5,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeText: { color: '#000', fontSize: 16, fontWeight: '800', lineHeight: 20 },
  photoBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.accent1,
  },
  photoBtnText: { color: COLORS.accent1, fontSize: 13, fontWeight: '600' },
  nameWrap: { width: '100%', gap: 6 },
  nameLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  nameInput: {
    width: '100%',
    backgroundColor: COLORS.cardAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },

  row: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  rowLeft: { flex: 1 },
  rowLabel: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  rowSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  rowRight: { marginLeft: 12 },
  dangerArrow: { color: COLORS.warning, fontWeight: '700', fontSize: 13 },
  modalText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24 },
});
