import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, font, typography, radius } from '../constants/theme';
import { useUser } from '../lib/UserContext';
import { api } from '../lib/api';

export function LoginScreen() {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const e = email.trim().toLowerCase();
    const p = password;
    if (!e || !p) {
      setError('Email and password are required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { access_token, user } = await api.auth.login(e, p);
      await setUser(user, access_token);
    } catch (err: any) {
      setError(err?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.brand}>FLOW</Text>
          <Text style={styles.brandSub}>Natural Mineral Water</Text>
          <Text style={styles.tagline}>Call Report System</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSub}>Enter your credentials to continue</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.gray[400]}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Contact your manager if you need access.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.brand.navy,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  brand: {
    fontSize: 52,
    fontFamily: font.extrabold,
    color: colors.white,
    letterSpacing: 10,
  },
  brandSub: {
    ...typography.sm,
    fontFamily: font.regular,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2,
    marginTop: 6,
  },
  tagline: {
    ...typography.xs,
    fontFamily: font.medium,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 24,
  },
  cardTitle: {
    ...typography.xl,
    fontFamily: font.bold,
    color: colors.gray[900],
    marginBottom: 4,
  },
  cardSub: {
    ...typography.sm,
    fontFamily: font.regular,
    color: colors.gray[500],
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    ...typography.sm,
    fontFamily: font.medium,
    color: colors.gray[700],
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...typography.base,
    fontFamily: font.regular,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.brand.red,
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    ...typography.sm,
    fontFamily: font.medium,
    color: '#DC2626',
  },
  btn: {
    backgroundColor: colors.brand.navy,
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnText: {
    ...typography.base,
    fontFamily: font.semibold,
    color: colors.white,
  },
  footer: {
    ...typography.xs,
    fontFamily: font.regular,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 28,
  },
});
