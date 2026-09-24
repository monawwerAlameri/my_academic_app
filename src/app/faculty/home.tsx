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
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

const appointments = [
  { id: '1', name: 'Deem Omar', time: '11:00 am', typeKey: 'inOffice' as const, appointmentTypeKey: 'optQuestions' as const, initials: 'DO' },
  { id: '2', name: 'Leen Mohammed', time: '2:00 pm', typeKey: 'online' as const, appointmentTypeKey: 'optProjectDiscussion' as const, initials: 'LM' },
  { id: '3', name: 'Nora Faisal', time: '12:00 pm', typeKey: 'inOffice' as const, appointmentTypeKey: 'optOther' as const, initials: 'NF' },
];

export default function FacultyHome() {
  const { colors, t, isRTL } = useAppSettings();
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');

  const tabs: Array<'today' | 'week' | 'month'> = ['today', 'week', 'month'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
          <View>
            <Text style={[styles.title, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('welcomeBack')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('csDepartment')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.cardBackground }]}
            activeOpacity={0.7}
            onPress={() => router.push('/faculty/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>5</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('todaysAppointments')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>3</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('pendingRequests')}</Text>
          </View>
        </View>
        <View style={[styles.statCardWide, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>126</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('registeredStudents')} · 43 {t('completedThisWeek')}
          </Text>
        </View>

        <View style={[styles.tabsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  { borderColor: colors.border },
                  active && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, { color: active ? colors.white : colors.textSecondary }]}>
                  {t(tab)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('upcomingSessions')}
        </Text>

        {appointments.map((appt) => (
          <View
            key={appt.id}
            style={[styles.apptRow, { borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
          >
            <View style={[styles.apptAvatar, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.apptAvatarText, { color: colors.primary }]}>{appt.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.apptName, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                {appt.name}
              </Text>
              <Text style={[styles.apptTime, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {appt.time} · {t(appt.typeKey)}
              </Text>
              <Text style={[styles.apptType, { color: colors.accent, textAlign: isRTL ? 'right' : 'left' }]}>
                {t(appt.appointmentTypeKey)}
              </Text>
            </View>
            <TouchableOpacity style={[styles.acceptButton, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.acceptText, { color: colors.success }]}>{t('accept')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <FacultyTabBar activeTab="home" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 14 },
  statCardWide: { borderRadius: 14, padding: 14, marginBottom: 20 },
  statNumber: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 4 },
  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  apptRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10, gap: 10 },
  apptAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  apptAvatarText: { fontSize: 13, fontWeight: '700' },
  apptName: { fontSize: 14, fontWeight: '600' },
  apptTime: { fontSize: 12, marginTop: 2 },
  apptType: { fontSize: 11.5, marginTop: 2, fontWeight: '600' },
  acceptButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  acceptText: { fontSize: 12, fontWeight: '600' },
});