import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, font, typography, radius, shadow, spacing } from '../../constants/theme';
import { useUser } from '../../lib/UserContext';
import { api } from '../../lib/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { UserPicker } from '../../components/UserPicker';
import type { Report } from '../../lib/types';

function fmt(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function ReportCard({ report, onPress }: { report: Report; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
      <Card style={styles.card}>
        {/* Row 1: name + badge */}
        <View style={styles.cardRow}>
          <Text style={styles.customerName} numberOfLines={1}>{report.customerName}</Text>
          <StatusBadge status={report.status} />
        </View>

        {/* Row 2: product + date */}
        <View style={[styles.cardRow, styles.cardMeta]}>
          <Text style={styles.metaText} numberOfLines={1}>{report.product}</Text>
          <Text style={styles.metaText}>{fmt(report.date)}</Text>
        </View>

        {/* Row 3: follow-up if present */}
        {report.followUpDate && (
          <View style={[styles.cardRow, styles.followUpRow]}>
            <Text style={styles.followUpLabel}>⏰ Follow-up</Text>
            <Text style={styles.followUpDate}>{fmt(report.followUpDate)}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

export default function ReportsScreen() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (isRefresh = false) => {
      if (!user) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      api.reports
        .list(user.id)
        .then((res) => setReports(res.data))
        .catch(() => setError('Could not load reports. Check your connection.'))
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [user],
  );

  useEffect(() => { load(); }, [load]);

  if (userLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
      </View>
    );
  }

  if (!user) return <UserPicker />;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
        <Text style={styles.loadingText}>Loading reports…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon="⚠️"
          title="Failed to load"
          message={error}
          action={
            <Button label="Try Again" variant="secondary" fullWidth onPress={() => load()} />
          }
        />
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(r) => r.id}
      contentContainerStyle={reports.length === 0 ? styles.emptyFlex : styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor={colors.brand.navy}
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon="📋"
          title="No Reports Yet"
          message="Your submitted call reports will appear here. Tap 'Add Report' to log your first customer visit."
          action={
            <Button
              label="Add Call Report"
              variant="primary"
              fullWidth
              onPress={() => router.push('/(tabs)/add')}
            />
          }
        />
      }
      renderItem={({ item }) => (
        <ReportCard
          report={item}
          onPress={() => router.push(`/report/${item.id}`)}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    padding: 24,
  },
  loadingText: {
    ...typography.sm,
    fontFamily: font.regular,
    color: colors.gray[400],
    marginTop: 12,
  },
  listContent: {
    padding: 16,
  },
  emptyFlex: {
    flex: 1,
    padding: 16,
  },
  card: {
    ...shadow.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    marginTop: 8,
  },
  customerName: {
    ...typography.base,
    fontFamily: font.semibold,
    color: colors.gray[900],
    flex: 1,
    marginRight: 8,
  },
  metaText: {
    ...typography.sm,
    fontFamily: font.regular,
    color: colors.gray[500],
  },
  followUpRow: {
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  followUpLabel: {
    ...typography.xs,
    fontFamily: font.semibold,
    color: '#92400E',
  },
  followUpDate: {
    ...typography.xs,
    fontFamily: font.semibold,
    color: '#92400E',
  },
});
