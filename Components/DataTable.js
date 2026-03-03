// File: Components/DataTable.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import COLORS from './Colors';

/**
 * Universal data table.
 *
 * Props:
 *   headers: string[]
 *   rows: (string|number)[][]
 *   columnWidths?: number[]  (flex values, default 1 each)
 *   firstColumnBold?: bool
 */
export default function DataTable({
  headers = [],
  rows = [],
  columnWidths,
  firstColumnBold = true,
  fillWidth = false,
}) {
  const flexes = columnWidths || headers.map(() => 1);

  const inner = (
    <View style={fillWidth ? styles.fillInner : undefined}>
      {/* Header row */}
      <View style={[styles.row, styles.headerRow]}>
        {headers.map((h, i) => (
          <View key={i} style={[styles.cell, { flex: flexes[i] || 1 }]}>
            <Text style={styles.headerText} numberOfLines={2}>{h}</Text>
          </View>
        ))}
      </View>
      {/* Data rows */}
      {rows.length === 0 ? (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>No data</Text>
        </View>
      ) : (
        rows.map((row, ri) => (
          <View key={ri} style={[styles.row, ri % 2 === 1 && styles.altRow]}>
            {Array.isArray(row)
              ? row.map((cell, ci) => (
                  <View key={ci} style={[styles.cell, { flex: flexes[ci] || 1 }]}>
                    <Text
                      style={[
                        styles.cellText,
                        ci === 0 && firstColumnBold && styles.boldText,
                      ]}
                      numberOfLines={2}>
                      {cell !== null && cell !== undefined ? String(cell) : '-'}
                    </Text>
                  </View>
                ))
              : null}
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {fillWidth ? inner : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {inner}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  headerRow: {
    backgroundColor: '#162040',
  },
  altRow: {
    backgroundColor: 'rgba(110,168,255,0.04)',
  },
  fillInner: {
    width: '100%',
  },
  cell: {
    padding: 10,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 11,
    color: COLORS.accent1,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cellText: {
    fontSize: 13,
    color: COLORS.text,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyRow: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
