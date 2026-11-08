import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AdminHeader } from '../../components/AdminHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { appointments, doctorRatings } from '../../services/adminMockData';
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

export default function AdminReports() {
  const { colors, t, isRTL } = useAppSettings();
  const total = appointments.length;
  const count = (fn: (a: (typeof appointments)[number]) => boolean) => appointments.filter(fn).length;

  const card = [styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }];
  const title = [styles.cardTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' } as const];
  const barProps = { total, textColor: colors.primary, trackColor: colors.pillBackground, isRTL };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <AdminHeader title={t('reportsTitle')} />

        <View style={[styles.totalCard, { backgroundColor: colors.primary }, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="calendar" size={28} color={colors.accent} />
          <View>
            <Text style={[styles.totalNumber, { color: colors.white }]}>{total}</Text>
            <Text style={{ color: colors.white, opacity: 0.8, fontSize: 13 }}>{t('totalAppointments')}</Text>
          </View>
        </View>

        <View style={card}>
          <Text style={title}>{t('appointmentsByStatus')}</Text>
          <Bar {...barProps} label={t('confirmed')} value={count((a) => a.status === 'confirmed')} color={colors.success} />
          <Bar {...barProps} label={t('pending')} value={count((a) => a.status === 'pending')} color={colors.warning} />
          <Bar {...barProps} label={t('completed')} value={count((a) => a.status === 'completed')} color={colors.accent} />
        </View>

        <View style={card}>
          <Text style={title}>{t('appointmentFormat')}</Text>
          <Bar {...barProps} label={t('online')} value={count((a) => a.format === 'online')} color={colors.primary} />
          <Bar {...barProps} label={t('inPerson')} value={count((a) => a.format === 'inPerson')} color={colors.accent} />
        </View>

        <View style={card}>
          <Text style={title}>{t('consultationTypes')}</Text>
          <Bar {...barProps} label={t('optQuestions')} value={count((a) => a.consultation === 'questions')} color={colors.accent} />
          <Bar {...barProps} label={t('optProjectDiscussion')} value={count((a) => a.consultation === 'projectDiscussion')} color={colors.primary} />
          <Bar {...barProps} label={t('optOther')} value={count((a) => a.consultation === 'other')} color={colors.placeholder} />
        </View>

        <View style={card}>
          <Text style={title}>{t('topRatedDoctors')}</Text>
          {[...doctorRatings].sort((a, b) => b.rating - a.rating).map((d) => (
            <View key={d.
              id} style={[styles.docRow, { borderBottomColor: colors.
                border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.docName, { color: colors.primary }]}>{d.name}</Text>
              <View style={[styles.ratingBox, isRTL && { flexDirection: 'row-reverse' }]}>
                <Ionicons name="star" size={16} color={colors.accent} />
                <Text style={{ color: colors.primary, fontWeight: '700' }}>{d.rating.toFixed(1)}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>({d.reviews})</Text>
              </View>
            </View>
          ))}
        </View>
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