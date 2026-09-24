import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'New Booking Request', body: 'Sara Salem requested an in-person appointment.', time: '10 min ago' },
  { id: '2', title: 'Booking Cancelled', body: 'Fatimah Abdullah cancelled her 11:00 AM appointment.', time: '1 hour ago' },
  { id: '3', title: 'New Review', body: 'Reem Omar left a 5-star review.', time: 'Yesterday' },
];

export default function FacultyNotificationsScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('notificationTitle')}</Text>
        </View>

        <View style={[styles.listCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {notifications.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noNotifications')}</Text>
          ) : (
            notifications.map((n, index) => (
              <View
                key={n.id}
                style={[
                  styles.notifRow,
                  index < notifications.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  isRTL && { flexDirection: 'row-reverse' },
                ]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: colors.cardBackground }]}>
                  <Ionicons name="notifications" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.notifTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {n.title}
                  </Text>
                  <Text style={[styles.notifBody, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {n.body}
                  </Text>
                  <Text style={[styles.notifTime, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {n.time}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                  onPress={() => removeNotification(n.id)}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <FacultyTabBar activeTab="home" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 18, paddingTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  headerTitle: { fontSize: 22, fontWeight: '700' },

  listCard: { borderWidth: 1, borderRadius: 18, padding: 6 },
  emptyText: { textAlign: 'center', paddingVertical: 24 },

  notifRow: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  iconWrapper: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  notifBody: { fontSize: 12.5, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 10.5 },
  deleteButton: { padding: 4, marginTop: 2 },
});