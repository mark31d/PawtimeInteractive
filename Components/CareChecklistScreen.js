// File: Components/CareChecklistScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  useApp,
  uid,
  todayISO,
  formatDisplayDate,
  shortDay,
  calcStreak,
} from '../App';
import COLORS from './Colors';
import AppModal from './AppModal';
import { IMAGES } from './AssetRegistry';

const MOOD_LABELS = ['', 'Hard day', 'Meh', 'Okay', 'Good', 'Great'];
const MOOD_COLORS = ['', COLORS.warning, '#FF9D5C', '#FFD166', COLORS.success, COLORS.accent3];

const CATEGORY_COLORS = {
  feeding: COLORS.success,
  play: COLORS.accent2,
  grooming: COLORS.accent1,
  health: COLORS.warning,
};

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export default function CareChecklistScreen() {
  const navigation = useNavigation();
  const { state, setState } = useApp();

  const today = todayISO();
  const tasks = state.careChecklist?.tasks || [];
  const logs = state.careChecklist?.logs || [];

  const todayLog = logs.find(l => l.dateISO === today) || {
    id: null,
    dateISO: today,
    doneTaskIds: [],
    mood: 0,
    comment: '',
  };

  const [mood, setMood] = useState(todayLog.mood || 0);
  const [comment, setComment] = useState(todayLog.comment || '');
  const [deleteTaskModal, setDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [saveModal, setSaveModal] = useState(false);

  const enabledTasks = tasks.filter(t => t.enabled);
  const doneIds = todayLog.doneTaskIds || [];

  const streak = useMemo(() => calcStreak(logs), [logs]);

  const toggleTask = taskId => {
    setState(prev => {
      const logs2 = prev.careChecklist?.logs || [];
      const existing = logs2.find(l => l.dateISO === today);
      let newDone;
      if (existing) {
        newDone = existing.doneTaskIds.includes(taskId)
          ? existing.doneTaskIds.filter(d => d !== taskId)
          : [...existing.doneTaskIds, taskId];
        return {
          ...prev,
          careChecklist: {
            ...prev.careChecklist,
            logs: logs2.map(l =>
              l.dateISO === today ? { ...l, doneTaskIds: newDone } : l,
            ),
          },
        };
      } else {
        const newLog = {
          id: uid(),
          dateISO: today,
          doneTaskIds: [taskId],
          mood: 0,
          comment: '',
        };
        return {
          ...prev,
          careChecklist: {
            ...prev.careChecklist,
            logs: [...logs2, newLog],
          },
        };
      }
    });
  };

  const saveMoodComment = () => {
    setState(prev => {
      const logs2 = prev.careChecklist?.logs || [];
      const existing = logs2.find(l => l.dateISO === today);
      if (existing) {
        return {
          ...prev,
          careChecklist: {
            ...prev.careChecklist,
            logs: logs2.map(l =>
              l.dateISO === today ? { ...l, mood, comment } : l,
            ),
          },
        };
      } else {
        return {
          ...prev,
          careChecklist: {
            ...prev.careChecklist,
            logs: [
              ...logs2,
              { id: uid(), dateISO: today, doneTaskIds: [], mood, comment },
            ],
          },
        };
      }
    });
    setSaveModal(true);
  };

  const confirmDeleteTask = t => {
    setTaskToDelete(t);
    setDeleteTaskModal(true);
  };

  const doDeleteTask = () => {
    if (!taskToDelete) { return; }
    setState(prev => ({
      ...prev,
      careChecklist: {
        ...prev.careChecklist,
        tasks: prev.careChecklist.tasks.filter(t => t.id !== taskToDelete.id),
      },
    }));
    setDeleteTaskModal(false);
    setTaskToDelete(null);
  };

  const days7 = last7Days();

  return (
    <View style={styles.root}>
      <ImageBackground source={IMAGES.bg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerInner}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daily Checklist</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{streak}d</Text>
            </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.dateLabel}>{formatDisplayDate(today)}</Text>

        {/* Progress */}
        {enabledTasks.length > 0 ? (
          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(
                      (doneIds.length / enabledTasks.length) * 100,
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {doneIds.length}/{enabledTasks.length} tasks done
            </Text>
          </View>
        ) : null}

        {/* Task list */}
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        {enabledTasks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No tasks yet. Add some from Care Guides.
            </Text>
          </View>
        ) : (
          enabledTasks.map(task => {
            const done = doneIds.includes(task.id);
            const catColor = CATEGORY_COLORS[task.category] || COLORS.accent1;
            return (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskRow, done && styles.taskRowDone]}
                onPress={() => toggleTask(task.id)}
                activeOpacity={0.8}>
                <View
                  style={[
                    styles.taskCheck,
                    done && { backgroundColor: catColor, borderColor: catColor },
                  ]}>
                  {done ? <View style={styles.checkMark} /> : null}
                </View>
                <View style={styles.taskInfo}>
                  <Text
                    style={[styles.taskTitle, done && styles.taskTitleDone]}>
                    {task.title}
                  </Text>
                  <Text style={[styles.taskCat, { color: catColor }]}>
                    {task.category}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => confirmDeleteTask(task)}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  activeOpacity={0.6}>
                  <Text style={styles.deleteIcon}>x</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}

        {/* Mood */}
        <Text style={styles.sectionTitle}>How was today?</Text>
        <View style={styles.moodRow}>
          {[1, 2, 3, 4, 5].map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.moodBtn, mood === m && { backgroundColor: MOOD_COLORS[m] }]}
              onPress={() => setMood(m)}
              activeOpacity={0.8}>
              <Text style={styles.moodNum}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {mood > 0 ? (
          <Text style={[styles.moodLabel, { color: MOOD_COLORS[mood] }]}>
            {MOOD_LABELS[mood]}
          </Text>
        ) : null}

        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Add a comment about today..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveMoodComment}
          activeOpacity={0.82}>
          <Text style={styles.saveBtnText}>Save Today's Log</Text>
        </TouchableOpacity>

        {/* 7 day history */}
        <Text style={styles.sectionTitle}>Last 7 Days</Text>
        <View style={styles.historyGrid}>
          {days7.map(d => {
            const log = logs.find(l => l.dateISO === d);
            const done = log?.doneTaskIds?.length || 0;
            const hasData = done > 0 || (log?.mood && log.mood > 0);
            return (
              <View
                key={d}
                style={[
                  styles.dayBox,
                  d === today && styles.dayBoxToday,
                  hasData && styles.dayBoxFilled,
                ]}>
                <Text style={styles.dayLabel}>{shortDay(d)}</Text>
                <Text style={styles.dayDone}>{done}</Text>
                {log?.mood ? (
                  <View
                    style={[
                      styles.moodDot,
                      { backgroundColor: MOOD_COLORS[log.mood] || COLORS.textMuted },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Delete task modal */}
      <AppModal
        visible={deleteTaskModal}
        title="Remove Task"
        primaryLabel="Remove"
        primaryDanger
        onPrimary={doDeleteTask}
        secondaryLabel="Cancel"
        onSecondary={() => setDeleteTaskModal(false)}
        onClose={() => setDeleteTaskModal(false)}>
        <Text style={styles.modalText}>
          Remove "{taskToDelete?.title}" from your checklist?
        </Text>
      </AppModal>

      {/* Save confirmation modal */}
      <AppModal
        visible={saveModal}
        title="Log Saved"
        primaryLabel="Done"
        onPrimary={() => setSaveModal(false)}
        onClose={() => setSaveModal(false)}>
        <Text style={styles.modalText}>
          Today's mood and comment have been saved.
        </Text>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: { backgroundColor: 'transparent' },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backText: { color: COLORS.accent1, fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  streakBadge: {
    backgroundColor: COLORS.accent2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  scroll: { padding: 16, paddingBottom: 40 },
  dateLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  progressWrap: { marginBottom: 16 },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.cardBorder,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  progressLabel: { fontSize: 12, color: COLORS.textSecondary },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 18,
    marginBottom: 10,
  },
  emptyBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  taskRowDone: { opacity: 0.65 },
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  taskTitleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  taskCat: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  deleteIcon: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  moodRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  moodBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  moodNum: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  moodLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  commentInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.accent1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historyGrid: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dayBox: {
    width: 42,
    height: 58,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  dayBoxToday: { borderColor: COLORS.accent1 },
  dayBoxFilled: { backgroundColor: 'rgba(110,168,255,0.08)' },
  dayLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600' },
  dayDone: { fontSize: 16, color: COLORS.text, fontWeight: '700', marginVertical: 2 },
  moodDot: { width: 6, height: 6, borderRadius: 3 },
  modalText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
});
