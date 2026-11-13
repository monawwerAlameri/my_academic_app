import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminHeader } from '../../components/AdminHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { DataState } from '../../components/DataState';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { adminApi, ApiAppointment } from '../../services/adminApi';
import { commonStyles } from '../../theme/styles';

type Status = 'confirmed' | 'pending' | 'completed' | 'cancelled';
type Filter = 'all' | 'confirmed' | 'pending' | 'completed';
const FILTERS: Filter[] = ['all', 'confirmed', 'pending', 'completed'];

// القاعدة: الطالب والدكتور يستخدمون Booked، والأدمن يعرف Pending و Confirmed
const toStatus = (s: string): Status => {
  if (s === 'Pending') return 'pending';
  if (s === 'Completed') return 'completed';
  if (s === 'Cancelled') return 'cancelled';
  return 'confirmed'; // Booked أو Confirmed
};

export default function AdminAppointments() {
  const { colors, t, isRTL } = useAppSettings();
  const [filter, setFilter] = useState<Filter>('all');

  const { data, loading, error, reload } = useFetch(async () => {
    const res = await adminApi.getAppointments();
    if (!res.success || !res.data) throw new Error(res.message);
    return res.data;
  }, [] as ApiAppointment[]);

  const visible = data.filter((a) => filter === 'all' || toStatus(a.status) === filter);

  const statusLabel = (s: Status) => (s === 'cancelled' ? t('notifCancellation') : t(s));
  const statusStyle = (s: Status) => {
    if (s === 'confirmed') return { bg: colors.successLight, fg: colors.success };
    if (s === 'pending') return { bg: colors.warning + '2E', fg: colors.warning };
    if (s === 'cancelled') return { bg: colors.dangerLight, fg: colors.danger };
    return { bg: colors.pillBackground, fg: colors.primary };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <AdminHeader title={t('appointmentsMonitoring')} />

        <View style={[commonStyles.chipsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[commonStyles.chip, { borderColor: colors.border }, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[commonStyles.chipText, { color: active ? colors.white : colors.textSecondary }]}>{t(f)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <DataState loading={loading} error={error} empty={visible.length === 0} emptyText={t('noAppointments')} onRetry={reload}>
          {visible.map((a) => {
            const status = toStatus(a.status);
            const st = statusStyle(status);
            const online = a.appointmentType === 'Online';
            return (
              <View key={String(a.appointmentId)} style={[commonStyles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[styles.iconBox, { backgroundColor: colors.pillBackground }]}>
                  <Ionicons name={online ? 'videocam-outline' : 'calendar-outline'} size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{a.studentName}</Text>
                  <Text style={[styles.meta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('withDoctor')} {a.facultyName}
                  </Text>
                  <Text style={[styles.meta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {a.appointmentDate} - {String(a.appointmentTime ?? '').slice(0, 5)}
                  </Text>
                  <View style={[styles.bottomRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.meta, { color: colors.primary, fontWeight: '600' }]}>
                      {online ? t('online') : t('inPerson')}
                    </Text>
                    <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                      <Text style={[styles.statusText, { color: st.fg }]}>{statusLabel(status)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </DataState>
        <View style={{ height: 110 }} />
      </ScrollView>
      <AdminTabBar activeTab="appointments" onTabPress={(key) => router.replace(`/admin/${key}` as any)} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  meta: { fontSize: 12.5, marginTop: 2 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
});