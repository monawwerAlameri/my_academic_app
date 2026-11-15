import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';
import { DataState } from '../../components/DataState';
import { useFetch } from '../../hooks/useFetch';
import { FacultyAppointment, cancelFacultyAppointment, getFacultyAppointments } from '../../services/doctor';
import { errorKey } from '../../services/errors';


type ListTab = 'previous' | 'upcoming';



export default function FacultyBookingsScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [tab, setTab] = useState<ListTab>('upcoming');
  const [cancelTarget, setCancelTarget] = useState<FacultyAppointment | null>(null);
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
const { data: bookings, loading, error, reload } = useFetch<FacultyAppointment[]>(getFacultyAppointments, []);

const confirmCancel = (booking: FacultyAppointment) => {
  setReason('');
  setCancelTarget(booking);
};

const doCancel = async () => {
  if (!cancelTarget || cancelling) return;
  setCancelling(true);
  try {
    await cancelFacultyAppointment(cancelTarget.id, reason.trim() || undefined);
    setCancelTarget(null);
    reload();
  } catch (e) {
    Alert.alert(t('error'), t(errorKey(e) as any));
  } finally {
    setCancelling(false);
  }
};

  const filtered = bookings.filter((b) => (tab === 'upcoming' ? !b.isPast : b.isPast));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('myBookingsTitle')}</Text>
        </View>

        <View style={[commonStyles.chipsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TabButton label={t('previous')} isActive={tab === 'previous'} onPress={() => setTab('previous')} colors={colors} />
          <TabButton label={t('upcoming')} isActive={tab === 'upcoming'} onPress={() => setTab('upcoming')} colors={colors} />
        </View>

        <View style={[commonStyles.panel, { borderColor: colors.border }]}>
         <DataState
  loading={loading}
  error={error}
  empty={filtered.length === 0}
  emptyText={t('noBookings')}
  onRetry={reload}
>
  {filtered.map((booking, index) => (
    <BookingRow
      key={booking.id}
      booking={booking}
      title={`${booking.isOnline ? t('onlineAppointment') : t('inPersonAppointment')} - ${t(booking.consultationKey)}`}
      isLast={index === filtered.length - 1}
      onCancel={() => confirmCancel(booking)}
      colors={colors}
      isRTL={isRTL}
    />
  ))}
</DataState>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>



<Modal visible={!!cancelTarget} transparent animationType="fade">
  <View style={styles.overlay}>
    <View style={[commonStyles.panel, { width: '100%', padding: 20, backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[commonStyles.name, { color: colors.primary, marginBottom: 8 }]}>{t('cancelBookingTitle')}</Text>
      <Text style={[commonStyles.paragraph, { color: colors.textSecondary, marginBottom: 14 }]}>{t('cancelBookingMsg')}</Text>

      <View style={commonStyles.field}>
        <Text style={[commonStyles.fieldLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('reasonOptional')}
        </Text>
        <TextInput
          style={[commonStyles.fieldInput, { borderColor: colors.border, color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('reasonPlaceholder')}
          placeholderTextColor={colors.placeholder}
          value={reason}
          onChangeText={setReason}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <TouchableOpacity
          style={[commonStyles.chip, { flex: 1, alignItems: 'center', borderColor: colors.border }]}
          onPress={() => setCancelTarget(null)}
        >
          <Text style={[commonStyles.chipText, { color: colors.textSecondary }]}>{t('no')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[commonStyles.chip, { flex: 1, alignItems: 'center', backgroundColor: colors.danger, borderColor: colors.danger, opacity: cancelling ? 0.6 : 1 }]}
          onPress={doCancel}
          disabled={cancelling}
        >
          <Text style={[commonStyles.chipText, { color: colors.white }]}>{t('yesCancel')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
      <FacultyTabBar activeTab="bookings" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

function TabButton({ label, isActive, onPress, colors }: { label: string; isActive: boolean; onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity
      style={[commonStyles.chip, { borderColor: colors.border, backgroundColor: isActive ? colors.white : colors.cardBackground }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[commonStyles.chipText, { color: isActive ? colors.primary : colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function BookingRow({
  booking,
  title,
  isLast,
  onCancel,
  colors,
  isRTL,
}: {

  booking: FacultyAppointment;
  title: string;
  isLast: boolean;
  onCancel: () => void;
  colors: any;
  isRTL: boolean;
}) {
  const info = [
    { icon: 'person-circle-outline', text: booking.studentName },
    { icon: 'time-outline', text: `${booking.date} - ${booking.time}` },
  ];

  return (
    <View
      style={[
        commonStyles.menuRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
        isRTL && { flexDirection: 'row-reverse' },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
        {info.map((item) => (
          <View key={item.icon} style={[styles.infoLine, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name={item.icon as any} size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      {!booking.isPast && (
        <TouchableOpacity activeOpacity={0.7} onPress={onCancel}>
          <Ionicons name="close" size={20} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
});