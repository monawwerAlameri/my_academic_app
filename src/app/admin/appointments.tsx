import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminHeader } from '../../components/AdminHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { AppointmentStatus, appointments } from '../../services/adminMockData';

type Filter = 'all' | AppointmentStatus;
const FILTERS: Filter[] = ['all', 'confirmed', 'pending', 'completed'];

export default function AdminAppointments() {
  const { colors, t, isRTL } = useAppSettings();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = appointments.filter((a) => filter === 'all' || a.status === filter);

  const statusStyle = (s: AppointmentStatus) => {
    if (s === 'confirmed') return { bg: colors.successLight, fg: colors.success };
    if (s === 'pending') return { bg: colors.warning + '2E', fg: colors.warning };
    return { bg: colors.pillBackground, fg: colors.primary };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AdminHeader title={t('appointmentsMonitoring')} />

        <View style={[styles.chipsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, { borderColor: colors.border }, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: active ? colors.white : colors.textSecondary }]}>{t(f)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {visible.length === 0 && (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>{t('noAppointments')}</Text>
        )}

        {visible.map((a) => {
          const st = statusStyle(a.status);
          return (
            <View key={a.id} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.pillBackground }]}>
                <Ionicons name={a.format === 'online' ? 'videocam-outline' : 'calendar-outline'} size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{a.student}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('withDoctor')} {a.doctor}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {a.date} - {a.time}
                </Text>
                <View style={[styles.bottomRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.meta, { color: colors.primary, fontWeight: '600' }]}>
                    {a.format === 'online' ? t('online') : t('inPerson')}
                  </Text>
                  <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.fg }]}>{t(a.status)}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 110 }} />
      </ScrollView>
      <AdminTabBar activeTab="appointments" onTabPress={(key) => router.replace(`/admin/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20 },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  card: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12 },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  meta: { fontSize: 12.5, marginTop: 2 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
});