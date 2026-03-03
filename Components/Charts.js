// File: Components/Charts.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Text as SvgText,
  Path,
  Circle,
  G,
  Line,
} from 'react-native-svg';
import COLORS from './Colors';

// ─── BarChartSimple ───────────────────────────────────────────────────────────
/**
 * data: [{label, value, color?}]
 * width, height, barColor, showAverage
 */
export function BarChartSimple({
  data = [],
  width = 280,
  height = 140,
  barColor = COLORS.accent1,
  showAverage = false,
  averageColor = COLORS.accent2,
}) {
  if (!data || data.length === 0) {
    return <EmptyChart width={width} height={height} />;
  }

  const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 1);
  const padLeft = 8;
  const padRight = 8;
  const padTop = 18;
  const labelH = 28;
  const chartH = height - padTop - labelH;
  const totalW = width - padLeft - padRight;
  const barW = Math.max(8, totalW / data.length - 6);
  const gap = totalW / data.length;

  const avg =
    showAverage && data.length > 0
      ? data.reduce((s, d) => s + (Number(d.value) || 0), 0) / data.length
      : null;

  const avgY = avg != null ? padTop + chartH - (avg / maxVal) * chartH : null;

  return (
    <Svg width={width} height={height}>
      {data.map((item, i) => {
        const val = Number(item.value) || 0;
        const barH = Math.max(2, (val / maxVal) * chartH);
        const x = padLeft + i * gap + (gap - barW) / 2;
        const y = padTop + chartH - barH;
        return (
          <G key={i}>
            <Rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={item.color || barColor}
              opacity={0.9}
            />
            <SvgText
              x={x + barW / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize={9}
              fill={COLORS.textSecondary}>
              {item.label}
            </SvgText>
            <SvgText
              x={x + barW / 2}
              y={y - 3}
              textAnchor="middle"
              fontSize={9}
              fill={COLORS.text}>
              {val}
            </SvgText>
          </G>
        );
      })}
      {avgY != null && (
        <Line
          x1={padLeft}
          y1={avgY}
          x2={width - padRight}
          y2={avgY}
          stroke={averageColor}
          strokeWidth={1.5}
          strokeDasharray="4,3"
          opacity={0.7}
        />
      )}
    </Svg>
  );
}

// ─── DonutChartSimple ─────────────────────────────────────────────────────────
/**
 * data: [{label, value, color}]
 * size: diameter
 */
export function DonutChartSimple({ data = [], size = 160 }) {
  if (!data || data.length === 0) {
    return <EmptyChart width={size} height={size} />;
  }

  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const ir = r * 0.58;

  let startAngle = -Math.PI / 2;
  const slices = data.map(item => {
    const angle = (Math.max(Number(item.value) || 0, 0) / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ir * Math.cos(startAngle);
    const iy1 = cy + ir * Math.sin(startAngle);
    const ix2 = cx + ir * Math.cos(endAngle);
    const iy2 = cy + ir * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d =
      `M ${x1.toFixed(2)} ${y1.toFixed(2)} ` +
      `A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} ` +
      `L ${ix2.toFixed(2)} ${iy2.toFixed(2)} ` +
      `A ${ir} ${ir} 0 ${largeArc} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z`;
    const result = { d, color: item.color, label: item.label, value: item.value };
    startAngle = endAngle;
    return result;
  });

  return (
    <Svg width={size} height={size}>
      {slices.map((slice, i) => (
        <Path key={i} d={slice.d} fill={slice.color} opacity={0.92} />
      ))}
    </Svg>
  );
}

// ─── LineChartSimple ──────────────────────────────────────────────────────────
/**
 * data: [{label, value}]
 * width, height, lineColor
 */
export function LineChartSimple({
  data = [],
  width = 280,
  height = 120,
  lineColor = COLORS.accent1,
  fillColor,
}) {
  if (!data || data.length < 2) {
    return <EmptyChart width={width} height={height} />;
  }

  const values = data.map(d => Number(d.value) || 0);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values, minVal + 1);
  const range = maxVal - minVal || 1;

  const padX = 20;
  const padTop = 10;
  const padBottom = 22;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const toX = i => padX + (i / (data.length - 1)) * chartW;
  const toY = v => padTop + chartH - ((v - minVal) / range) * chartH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(Number(d.value) || 0) }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(padTop + chartH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`;

  return (
    <Svg width={width} height={height}>
      {fillColor && <Path d={areaD} fill={fillColor} opacity={0.12} />}
      <Path
        d={pathD}
        stroke={lineColor}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={lineColor} />
      ))}
      {data.map((d, i) => (
        <SvgText
          key={i}
          x={points[i].x}
          y={height - 5}
          textAnchor="middle"
          fontSize={8}
          fill={COLORS.textSecondary}>
          {d.label}
        </SvgText>
      ))}
    </Svg>
  );
}

// ─── Empty placeholder ────────────────────────────────────────────────────────
function EmptyChart({ width, height }) {
  return (
    <View style={[styles.empty, { width, height }]}>
      <Text style={styles.emptyText}>No data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
