import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

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

  const align = { textAlign: isRTL ? 'right' : 'left' } as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('notificationTitle')}</Text>
        </View>

        <View style={[commonStyles.panel, { borderColor: colors.border }]}>
          {notifications.length === 0 ? (
            <Text style={[commonStyles.empty, { color: colors.textSecondary }]}>{t('noNotifications')}</Text>
          ) : (
            notifications.map((n, index) => (
              <View
                key={n.id}
                style={[
                  commonStyles.menuRow,
                  index < notifications.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  isRTL && { flexDirection: 'row-reverse' },
                ]}
              >
                <Ionicons name="notifications" size={22} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.name, align, { color: colors.primary }]}>{n.title}</Text>
                  <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{n.body}</Text>
                  <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{n.time}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={() => removeNotification(n.id)}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
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
  smallText: { fontSize: 12 },
});