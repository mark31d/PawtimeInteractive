// File: Components/NotesScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp, uid, todayISO } from '../App';
import COLORS from './Colors';
import AppModal from './AppModal';
import { ICONS, IMAGES } from './AssetRegistry';

const CATEGORIES = [
  { key: 'play',    label: 'Play',    color: '#FF8C00' },
  { key: 'feed',    label: 'Feed',    color: '#4CAF50' },
  { key: 'groom',   label: 'Groom',   color: '#9B59B6' },
  { key: 'vet',     label: 'Vet',     color: '#E74C3C' },
  { key: 'nap',     label: 'Nap',     color: '#3498DB' },
  { key: 'observe', label: 'Observe', color: '#3EB3C2' },
];

const MOODS = [
  { value: 1, label: 'Poor',  color: '#E74C3C' },
  { value: 2, label: 'Meh',   color: '#FF8C00' },
  { value: 3, label: 'OK',    color: '#FFD700' },
  { value: 4, label: 'Good',  color: '#8BC34A' },
  { value: 5, label: 'Great', color: '#4CAF50' },
];

const EMPTY_ENTRY = { category: 'play', mood: 3, note: '' };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function formatDateHeader(dateStr) {
  const today = todayKey();
  const yesterday = yesterdayKey();
  if (dateStr === today) { return 'Today'; }
  if (dateStr === yesterday) { return 'Yesterday'; }
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(isoStr) {
  if (!isoStr) { return ''; }
  try {
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function MoodBar({ mood }) {
  const m = MOODS.find(x => x.value === mood) || MOODS[2];
  return (
    <View style={styles.moodRow}>
      {MOODS.map(x => (
        <View
          key={x.value}
          style={[
            styles.moodDot,
            { backgroundColor: x.value <= mood ? m.color : COLORS.cardBorder },
          ]}
        />
      ))}
      <Text style={[styles.moodLabel, { color: m.color }]}>{m.label}</Text>
    </View>
  );
}

function EntryCard({ entry, onEdit, onDelete }) {
  const cat = CATEGORIES.find(c => c.key === entry.category) || CATEGORIES[0];
  return (
    <View style={[styles.entryCard, { borderLeftColor: cat.color }]}>
      <View style={styles.entryTop}>
        <View style={[styles.catBadge, { borderColor: cat.color, backgroundColor: cat.color + '22' }]}>
          <Text style={[styles.catBadgeText, { color: cat.color }]}>{cat.label}</Text>
        </View>
        <Text style={styles.entryTime}>{formatTime(entry.createdAtISO)}</Text>
        <TouchableOpacity onPress={() => onEdit(entry)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }} activeOpacity={0.7}>
          <Text style={styles.actionEdit}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(entry)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }} activeOpacity={0.7}>
          <Text style={styles.actionDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
      <MoodBar mood={entry.mood} />
      {entry.note ? (
        <Text style={styles.entryNote} numberOfLines={3}>{entry.note}</Text>
      ) : null}
    </View>
  );
}

function DateSection({ dateStr, items, onEdit, onDelete }) {
  return (
    <View style={styles.dateSection}>
      <View style={styles.dateDivider}>
        <View style={styles.dateLine} />
        <Text style={styles.dateLabel}>{formatDateHeader(dateStr)}</Text>
        <View style={styles.dateLine} />
      </View>
      {items.map(entry => (
        <EntryCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </View>
  );
}

export default function NotesScreen() {
  const navigation = useNavigation();
  const { state, setState } = useApp();
  const [activeFilter, setActiveFilter]   = useState('all');
  const [editModal, setEditModal]         = useState(false);
  const [editEntry, setEditEntry]         = useState({ ...EMPTY_ENTRY });
  const [editDate, setEditDate]           = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deleteModal, setDeleteModal]     = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const entries = state.notes || [];

  /* ── Stats ── */
  const todayCount = useMemo(
    () => entries.filter(e => e.createdAtISO?.slice(0, 10) === todayKey()).length,
    [entries],
  );

  const streak = useMemo(() => {
    const days = new Set(entries.map(e => e.createdAtISO?.slice(0, 10)));
    let count = 0;
    const d = new Date();
    while (days.has(d.toISOString().slice(0, 10))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [entries]);

  /* ── Grouped timeline ── */
  const grouped = useMemo(() => {
    const filtered = activeFilter === 'all'
      ? [...entries]
      : entries.filter(e => e.category === activeFilter);
    filtered.sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO));
    const map = {};
    filtered.forEach(e => {
      const key = e.createdAtISO?.slice(0, 10) || todayKey();
      if (!map[key]) { map[key] = []; }
      map[key].push(e);
    });
    return Object.entries(map).map(([date, items]) => ({ date, items }));
  }, [entries, activeFilter]);

  /* ── Actions ── */
  const openAdd = () => {
    setEditEntry({ ...EMPTY_ENTRY, id: null });
    setEditDate(new Date());
    setShowDatePicker(false);
    setEditModal(true);
  };

  const openEdit = entry => {
    setEditEntry({ ...entry });
    setEditDate(entry.createdAtISO ? new Date(entry.createdAtISO) : new Date());
    setShowDatePicker(false);
    setEditModal(true);
  };

  const openDelete = entry => {
    setEntryToDelete(entry);
    setDeleteModal(true);
  };

  const saveEntry = () => {
    const isoDate = editDate.toISOString();
    const now     = todayISO();
    setState(prev => {
      const existing = (prev.notes || []).find(n => n.id === editEntry.id);
      let updated;
      if (existing) {
        updated = (prev.notes || []).map(n =>
          n.id === editEntry.id
            ? { ...editEntry, createdAtISO: isoDate, updatedAtISO: now }
            : n,
        );
      } else {
        updated = [
          ...(prev.notes || []),
          { ...editEntry, id: uid(), createdAtISO: isoDate, updatedAtISO: isoDate },
        ];
      }
      return { ...prev, notes: updated };
    });
    setShowDatePicker(false);
    setEditModal(false);
  };

  const doDelete = () => {
    if (!entryToDelete) { return; }
    setState(prev => ({
      ...prev,
      notes: (prev.notes || []).filter(n => n.id !== entryToDelete.id),
    }));
    setDeleteModal(false);
    setEntryToDelete(null);
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={IMAGES.bg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerInner}>
          <Text style={styles.headerTitle}>Pawlog</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addBtn} onPress={() => openAdd()} activeOpacity={0.82}>
              <Text style={styles.addBtnText}>+ Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gearBtn}
              onPress={() => navigation.getParent()?.navigate('Settings')}
              activeOpacity={0.7}>
              <Image source={ICONS.tab_settings} style={styles.gearIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{todayCount}</Text>
          <Text style={styles.statSub}>Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{entries.length}</Text>
          <Text style={styles.statSub}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: COLORS.accent1 }]}>{streak}d</Text>
          <Text style={styles.statSub}>Streak</Text>
        </View>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipAll]}
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.75}>
          <Text style={[styles.filterChipText, activeFilter === 'all' && { color: '#fff' }]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.filterChip,
              activeFilter === cat.key && { backgroundColor: cat.color, borderColor: cat.color },
            ]}
            onPress={() => setActiveFilter(activeFilter === cat.key ? 'all' : cat.key)}
            activeOpacity={0.75}>
            <Text style={[styles.filterChipText, activeFilter === cat.key && { color: '#fff' }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline */}
      <FlatList
        data={grouped}
        keyExtractor={g => g.date}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Tap a category in "Quick log" or use "+ Log" to record your first cat activity.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <DateSection
            dateStr={item.date}
            items={item.items}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        )}
      />

      {/* Add / Edit modal */}
      <AppModal
        visible={editModal}
        title={editEntry.id ? 'Edit Entry' : 'New Entry'}
        primaryLabel="Save"
        onPrimary={saveEntry}
        secondaryLabel="Cancel"
        onSecondary={() => setEditModal(false)}
        onClose={() => setEditModal(false)}
        maxHeight={460}>

        <Text style={styles.formLabel}>Date</Text>
        <TouchableOpacity
          style={[styles.dateBtn, showDatePicker && styles.dateBtnActive]}
          onPress={() => setShowDatePicker(v => !v)}
          activeOpacity={0.75}>
          <Text style={[styles.dateBtnText, showDatePicker && styles.dateBtnTextActive]}>
            {editDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          <Text style={[styles.dateBtnArrow, showDatePicker && styles.dateBtnTextActive]}>
            {showDatePicker ? 'v' : '>'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={editDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={(_, date) => {
              if (date) { setEditDate(date); }
            }}
            textColor={COLORS.text}
            style={styles.datePicker}
          />
        )}

        <Text style={styles.formLabel}>Activity</Text>
        <View style={styles.formChips}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.formChip,
                { borderColor: cat.color },
                editEntry.category === cat.key && { backgroundColor: cat.color },
              ]}
              onPress={() => setEditEntry(prev => ({ ...prev, category: cat.key }))}
              activeOpacity={0.75}>
              <Text style={[
                styles.formChipText,
                { color: editEntry.category === cat.key ? '#fff' : cat.color },
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.formLabel}>Cat mood</Text>
        <View style={styles.moodSelector}>
          {MOODS.map(m => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.moodOption,
                editEntry.mood === m.value && {
                  backgroundColor: m.color + '33',
                  borderColor: m.color,
                },
              ]}
              onPress={() => setEditEntry(prev => ({ ...prev, mood: m.value }))}
              activeOpacity={0.75}>
              <Text style={[
                styles.moodOptionText,
                editEntry.mood === m.value && { color: m.color, fontWeight: '700' },
              ]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.formLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.formInput}
          value={editEntry.note}
          onChangeText={v => setEditEntry(prev => ({ ...prev, note: v }))}
          placeholder="Any observations..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </AppModal>

      {/* Delete modal */}
      <AppModal
        visible={deleteModal}
        title="Delete Entry"
        primaryLabel="Delete"
        primaryDanger
        onPrimary={doDelete}
        secondaryLabel="Cancel"
        onSecondary={() => setDeleteModal(false)}
        onClose={() => setDeleteModal(false)}>
        <Text style={styles.deleteText}>
          Remove this entry? This action cannot be undone.
        </Text>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  headerWrap: { backgroundColor: 'transparent' },
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
  addBtn: {
    backgroundColor: COLORS.accent1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
  gearBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1, borderColor: COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  gearIcon: { width: 24, height: 24, tintColor: COLORS.accent1 },

  // Stats
  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  statSub: {
    fontSize: 10, color: COLORS.textMuted, marginTop: 2,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  statDivider: { width: 1, backgroundColor: COLORS.cardBorder },

  // Filter
  filterScroll: { maxHeight: 36, marginBottom: 10 },
  filterRow: { paddingHorizontal: 16, gap: 6, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  filterChipAll: { backgroundColor: COLORS.accent2, borderColor: COLORS.accent2 },
  filterChipText: { fontSize: 11, color: COLORS.textSecondary },

  // Timeline
  list: { paddingHorizontal: 16, paddingBottom: 110 },
  dateSection: { marginBottom: 6 },
  dateDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  dateLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dateLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginHorizontal: 10,
  },

  // Entry card
  entryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderLeftWidth: 4,
  },
  entryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  catBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  entryTime: { flex: 1, fontSize: 11, color: COLORS.textMuted },
  actionEdit: { fontSize: 12, color: COLORS.accent1, fontWeight: '600' },
  actionDelete: { fontSize: 12, color: COLORS.warning, fontWeight: '600' },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  moodLabel: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
  entryNote: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  // Date picker
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  dateBtnActive: { backgroundColor: COLORS.accent3, borderColor: COLORS.accent3 },
  dateBtnText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  dateBtnTextActive: { color: '#3D1A00', fontWeight: '700' },
  dateBtnArrow: { fontSize: 12, color: COLORS.textMuted },
  datePicker: { height: 150, marginTop: 4 },

  // Modal form
  formLabel: {
    fontSize: 11, color: COLORS.textMuted, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 7, marginTop: 14,
  },
  formChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  formChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 14, borderWidth: 1.5,
  },
  formChipText: { fontSize: 12, fontWeight: '700' },
  moodSelector: { flexDirection: 'row', gap: 5 },
  moodOption: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardAlt,
  },
  moodOptionText: { fontSize: 11, color: COLORS.textSecondary },
  formInput: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: 10, color: COLORS.text, fontSize: 14, minHeight: 80,
  },
  deleteText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
});
