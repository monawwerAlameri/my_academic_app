import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DataState } from '../../components/DataState';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { adminApi, ApiAppointment } from '../../services/adminApi';
import { commonStyles } from '../../theme/styles';

export default function AdminNotifications() {
  const { colors, t, isRTL } = useAppSettings();
  const [cleared, setCleared] = useState(false);

  const { data, loading, error, reload } = useFetch(async () => {
    const res = await adminApi.getAppointments();
    if (!res.success || !res.data) throw new Error(res.message);
    return res.data.slice(0, 20);
  }, [] as ApiAppointment[]);

  const items = cleared ? [] : data;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[commonStyles.scrollContent, styles.scrollContent]} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>{t('notificationTitle')}</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={() => setCleared(true)} activeOpacity={0.7}>
              <Text style={{ color: colors.accent, fontWeight: '700' }}>{t('clearAll')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <DataState loading={loading} error={error} empty={items.length === 0} emptyText={t('noNotifications')} onRetry={reload}>
          {items.map((a) => {
            const cancelled = a.status === 'Cancelled';
            return (
              <View key={String(a.appointmentId)} style={[commonStyles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[styles.iconBox, { backgroundColor: colors.pillBackground }]}>
                  <Ionicons name={cancelled ? 'close-circle-outline' : 'calendar-outline'} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[styles.titleRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.cardTitle, { color: colors.primary }]}>
                      {cancelled ? t('notifCancellation') : t('notifStudentBooked')}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{a.appointmentDate}</Text>
                  </View>
                  <Text style={[styles.body, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {a.studentName} · {a.facultyName} · {String(a.appointmentTime ?? '').slice(0, 5)}
                  </Text>
                </View>
              </View>
            );
          })}
        </DataState>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  body: { fontSize: 12.5, marginTop: 4, lineHeight: 18 },
});