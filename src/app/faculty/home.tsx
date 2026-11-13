import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DataState } from '../../components/DataState';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { FacultyAppointment, FacultyProfile, getFacultyAppointments, getFacultyProfile } from '../../services/doctor';
import { commonStyles } from '../../theme/styles';


const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toKey(d);
};

export default function FacultyHome() {
  const { colors, t, isRTL } = useAppSettings();
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
  const { data: profile } = useFetch<FacultyProfile | null>(getFacultyProfile, null);
  const { data: appts, loading, error, reload } = useFetch<FacultyAppointment[]>(getFacultyAppointments, []);

const today = addDays(0);
const upcoming = appts.filter((a) => a.status === 'Booked' && a.date >= today);
const todayCount = upcoming.filter((a) => a.date === today).length;
const completedWeek = appts.filter(
  (a) => a.status === 'Completed' && a.date >= addDays(-6) && a.date <= today
).length;
const lastDay = activeTab === 'today' ? today : activeTab === 'week' ? addDays(6) : addDays(30);
const listed = upcoming.filter((a) => a.date <= lastDay);
const firstName = profile?.fullName?.split(' ')[0] ?? '';


  const tabs: Array<'today' | 'week' | 'month'> = ['today', 'week', 'month'];
  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, { justifyContent: 'space-between' }, reverse]}>
          <View>
            <Text style={[commonStyles.headerTitle, align, { color: colors.primary }]}>{t('welcomeDoctor')} {firstName}</Text>
            <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{t('csDepartment')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bell, { backgroundColor: colors.cardBackground }]}
            activeOpacity={0.7}
            onPress={() => router.push('/faculty/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[{ flexDirection: 'row', gap: 10, marginBottom: 20 }, reverse]}>
  <View style={[styles.stat, { flex: 1, backgroundColor: colors.cardBackground }]}>
    <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{todayCount}</Text>
    <Text style={[styles.smallText, { color: colors.textSecondary }]}>{t('todaysAppointments')}</Text>
  </View>
  <View style={[styles.stat, { flex: 1, backgroundColor: colors.cardBackground }]}>
    <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{completedWeek}</Text>
    <Text style={[styles.smallText, { color: colors.textSecondary }]}>{t('completedThisWeek')}</Text>
  </View>
</View>

        <View style={[commonStyles.chipsRow, reverse]}>
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  commonStyles.chip,
                  { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : 'transparent' },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[commonStyles.chipText, { color: active ? colors.white : colors.textSecondary }]}>{t(tab)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[commonStyles.name, align, { color: colors.primary, marginBottom: 12 }]}>{t('upcomingSessions')}</Text>

            <DataState
  loading={loading}
  error={error}
  empty={listed.length === 0}
  emptyText={t('noBookings')}
  onRetry={reload}
>
  {listed.map((appt) => (
    <View key={appt.id} style={[commonStyles.card, { alignItems: 'center', borderColor: colors.border }, reverse]}>
      <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.name, align, { color: colors.primary }]}>{appt.studentName}</Text>
        <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>
          {activeTab === 'today' ? appt.time : `${appt.date} · ${appt.time}`} · {appt.isOnline ? t('online') : t('inOffice')}
        </Text>
        <Text style={[styles.smallText, align, { color: colors.accent }]}>{t(appt.consultationKey)}</Text>
      </View>
    </View>
  ))}
</DataState>

        <View style={{ height: 90 }} />
      </ScrollView>
      <FacultyTabBar activeTab="home" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 12 },
  bell: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stat: { borderRadius: 14, padding: 14 },
});