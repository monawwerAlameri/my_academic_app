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
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

interface NotificationItem { id: string; title: string; date: string; message: string; }

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'Appointment Booking', date: '27 - 04 - 2026', message: 'Hi Nora,\nYour appointment with Dr. Fatimah Abdullah has been booked on April 28' },
  { id: '2', title: 'Booking Confirmed', date: '01 - 03 - 2026', message: 'Hi Nora,\nYour appointment with Dr. Laila Saud (In-person) has been confirmed on Mar 5. We look forward to seeing you on time' },
  { id: '3', title: 'Waiting List', date: '28 - 03 - 2026', message: 'Hi Nora,\nYou have been added to the waiting list for Dr. Najlaa (In-person) on May 5. You will be notified when a slot becomes available' },
  { id: '4', title: 'Appointment Reminder', date: '17 - 02 - 2026', message: 'Hi Nora,\nYour appointment with Dr. Reem Khalid (In-person) will start in 30 minutes. Please be on time' },
];

export default function NotificationsScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const clearAll = () => setNotifications([]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('notificationTitle')}</Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity
            style={[commonStyles.chip, { borderColor: colors.border, alignSelf: isRTL ? 'flex-start' : 'flex-end', marginBottom: 16 }]}
            activeOpacity={0.7}
            onPress={clearAll}
          >
            <Text style={[commonStyles.chipText, { color: colors.primary }]}>{t('clearAll')}</Text>
          </TouchableOpacity>
        )}

        {notifications.length === 0 ? (
          <Text style={[commonStyles.empty, { color: colors.placeholder }]}>{t('noNotifications')}</Text>
        ) : (
          notifications.map((item) => <NotificationCard key={item.id} item={item} colors={colors} isRTL={isRTL} />)
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="home" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

function NotificationCard({ item, colors, isRTL }: any) {
  const align = { textAlign: isRTL ? 'right' : 'left' } as const;

  return (
    <View style={[commonStyles.card, { backgroundColor: colors.white, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
      <Ionicons name="notifications" size={22} color={colors.primary} />

      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.name, align, { color: colors.primary }]}>{item.title}</Text>
        <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{item.date}</Text>
        <Text style={[styles.smallText, align, { color: colors.textSecondary, marginTop: 6 }]}>{item.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 12 },
});