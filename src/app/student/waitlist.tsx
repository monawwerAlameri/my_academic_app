import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

interface WaitingItem {
  id: string;
  doctor: string;
  office: string;
  day: string;
  time: string;
  aheadOfYou: number;
}

const INITIAL_WAITING_LIST: WaitingItem[] = [
  { id: '1', doctor: 'Dr.Laila', office: 'Office', day: 'Monday', time: '10:00-10:55 Am', aheadOfYou: 1 },
  { id: '2', doctor: 'Dr.Salma', office: 'Office', day: 'Wednesday', time: '10:00-10:55 Am', aheadOfYou: 4 },
  { id: '3', doctor: 'Dr.Najla', office: 'Office', day: 'Monday', time: '10:00-10:55 Am', aheadOfYou: 10 },
];

const MAX_QUEUE = 10;

export default function WaitingListScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [waitingList, setWaitingList] = useState<WaitingItem[]>(INITIAL_WAITING_LIST);

 const removeItem = (id: string) => {
  Alert.alert(
    'Leave Waiting List',
    'Are you sure you want to remove yourself from the waiting list?',
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Remove',
        style: 'destructive',
        onPress: () => setWaitingList((prev) => prev.filter((item) => item.id !== id)),
      },
    ]
  );
};

  const getProgressColor = (aheadOfYou: number) => {
    if (aheadOfYou <= 2) return colors.success;
    if (aheadOfYou <= 6) return colors.warning;
    return colors.danger;
  };

  const getProgressPercent = (aheadOfYou: number) => {
    const percent = 1 - (aheadOfYou - 1) / MAX_QUEUE;
    return Math.max(0.08, Math.min(1, percent)) * 100;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('waitlist')}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.tableHeader, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.tableHeaderText, { flex: 1, color: colors.primary }]}>{t('meetingInfo')}</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, color: colors.primary }]}>{t('schedule')}</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.4, color: colors.primary }]}>{t('statusProgress')}</Text>
          </View>

          {waitingList.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noWaitingAppointments')}</Text>
          ) : (
            waitingList.map((item, index) => (
              <WaitingRow
                key={item.id}
                item={item}
                isLast={index === waitingList.length - 1}
                onRemove={() => removeItem(item.id)}
                colors={colors}
                t={t}
                isRTL={isRTL}
                progressColor={getProgressColor(item.aheadOfYou)}
                progressPercent={getProgressPercent(item.aheadOfYou)}
              />
            ))
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="waitlist" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

function WaitingRow({
  item, isLast, onRemove, colors, t, isRTL, progressColor, progressPercent,
}: any) {
  return (
    <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.doctorName, { color: colors.primary }]}>{item.doctor}</Text>
        <Text style={[styles.officeText, { color: colors.textSecondary }]}>
          {item.office}
          </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.scheduleDay, { color: colors.primary }]}>{item.day}</Text>
        <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>{item.time}</Text>
      </View>

      <View style={{ flex: 1.4 }}>
        <View style={[styles.statusBadge, { backgroundColor: colors.warning }]}>
          <Text style={[styles.statusText, { color: colors.white }]}>{t('onWaitingList')}</Text>
          <Ionicons name="checkmark-circle" size={14} color={colors.white} />
        </View>

        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` as any, backgroundColor: progressColor }]} />
        </View>

        <Text style={[styles.aheadText, { color: colors.textSecondary }]}>
          {t('aheadOfYou')}: <Text style={{ color: progressColor, fontWeight: '700' }}>{item.aheadOfYou}</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: colors.danger }]}
        activeOpacity={0.7}
        onPress={onRemove}
      >
        <Ionicons name="close" size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 18, padding: 14 },
  emptyText: { textAlign: 'center', paddingVertical: 24 },
  tableHeader: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, marginBottom: 6 },
  tableHeaderText: { fontSize: 12.5, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, gap: 8 },
  doctorName: { fontSize: 13, fontWeight: '700' },
  officeText: { fontSize: 11, marginTop: 2 },
  scheduleDay: { fontSize: 12.5 },
  scheduleTime: { fontSize: 11, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 5, marginBottom: 8 },
  statusText: { fontSize: 10.5, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  aheadText: { fontSize: 10.5 },
  cancelButton: { width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
});