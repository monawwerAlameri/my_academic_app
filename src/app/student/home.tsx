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
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcome, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('welcome')} {userName}
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('welcomeSubtitle')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
            onPress={() => router.push('/student/notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.white} />
            <View style={[styles.badge, { backgroundColor: colors.danger }]}>
              <Text style={[styles.badgeText, { color: colors.white }]}>4</Text>
            </View>
          </TouchableOpacity>

         
        </View>

        

        <View style={[styles.card, { borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.primary, borderBottomColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('upcomingSessions')}
          </Text>

          {sessions.map((session, index) => (
            <View
              key={session.id}
              style={[
                styles.sessionRow,
                index < UPCOMING_SESSIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                isRTL && { flexDirection: 'row-reverse' },
              ]}
            >
              <Text style={[styles.sessionTime, { color: colors.primary }]}>{session.time}</Text>

              <Ionicons name="person-circle-outline" size={26} color={colors.primary} />

              <View style={{ flex: 1 }}>
                <Text style={[styles.sessionDoctor, { color: colors.
                primary, textAlign: isRTL ? 'right' : 'left' }]}>{session.doctor}</Text>
                <Text style={[styles.sessionLocation, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{session.location}</Text>
              </View>

              <View style={[styles.typeBadge, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.typeText, { color: colors.success }]}>{session.type}</Text>
              </View>

              <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.danger }]} activeOpacity={0.7} onPress={() => cancelSession(session.id)}>
  <Ionicons name="close" size={16} color={colors.danger} />
</TouchableOpacity>

            </View>
          ))}

          <TouchableOpacity
  style={styles.viewAllButton}
  activeOpacity={0.7}
  onPress={() => router.push('/student/my-booking')}
>
 <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
</TouchableOpacity>
        </View>

        <View style={[styles.card, { borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.primary, borderBottomColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('quickNotification')}
          </Text>

          {NOTIFICATIONS.map((item) => (
            <View key={item.id} style={[styles.notificationCard, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.notificationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[styles.notificationIconWrapper, { backgroundColor: colors.border }]}>
                  <Ionicons name="notifications" size={18} color={colors.primary} />
                  <View style={[styles.notificationDot, { backgroundColor: colors.danger }]} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={[styles.notificationHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.notificationTitle, { color: colors.primary }]}>{item.title}</Text>
                    <Text style={[styles.notificationDate, { color: colors.textSecondary }]}>{item.date}</Text>
                  </View>
                  <Text style={[styles.notificationMessage, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{item.message}</Text>
                </View>
              </View>

            <TouchableOpacity
  style={styles.viewAllButtonSmall}
  activeOpacity={0.7}
  onPress={() => router.push('/student/notifications')}
>
  <Text style={[styles.viewAllTextSmall, { color: colors.primary }]}>view all</Text>
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
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  welcome: { fontSize: 26, fontWeight: '700' },
  welcomeSubtitle: { fontSize: 13, marginTop: 4, maxWidth: '90%' },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: -2, right: -2, borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '700' },


  card: { borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', paddingBottom: 12, borderBottomWidth: 1, marginBottom: 4 },

  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 10 },
  sessionTime: { fontSize: 13, fontWeight: '700', width: 62 },
  sessionDoctor: { fontSize: 14, fontWeight: '700' },
  sessionLocation: { fontSize: 11, marginTop: 2 },

  typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  typeText: { fontSize: 11, fontWeight: '700' },
  cancelButton: { width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },

  viewAllButton: { alignItems: 'center', paddingTop: 14 },
  viewAllText: { fontSize: 14, fontWeight: '700' },

  notificationCard: { borderRadius: 14, padding: 14, marginTop: 8 },
  notificationRow: { flexDirection: 'row', gap: 12 },
  notificationIconWrapper: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4 },
  notificationHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  notificationTitle: { fontSize: 14, fontWeight: '700' },
  notificationDate: { fontSize: 11 },
  notificationMessage: { fontSize: 12, marginTop: 6, lineHeight: 18 },
  viewAllButtonSmall: { alignItems: 'center', marginTop: 10 },
  viewAllTextSmall: { fontSize: 13, fontWeight: '700' },
});