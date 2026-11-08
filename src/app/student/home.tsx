import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

const UPCOMING_SESSIONS = [
  { id: '1', time: '11:00 AM', doctor: 'Dr. Fatimah Abdullah', location: 'Office - Room 203(17D)', type: 'In-person' },
  { id: '2', time: '9:30 AM', doctor: 'Dr. Najlaa Saleh', location: 'Office - Room 105(CL2)', type: 'In-person' },
];

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Appointment Reminder',
    date: '17 - 02 - 2026',
    message:
      'Hi Nora Alshammari,\nYour appointment with Dr. Reem Khalid (In-person) will start in 30 minutes. Please be on time',
  },
];

export default function HomeScreen() {
  const { colors, t, isRTL } = useAppSettings();

  const userName = 'Nora';
  const [sessions, setSessions] = useState(UPCOMING_SESSIONS);

  const cancelSession = (id: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => setSessions((prev) => prev.filter((s) => s.id !== id)),
        },
      ]
    );
  };

  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={commonStyles.scrollContentHeader}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[commonStyles.headerRow, reverse]}>
          <View style={{ flex: 1 }}>
            <Text style={[commonStyles.headerTitle, align, { color: colors.primary }]}>
              {t('welcome')} {userName}
            </Text>
            <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>
              {t('welcomeSubtitle')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
            onPress={() => router.push('/student/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.panel, styles.card, { borderColor: colors.border }]}>
          <Text style={[commonStyles.name, align, { color: colors.primary }]}>{t('upcomingSessions')}</Text>

          {sessions.map((session) => (
            <View key={session.id} style={[styles.sessionRow, reverse]}>
              <Text style={[commonStyles.chipText, { color: colors.primary, width: 62 }]}>{session.time}</Text>

              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.name, align, { color: colors.primary }]}>{session.doctor}</Text>
                <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>
                  {session.location} · {session.type}
                </Text>
              </View>

              <TouchableOpacity activeOpacity={0.7} onPress={() => cancelSession(session.id)}>
                <Ionicons name="close" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/student/my-booking')}>
            <Text style={[commonStyles.name, { color: colors.primary, textAlign: 'center' }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.panel, styles.card, { borderColor: colors.border }]}>
          <Text style={[commonStyles.name, align, { color: colors.primary }]}>{t('quickNotification')}</Text>

          {NOTIFICATIONS.map((item) => (
            <View key={item.id} style={[styles.notificationCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[commonStyles.name, align, { color: colors.primary }]}>{item.title}</Text>
              <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{item.date}</Text>
              <Text style={[styles.smallText, align, { color: colors.textSecondary, marginTop: 6 }]}>{item.message}</Text>

              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/student/notifications')}>
                <Text style={[commonStyles.name, { color: colors.primary, textAlign: 'center', marginTop: 10 }]}>view all</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="home" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  card: { padding: 18, marginBottom: 20 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  notificationCard: { borderRadius: 14, padding: 14, marginTop: 8 },
});