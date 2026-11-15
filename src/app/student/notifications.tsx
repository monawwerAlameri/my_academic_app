import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { DataState } from '../../components/DataState';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { NotificationItem, getNotifications, markNotificationsRead } from '../../services/student';
import { commonStyles } from '../../theme/styles';




export default function NotificationsScreen() {
  const { colors, t, isRTL } = useAppSettings();

const { data: notifications, loading, error, reload } = useFetch<NotificationItem[]>(getNotifications, []);
useEffect(() => { markNotificationsRead().catch(() => {}); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('notificationTitle')}</Text>
        </View>

       

      <DataState
  loading={loading}
  error={error}
  empty={notifications.length === 0}
  emptyText={t('noNotifications')}
  onRetry={reload}
>
  {notifications.map((item) => (
    <NotificationCard key={item.id} item={item} title={t(item.titleKey as any)} colors={colors} isRTL={isRTL} t={t} />
  ))}
</DataState>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="home" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

function NotificationCard({ item, title, colors, isRTL, t }: any) {
  const align = { textAlign: isRTL ? 'right' : 'left' } as const;

  return (
    <View style={[commonStyles.card, { backgroundColor: colors.white, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
      <Ionicons name="notifications" size={22} color={colors.primary} />

      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.name, align, { color: colors.primary }]}>{title}</Text>
        <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{item.date}</Text>
        <Text style={[styles.smallText, align, { color: colors.textSecondary, marginTop: 6 }]}>{item.message}</Text>
                {item.by === 'faculty' && (
          <Text style={[styles.smallText, align, { color: colors.danger, marginTop: 4 }]}>{t('cancelledByDoctor')}</Text>
        )}
        {item.by === 'student' && (
          <Text style={[styles.smallText, align, { color: colors.textSecondary, marginTop: 4 }]}>{t('cancelledByYou')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 12 },
});