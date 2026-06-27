import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, font, typography } from '../constants/theme';

const STATUS_MAP: Record<string, { bg: string; text: string }> = {
  New:       colors.status.New,
  Pending:   colors.status.Pending,
  Completed: colors.status.Completed,
  Reviewed:  colors.status.Reviewed,
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { bg: colors.gray[100], text: colors.gray[700] };
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.xs,
    fontFamily: font.semibold,
  },
});
