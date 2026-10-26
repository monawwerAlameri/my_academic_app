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
import { commonStyles } from '../../theme/styles';

const appointments = [
  { id: '1', name: 'Deem Omar', time: '11:00 am', typeKey: 'inOffice' as const, appointmentTypeKey: 'optQuestions' as const },
  { id: '2', name: 'Leen Mohammed', time: '2:00 pm', typeKey: 'online' as const, appointmentTypeKey: 'optProjectDiscussion' as const },
  { id: '3', name: 'Nora Faisal', time: '12:00 pm', typeKey: 'inOffice' as const, appointmentTypeKey: 'optOther' as const },
];

export default function FacultyHome() {
  const { colors, t, isRTL } = useAppSettings();
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');

  const tabs: Array<'today' | 'week' | 'month'> = ['today', 'week', 'month'];
  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, { justifyContent: 'space-between' }, reverse]}>
          <View>
            <Text style={[commonStyles.headerTitle, align, { color: colors.primary }]}>{t('welcomeBack')}</Text>
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

        <View style={[{ flexDirection: 'row', gap: 10, marginBottom: 10 }, reverse]}>
          <View style={[styles.stat, { flex: 1, backgroundColor: colors.cardBackground }]}>
            <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>5</Text>
            <Text style={[styles.smallText, { color: colors.textSecondary }]}>{t('todaysAppointments')}</Text>
          </View>
          <View style={[styles.stat, { flex: 1, backgroundColor: colors.cardBackground }]}>
            <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>3</Text>
            <Text style={[styles.smallText, { color: colors.textSecondary }]}>{t('pendingRequests')}</Text>
          </View>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.cardBackground, marginBottom: 20 }]}>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>126</Text>
          <Text style={[styles.smallText, { color: colors.textSecondary }]}>
            {t('registeredStudents')} · 43 {t('completedThisWeek')}
          </Text>
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

        {appointments.map((appt) => (
          <View key={appt.id} style={[commonStyles.card, { alignItems: 'center', borderColor: colors.border }, reverse]}>
            <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.name, align, { color: colors.primary }]}>{appt.name}</Text>
              <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>
                {appt.time} · {t(appt.typeKey)}
              </Text>
              <Text style={[styles.smallText, align, { color: colors.accent }]}>{t(appt.appointmentTypeKey)}</Text>
            </View>
            <TouchableOpacity style={[commonStyles.chip, { backgroundColor: colors.successLight, borderColor: colors.successLight }]}>
              <Text style={[commonStyles.chipText, { color: colors.success }]}>{t('accept')}</Text>
            </TouchableOpacity>
          </View>
        ))}

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