import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, font, typography, radius, shadow } from '../../constants/theme';
import { useUser } from '../../lib/UserContext';
import { UserPicker } from '../../components/UserPicker';

export default function ProfileScreen() {
  const { user, loading, clearUser } = useUser();

  if (loading) return <View style={styles.screen} />;

  if (!user) return <UserPicker />;

  function handleSwitch() {
    Alert.alert(
      'Switch User',
      'You will need to select your name again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', style: 'destructive', onPress: clearUser },
      ],
    );
  }

  const roleLabel = user.role === 'manager' ? 'Manager' : 'Sales Representative';
  const avatarLetter = user.name.charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      {/* Avatar header */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{avatarLetter}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleLabel}>{roleLabel}</Text>
        </View>
      </View>

      {/* Info card */}
      <View style={styles.body}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{user.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{roleLabel}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.switchBtn} onPress={handleSwitch} activeOpacity={0.8}>
          <Text style={styles.switchBtnText}>Switch User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  avatarSection: {
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    ...typography.xl,
    fontFamily: font.bold,
    color: colors.white,
  },
  name: {
    ...typography.lg,
    fontFamily: font.bold,
    color: colors.white,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  roleLabel: {
    ...typography.xs,
    fontFamily: font.medium,
    color: 'rgba(255,255,255,0.85)',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 16,
    ...shadow.sm,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    ...typography.sm,
    fontFamily: font.medium,
    color: colors.gray[500],
  },
  infoValue: {
    ...typography.sm,
    fontFamily: font.semibold,
    color: colors.gray[900],
    maxWidth: '65%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginVertical: 10,
  },
  switchBtn: {
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  switchBtnText: {
    ...typography.base,
    fontFamily: font.semibold,
    color: colors.gray[700],
  },
});
