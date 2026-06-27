import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { api } from '../lib/api';
import { useUser } from '../lib/UserContext';
import { colors, font, typography, radius, shadow } from '../constants/theme';
import type { User } from '../lib/types';

export function UserPicker() {
  const { setUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    api.users
      .list()
      .then((res) => setUsers(res.data))
      .catch(() => setError('Could not load team members. Check your connection.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Who are you?</Text>
          <Text style={styles.headerSub}>Select your name to continue</Text>
        </View>

        {/* Body */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand.navy} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryLabel}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.errorIcon}>👥</Text>
            <Text style={styles.errorText}>No sales reps found in the system.</Text>
            <Text style={styles.errorSub}>Ask your manager to add you via the web dashboard.</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(u) => u.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                activeOpacity={0.7}
                onPress={() => setUser(item)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemEmail}>{item.email}</Text>
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleLabel}>
                    {item.role === 'manager' ? 'Manager' : 'Sales Rep'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.brand.navy,
    paddingTop: 64,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  headerTitle: {
    ...typography['2xl'],
    fontFamily: font.bold,
    color: colors.white,
    marginBottom: 4,
  },
  headerSub: {
    ...typography.sm,
    fontFamily: font.regular,
    color: 'rgba(255,255,255,0.65)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    ...typography.base,
    fontFamily: font.semibold,
    color: colors.gray[700],
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSub: {
    ...typography.sm,
    fontFamily: font.regular,
    color: colors.gray[500],
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: colors.brand.navy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.xl,
  },
  retryLabel: {
    ...typography.base,
    fontFamily: font.semibold,
    color: colors.white,
  },
  list: {
    padding: 16,
  },
  sep: {
    height: 8,
  },
  item: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
    ...shadow.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    ...typography.lg,
    fontFamily: font.bold,
    color: colors.white,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    ...typography.base,
    fontFamily: font.semibold,
    color: colors.gray[900],
  },
  itemEmail: {
    ...typography.xs,
    fontFamily: font.regular,
    color: colors.gray[500],
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.gray[100],
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  roleLabel: {
    ...typography.xs,
    fontFamily: font.semibold,
    color: colors.gray[600],
  },
});
