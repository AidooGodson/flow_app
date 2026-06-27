import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, font, typography, radius } from '../constants/theme';

interface Props {
  icon: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: `${colors.brand.navy}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    ...typography.lg,
    fontFamily: font.bold,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    ...typography.sm,
    fontFamily: font.regular,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: 24,
    width: '100%',
  },
});
