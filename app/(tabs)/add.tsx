import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { colors, font, typography, radius, spacing } from '../../constants/theme';
import { useUser } from '../../lib/UserContext';
import { api } from '../../lib/api';

const PRODUCTS = ['Bottled Water', 'Sachet Water', 'Dispenser'] as const;
const BUYER_TYPES = ['Bulk buyer', 'Medium scale', 'Small scale'] as const;

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <Text style={styles.fieldError}>{msg}</Text>;
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function AddReportScreen() {
  const { user } = useUser();
  const router = useRouter();

  // Form state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [customerName, setCustomerName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [location, setLocation] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [buyerType, setBuyerType] = useState('');
  const [comments, setComments] = useState('');
  const [summary, setSummary] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [showFollowPicker, setShowFollowPicker] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleProduct(p: string) {
    setProducts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = 'Customer name is required';
    if (!telephone.trim()) e.telephone = 'Telephone number is required';
    if (products.length === 0) e.products = 'Select at least one product';
    if (!buyerType) e.buyerType = 'Buyer type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.reports.create({
        userId: user!.id,
        date: isoDate(date),
        customerName: customerName.trim(),
        telephone: telephone.trim(),
        location: location.trim() || undefined,
        product: products.join(', '),
        buyerType,
        comments: comments.trim() || undefined,
        summary: summary.trim() || undefined,
        followUpDate: followUpDate ? isoDate(followUpDate) : undefined,
      });
      router.replace('/(tabs)/');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = (field: string) => [
    styles.input,
    errors[field] ? styles.inputError : null,
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Section 1: Customer Info */}
      <SectionHeader title="Section 1 — Customer Information" />
      <View style={styles.section}>
        <View style={styles.field}>
          <FieldLabel label="Date" required />
          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateBtnText}>
                {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <Text style={styles.dateBtnIcon}>📅</Text>
            </TouchableOpacity>
          )}
          {(Platform.OS === 'ios' || showDatePicker) && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              maximumDate={new Date()}
              onChange={(_: DateTimePickerEvent, selected?: Date) => {
                setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
              style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
            />
          )}
        </View>

        <View style={styles.field}>
          <FieldLabel label="Customer / Business Name" required />
          <TextInput
            style={inputStyle('customerName')}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="e.g. Accra Foods Ltd"
            placeholderTextColor={colors.gray[400]}
          />
          <FieldError msg={errors.customerName} />
        </View>

        <View style={styles.field}>
          <FieldLabel label="Telephone Number" required />
          <TextInput
            style={inputStyle('telephone')}
            value={telephone}
            onChangeText={setTelephone}
            placeholder="e.g. 0244 123 456"
            placeholderTextColor={colors.gray[400]}
            keyboardType="phone-pad"
          />
          <FieldError msg={errors.telephone} />
        </View>

        <View style={styles.field}>
          <FieldLabel label="Location" />
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Tema, Accra"
            placeholderTextColor={colors.gray[400]}
          />
        </View>
      </View>

      {/* Section 2: Products */}
      <SectionHeader title="Section 2 — Product Purchased" />
      <View style={styles.section}>
        <FieldLabel label="Select all that apply" required />
        <View style={styles.toggleRow}>
          {PRODUCTS.map((p) => {
            const active = products.includes(p);
            return (
              <TouchableOpacity
                key={p}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => toggleProduct(p)}
                activeOpacity={0.75}
              >
                <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <FieldError msg={errors.products} />
      </View>

      {/* Section 3: Buyer Type */}
      <SectionHeader title="Section 3 — Buyer Type" />
      <View style={styles.section}>
        <FieldLabel label="Select one" required />
        <View style={styles.toggleRow}>
          {BUYER_TYPES.map((b) => {
            const active = buyerType === b;
            return (
              <TouchableOpacity
                key={b}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                onPress={() => setBuyerType(b)}
                activeOpacity={0.75}
              >
                <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
                  {b}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <FieldError msg={errors.buyerType} />
      </View>

      {/* Section 4: Call Details */}
      <SectionHeader title="Section 4 — Call Details" />
      <View style={styles.section}>
        <View style={styles.field}>
          <FieldLabel label="Comments" />
          <TextInput
            style={[styles.input, styles.textarea]}
            value={comments}
            onChangeText={setComments}
            placeholder="Notes about the call, customer needs, concerns…"
            placeholderTextColor={colors.gray[400]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.field}>
          <FieldLabel label="Summary / Follow Up" />
          <TextInput
            style={[styles.input, styles.textarea]}
            value={summary}
            onChangeText={setSummary}
            placeholder="What is the next action? What was agreed with the customer?"
            placeholderTextColor={colors.gray[400]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Section 5: Follow-Up */}
      <SectionHeader title="Section 5 — Follow-Up Tracking" />
      <View style={styles.section}>
        <FieldLabel label="Follow Up Date" />
        {followUpDate ? (
          <View style={styles.followUpRow}>
            {Platform.OS === 'android' && !showFollowPicker && (
              <TouchableOpacity
                style={[styles.dateBtn, { flex: 1 }]}
                onPress={() => setShowFollowPicker(true)}
              >
                <Text style={styles.dateBtnText}>
                  {followUpDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
                <Text style={styles.dateBtnIcon}>📅</Text>
              </TouchableOpacity>
            )}
            {(Platform.OS === 'ios' || showFollowPicker) && (
              <DateTimePicker
                value={followUpDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={new Date()}
                onChange={(_: DateTimePickerEvent, selected?: Date) => {
                  setShowFollowPicker(false);
                  if (selected) setFollowUpDate(selected);
                }}
                style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
              />
            )}
            <TouchableOpacity onPress={() => setFollowUpDate(null)} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕ Clear</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.setFollowBtn}
            onPress={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setFollowUpDate(tomorrow);
              if (Platform.OS === 'android') setShowFollowPicker(true);
            }}
          >
            <Text style={styles.setFollowBtnText}>+ Set Follow-Up Date</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          disabled={submitting}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={submit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Save Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
  },
  sectionHeader: {
    backgroundColor: colors.brand.navy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
  },
  sectionTitle: {
    ...typography.xs,
    fontFamily: font.bold,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    ...typography.sm,
    fontFamily: font.medium,
    color: colors.gray[700],
    marginBottom: 6,
  },
  required: {
    color: colors.brand.red,
  },
  fieldError: {
    ...typography.xs,
    fontFamily: font.regular,
    color: colors.brand.red,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.base,
    fontFamily: font.regular,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.brand.red,
    backgroundColor: '#FFF5F5',
  },
  textarea: {
    minHeight: 80,
    paddingTop: 10,
  },
  iosPicker: {
    marginLeft: -12,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  dateBtnText: {
    ...typography.base,
    fontFamily: font.regular,
    color: colors.gray[900],
  },
  dateBtnIcon: {
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  toggleBtn: {
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toggleBtnActive: {
    borderColor: colors.brand.navy,
    backgroundColor: `${colors.brand.navy}10`,
  },
  toggleLabel: {
    ...typography.sm,
    fontFamily: font.medium,
    color: colors.gray[700],
  },
  toggleLabelActive: {
    color: colors.brand.navy,
    fontFamily: font.semibold,
  },
  followUpRow: {
    gap: 8,
  },
  setFollowBtn: {
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  setFollowBtnText: {
    ...typography.sm,
    fontFamily: font.medium,
    color: colors.gray[500],
  },
  clearBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.gray[100],
    borderRadius: radius.sm,
    marginTop: 6,
  },
  clearBtnText: {
    ...typography.xs,
    fontFamily: font.semibold,
    color: colors.gray[600],
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  cancelBtnText: {
    ...typography.base,
    fontFamily: font.semibold,
    color: colors.gray[700],
  },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.brand.red,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  submitBtnDisabled: {
    opacity: 0.55,
  },
  submitBtnText: {
    ...typography.base,
    fontFamily: font.semibold,
    color: colors.white,
  },
});
