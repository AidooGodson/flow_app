import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, font, typography, radius, shadow } from '../../constants/theme';
import { api } from '../../lib/api';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import type { Report } from '../../lib/types';

function fmt(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={3}>{value}</Text>
    </View>
  );
}

function NoteBlock({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.noteBlock}>
      <Text style={styles.noteLabel}>{label}</Text>
      <Text style={styles.noteText}>{text}</Text>
    </View>
  );
}

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.reports
      .get(id)
      .then((res) => setReport(res.data))
      .catch(() => setError('Could not load report. It may have been deleted.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
        <Text style={styles.loadingText}>Loading report…</Text>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorTitle}>Report not found</Text>
        <Text style={styles.errorMsg}>{error ?? 'This report could not be loaded.'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

      {/* Header card */}
      <Card style={styles.headerCard}>
        <Text style={styles.customerName}>{report.customerName}</Text>
        <View style={styles.headerMeta}>
          <StatusBadge status={report.status} />
          <Text style={styles.headerDate}>{fmt(report.date)}</Text>
        </View>
      </Card>

      {/* Contact */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Contact</Text>
        <InfoRow label="Telephone" value={report.telephone} />
        {report.location && (
          <>
            <View style={styles.divider} />
            <InfoRow label="Location" value={report.location} />
          </>
        )}
      </Card>

      {/* Order */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Order</Text>
        <InfoRow label="Product(s)" value={report.product} />
        <View style={styles.divider} />
        <InfoRow label="Buyer Type" value={report.buyerType} />
      </Card>

      {/* Follow-Up */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Follow-Up</Text>
        <InfoRow label="Follow-Up Date" value={fmt(report.followUpDate)} />
        <View style={styles.divider} />
        <InfoRow label="Followed Up By" value={report.followedUpBy} />
      </Card>

      {/* Notes */}
      {(report.comments || report.summary) && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Notes</Text>
          {report.comments && (
            <NoteBlock label="Comments" text={report.comments} />
          )}
          {report.comments && report.summary && <View style={styles.divider} />}
          {report.summary && (
            <NoteBlock label="Summary / Follow Up" text={report.summary} />
          )}
        </Card>
      )}

      {/* Meta */}
      <Card style={StyleSheet.flatten([styles.card, styles.metaCard]) as ViewStyle}>
        <Text style={styles.metaText}>Created by {report.createdBy}</Text>
        <Text style={styles.metaText}>on {fmt(report.createdAt)}</Text>
        <Text style={[styles.metaText, styles.metaId]} numberOfLines={1}>ID: {report.id}</Text>
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    padding: 32,
  },
  loadingText: {
    ...typography.sm,
    fontFamily: font.regular,
    color: colors.gray[400],
    marginTop: 12,
  },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: {
    ...typography.lg,
    fontFamily: font.bold,
    color: colors.gray[900],
    marginBottom: 8,
  },
  errorMsg: {
    ...typography.sm,
    fontFamily: font.regular,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: radius.xl,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    ...typography.base,
    fontFamily: font.semibold,
    color: colors.gray[700],
  },

  headerCard: {
    ...shadow.md,
  },
  customerName: {
    ...typography.xl,
    fontFamily: font.bold,
    color: colors.gray[900],
    marginBottom: 10,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerDate: {
    ...typography.sm,
    fontFamily: font.regular,
    color: colors.gray[500],
  },

  card: {
    ...shadow.sm,
  },
  cardTitle: {
    ...typography.xs,
    fontFamily: font.bold,
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  infoLabel: {
    ...typography.sm,
    fontFamily: font.medium,
    color: colors.gray[500],
    flex: 1,
  },
  infoValue: {
    ...typography.sm,
    fontFamily: font.semibold,
    color: colors.gray[900],
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginVertical: 8,
  },

  noteBlock: { gap: 4 },
  noteLabel: {
    ...typography.xs,
    fontFamily: font.bold,
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  noteText: {
    ...typography.sm,
    fontFamily: font.regular,
    color: colors.gray[700],
    lineHeight: 20,
  },

  metaCard: { gap: 2 },
  metaText: {
    ...typography.xs,
    fontFamily: font.regular,
    color: colors.gray[400],
  },
  metaId: {
    marginTop: 4,
    fontFamily: font.medium,
  },
});
