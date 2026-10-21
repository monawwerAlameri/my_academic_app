import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminHeader } from '../../components/AdminHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { appointments, initialUsers } from '../../services/adminMockData';
import { commonStyles } from '../../theme/styles';

export default function AdminHome() {
  const { colors, t, isRTL } = useAppSettings();

  const pending = appointments.filter((a) => a.status === 'pending');
  const stats = [
    { label: t('totalUsers'), value: initialUsers.length, icon: 'people-outline' as const },
    { label: t('studentsLabel'), value: initialUsers.filter((u) => u.role === 'student').length, icon: 'school-outline' as const },
    { label: t('facultyLabel'), value: initialUsers.filter((u) => u.role === 'faculty').length, icon: 'briefcase-outline' as const },
    { label: t('pendingAppointments'), value: pending.length, icon: 'time-outline' as const },
  ];

  const actions = [
    { key: 'users', label: t('users'), icon: 'people-outline' as const },
    { key: 'appointments', label: t('appointments'), icon: 'calendar-outline' as const },
    { key: 'reports', label: t('reports'), icon: 'document-text-outline' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <AdminHeader title={t('adminWelcome')} subtitle={t('adminSubtitle')} />

        <View style={[styles.grid, isRTL && { flexDirection: 'row-reverse' }]}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Ionicons name={s.icon} size={22} color={colors.accent} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('quickActions')}</Text>
        <View style={[styles.actionsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {actions.map((a) => (
            <TouchableOpacity
              key={a.key}
              style={[styles.action, { borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => router.replace(`/admin/${a.key}` as any)}
            >
              <Ionicons name={a.icon} size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('needsAttention')}</Text>
        {pending.map((a) => (
          <TouchableOpacity
            key={a.id}
            activeOpacity={0.8}
            onPress={() => router.replace('/admin/appointments' as any)}
            style={[styles.row, { borderColor: colors.border, backgroundColor: colors.cardBackground }, isRTL && { flexDirection: 'row-reverse' }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.warning + '2E' }]}>
              <Ionicons name="time-outline" size={20} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{a.student}</Text>
              <Text style={[styles.rowMeta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('withDoctor')} {a.doctor} - {a.date}, {a.time}
              </Text>
            </View>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
        ))}
        <View style={{ height: 110 }} />
      </ScrollView>
      <AdminTabBar activeTab="home" onTabPress={(key) => router.replace(`/admin/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  statCard: { width: '48%', borderRadius: 16, padding: 14, gap: 4 },
  statNumber: { fontSize: 26, fontWeight: '700' },
  statLabel: { fontSize: 12.5 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  action: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center', gap: 8 },
  actionText: { fontSize: 12.5, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowMeta: { fontSize: 12, marginTop: 2 },
});