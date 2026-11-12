import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DataState } from '../../components/DataState';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { FacultyNotification, getFacultyNotifications } from '../../services/doctor';
import { commonStyles } from '../../theme/styles';



const titleKey = (type: string) => {
  const s = (type ?? '').toLowerCase();
  if (s.includes('cancel')) return 'notifCancellation';
  if (s.includes('book')) return 'notifBooking';
  if (s.includes('review')) return 'notifReview';
  return 'notificationTitle';
};

export default function FacultyNotificationsScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { data: notifications, loading, error, reload } = useFetch<FacultyNotification[]>(getFacultyNotifications, []);
 

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
         <DataState
  loading={loading}
  error={error}
  empty={notifications.length === 0}
  emptyText={t('noNotifications')}
  onRetry={reload}
>
  {notifications.map((n, index) => (
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
        <Text style={[commonStyles.name, align, { color: colors.primary }]}>{t(titleKey(n.type) as any)}</Text>
        <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{n.message}</Text>
        <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{String(n.time ?? '').slice(0, 16)}</Text>
      </View>
    </View>
  ))}
</DataState>
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