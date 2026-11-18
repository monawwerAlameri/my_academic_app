import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AdminHeader } from '../../components/AdminHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { DataState } from '../../components/DataState';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { adminApi, ReportRow, ReportsData } from '../../services/adminApi';
import { commonStyles } from '../../theme/styles';

function Bar({ label, value, total, color, textColor, trackColor, isRTL }: {
  label: string; value: number; total: number; color: string; textColor: string; trackColor: string; isRTL: boolean;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={[styles.barLabelRow, isRTL && { flexDirection: 'row-reverse' }]}>
        <Text style={[styles.barLabel, { color: textColor }]}>{label}</Text>
        <Text style={[styles.barLabel, { color: textColor }]}>{value} ({pct}%)</Text>
      </View>
      <View style={[styles.track, { backgroundColor: trackColor }, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={{ width: (pct + '%') as any, backgroundColor: color, height: '100%', borderRadius: 6 }} />
      </View>
    </View>
  );
}

const sum = (rows: ReportRow[], ...labels: string[]) =>
  rows.filter((r) => labels.includes(r.label)).reduce((s, r) => s + Number(r.count), 0);

export default function AdminReports() {
  const { colors, t, isRTL } = useAppSettings();

  const { data, loading, error, reload } = useFetch(async () => {
    const res = await adminApi.getReports();
    if (!res.success || !res.data) throw new Error(res.message);
    return res.data;
  }, null as ReportsData | null);

  const total = data?.totalAppointments ?? 0;
  const byStatus = data?.appointmentsByStatus ?? [];
  const byType = data?.onlineVsInPerson ?? [];
  const byConsult = data?.consultationTypes ?? [];
  const top = data?.topRatedDoctors ?? [];

  const card = [styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }];
  const title = [styles.cardTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' } as const];
  const barProps = { total, textColor: colors.primary, trackColor: colors.pillBackground, isRTL };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <AdminHeader title={t('reportsTitle')} />

        <DataState loading={loading} error={error} empty={!data} emptyText={t('noAppointments')} onRetry={reload}>
          <View style={[styles.totalCard, { backgroundColor: colors.primary }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="calendar" size={28} color={colors.accent} />
            <View>
              <Text style={[styles.totalNumber, { color: colors.white }]}>{total}</Text>
              <Text style={{ color: colors.white, opacity: 0.8, fontSize: 13 }}>{t('totalAppointments')}</Text>
            </View>
          </View>

          <View style={card}>
            <Text style={title}>{t('appointmentsByStatus')}</Text>
            <Bar {...barProps} label={t('confirmed')} value={sum(byStatus, 'Booked', 'Confirmed')} color={colors.success} />
            <Bar {...barProps} label={t('pending')} value={sum(byStatus, 'Pending')} color={colors.warning} />
            <Bar {...barProps} label={t('completed')} value={sum(byStatus, 'Completed')} color={colors.accent} />
          </View>

          <View style={card}>
            <Text style={title}>{t('appointmentFormat')}</Text>
            <Bar {...barProps} label={t('online')} value={sum(byType, 'Online')} color={colors.primary} />
            <Bar {...barProps} label={t('inPerson')} value={sum(byType, 'In-Person')} color={colors.accent} />
          </View>

          <View style={card}>
            <Text style={title}>{t('consultationTypes')}</Text>
            <Bar {...barProps} label={t('optQuestions')} value={sum(byConsult, 'Questions')} color={colors.accent} />
            <Bar {...barProps} label={t('optProjectDiscussion')} value={sum(byConsult, 'Project Discussion')} color={colors.primary} />
            <Bar {...barProps} label={t('optOther')} value={sum(byConsult, 'Other')} color={colors.placeholder} />
          </View>

          <View style={card}>
            <Text style={title}>{t('topRatedDoctors')}</Text>
            {top.map((d) => (
              <View key={d.facultyId} style={[styles.docRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[styles.docName, { color: colors.primary }]}>{d.fullName}</Text>
                <View style={[styles.ratingBox, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Ionicons name="star" size={16} color={colors.accent} />
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>{Number(d.averageRating).toFixed(1)}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>({d.reviewCount})</Text>
                </View>
              </View>
            ))}
          </View>
        </DataState>
        <View style={{ height: 110 }} />
      </ScrollView>
      <AdminTabBar activeTab="reports" onTabPress={(key) => router.replace(`/admin/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  totalCard: { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 18, padding: 18, marginBottom: 14 },
  totalNumber: { fontSize: 30, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 13 },
  track: { height: 10, borderRadius: 6, overflow: 'hidden', flexDirection: 'row' },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  docName: { fontSize: 14, fontWeight: '600' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});