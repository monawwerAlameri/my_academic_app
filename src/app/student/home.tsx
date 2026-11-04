import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  ActivityIndicator,
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
import { useFetch } from '../../hooks/useFetch';
import {
  Booking,
  NotificationItem,
  Profile,
  cancelBooking,
  getBookings,
  getNotifications,
  getProfile,
} from '../../services/student';
import { commonStyles } from '../../theme/styles';

import { errorKey } from '../../services/errors';



export default function HomeScreen() {
  const { colors, t, isRTL } = useAppSettings();

 const { data: profile } = useFetch<Profile | null>(getProfile, null);
const { data: bookings, loading: bookingsLoading, error: bookingsError, reload: reloadBookings } =
  useFetch<Booking[]>(getBookings, []);
const { data: notifications, loading: notificationsLoading, error: notificationsError, reload: reloadNotifications } =
  useFetch<NotificationItem[]>(getNotifications, []);

const userName = profile?.fullName?.split(' ')[0] ?? '';
const sessions = bookings.filter((b) => !b.isPast).slice(0, 2);
const latestNotifications = notifications.slice(0, 1);

const cancelSession = (id: string) => {
  Alert.alert(t('cancelBookingTitle'), t('cancelBookingMsg'), [
    { text: t('no'), style: 'cancel' },
    {
      text: t('yesCancel'),
      style: 'destructive',
      onPress: async () => {
        try {
          await cancelBooking(id);
          reloadBookings();
        } catch (e) {
          Alert.alert(t('error'), t(errorKey(e) as any));
        }
      },
    },
  ]);
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


{bookingsLoading ? (
  <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />
) : bookingsError ? (
  <TouchableOpacity activeOpacity={0.7} onPress={reloadBookings}>
    <Text style={[commonStyles.empty, { color: colors.danger }]}>{t('loadError')}</Text>
  </TouchableOpacity>
) : sessions.length === 0 ? (
  <Text style={[commonStyles.empty, { color: colors.textSecondary }]}>{t('noBookings')}</Text>
) : (
  sessions.map((session) => (
    <View key={session.id} style={[styles.sessionRow, reverse]}>
      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.name, align, { color: colors.primary }]}>{session.doctor}</Text>
        <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>
          {session.location} · {session.datetime}
        </Text>
      </View>
      {session.canCancel && (
      <TouchableOpacity activeOpacity={0.7} onPress={() => cancelSession(session.id)}>
        <Ionicons name="close" size={20} color={colors.danger} />
      </TouchableOpacity>
      )}
    </View>
  ))
)}
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/student/my-booking')}>
            <Text style={[commonStyles.name, { color: colors.primary, textAlign: 'center' }]}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.panel, styles.card, { borderColor: colors.border }]}>
          <Text style={[commonStyles.name, align, { color: colors.primary }]}>{t('quickNotification')}</Text>

         {notificationsLoading ? (
  <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />
) : notificationsError ? (
  <TouchableOpacity activeOpacity={0.7} onPress={reloadNotifications}>
    <Text style={[commonStyles.empty, { color: colors.danger }]}>{t('loadError')}</Text>
  </TouchableOpacity>
) : latestNotifications.length === 0 ? (
  <Text style={[commonStyles.empty, { color: colors.textSecondary }]}>{t('noNotifications')}</Text>
) : (
  latestNotifications.map((item) => (
    <View key={item.id} style={[styles.notificationCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={[commonStyles.name, align, { color: colors.primary }]}>{t(item.titleKey as any)}</Text>
      <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{item.date}</Text>
      <Text style={[styles.smallText, align, { color: colors.textSecondary, marginTop: 6 }]}>{item.message}</Text>

      <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/student/notifications')}>
        <Text style={[commonStyles.name, { color: colors.primary, textAlign: 'center', marginTop: 10 }]}>{t('viewAllSmall')}</Text>
      </TouchableOpacity>
    </View>
  ))
)}


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