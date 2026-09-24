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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('notificationTitle')}</Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity style={[styles.clearButton, { borderColor: colors.border, alignSelf: isRTL ? 'flex-start' : 'flex-end' }]} activeOpacity={0.7} onPress={clearAll}>
            <Text style={[styles.clearButtonText, { color: colors.primary }]}>{t('clearAll')}</Text>
          </TouchableOpacity>
        )}

        {notifications.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Ionicons name="notifications-off-outline" size={40} color={colors.placeholder} />
            <Text style={[styles.emptyText, { color: colors.placeholder }]}>{t('noNotifications')}</Text>
          </View>
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
  return (
    <View style={[styles.card, { backgroundColor: colors.white }, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.cardBackground }]}>
        <Ionicons name="notifications" size={20} color={colors.primary} />
        <View style={[styles.dot, { backgroundColor: colors.danger }]} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={[styles.cardHeader, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>{item.title}</Text>
          <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{item.date}</Text>
        </View>
        <Text style={[styles.cardMessage, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{item.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 18, paddingTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  clearButton: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 18 },
  clearButtonText: { fontSize: 13, fontWeight: '700' },
  card: { flexDirection: 'row', gap: 12, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  iconWrapper: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: -2, right: -2, width: 9, height: 9, borderRadius: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 14.5, fontWeight: '700' },
  cardDate: { fontSize: 10.5 },
  cardMessage: { fontSize: 12, lineHeight: 18 },
  emptyWrapper: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14 },
});