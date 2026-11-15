import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { DataState } from '../../components/DataState';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { errorKey } from '../../services/errors';
import { DaySchedule, Doctor, Slot, getDoctorSchedule, joinWaitlist, searchDoctors } from '../../services/student';
import { commonStyles } from '../../theme/styles';




export default function BookingScheduleScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { type, subtype } = useLocalSearchParams<{ type: string; subtype: string }>();
 const [search, setSearch] = useState('');
const [doctor, setDoctor] = useState<Doctor | null>(null);

const { data: doctors, loading: doctorsLoading, error: doctorsError, reload: reloadDoctors } =
  useFetch<Doctor[]>(() => searchDoctors(search), [], [search]);

const { data: schedule, loading: scheduleLoading, error: scheduleError, reload: reloadSchedule } =
  useFetch<DaySchedule[]>(
    () => (doctor ? getDoctorSchedule(doctor.id, type) : Promise.resolve([])),
    [],
    [doctor?.id, type]
  );

  const handleBook = (slot: Slot) => {
  if (!doctor) return;
  router.push({
    pathname: '/student/booking-confirm',
    params: {
      type,
      subtype,
      doctorId: doctor.id,
      doctor: doctor.name,
      location: slot.location || doctor.office || '',
      date: slot.date,
      start: slot.start,
      end: slot.end,
      datetime: `${slot.date} - ${slot.time}`,
    },
  });
};

const handleWaitlist = async (slot: Slot) => {
  if (!doctor) return;
  try {
    await joinWaitlist({ doctorId: doctor.id, date: slot.date, start: slot.start, end: slot.end, type, subtype });
    Alert.alert(t('waitlistJoined'));
    reloadSchedule();
  } catch (e) {
    Alert.alert(t('error'), t(errorKey(e) as any));
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('myBookingsTitle')}</Text>
        </View>

        <View style={[styles.typeBanner, { backgroundColor: colors.cardBackground }]}>
          <Text style={[commonStyles.chipText, { color: colors.primary }]}>{type} Appointment - {subtype}</Text>
        </View>

        <View style={[commonStyles.searchBox, { backgroundColor: colors.white, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="search" size={18} color={colors.primary} />
          <TextInput
            style={[commonStyles.searchInput, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
            value={search}
            placeholder={t('searchDoctor')}
            onChangeText={(text) => { setSearch(text); setDoctor(null); }}
            placeholderTextColor={colors.placeholder}
          />
        </View>

      {!doctor ? (
  <DataState
    loading={doctorsLoading}
    error={doctorsError}
    empty={doctors.length === 0}
    emptyText={t('noDoctorsFound')}
    onRetry={reloadDoctors}
  >
    {doctors.map((d) => (
      <TouchableOpacity
        key={d.id}
        activeOpacity={0.7}
        onPress={() => setDoctor(d)}
        style={[commonStyles.card, { backgroundColor: colors.white, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
      >
        <View style={[styles.doctorAvatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="person" size={20} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{d.name}</Text>
          <Text style={[styles.doctorInfo, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{d.office}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </DataState>
) : (
  <>
    <View style={[commonStyles.card, { backgroundColor: colors.white, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={[styles.doctorAvatar, { backgroundColor: colors.primary }]}>
        <Ionicons name="person" size={20} color={colors.white} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{doctor.name}</Text>
        <Text style={[styles.doctorInfo, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{doctor.office}</Text>
        <Text style={[styles.doctorInfo, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{t('rating')} {doctor.avgRating} ⭐</Text>
      </View>
    </View>

    <DataState
      loading={scheduleLoading}
      error={scheduleError}
      empty={schedule.length === 0}
      emptyText={t('noScheduleAvailable')}
      onRetry={reloadSchedule}
    >
      {schedule.map((day) => (
        <View key={day.id} style={[commonStyles.panel, styles.dayCard, { borderColor: colors.border }]}>
          <Text style={[commonStyles.name, { color: colors.primary }]}>{t(day.dayKey as any)} - {day.date}</Text>

          {day.slots.map((slot, index) => (
            <View
              key={slot.id}
              style={[
                styles.slotRow,
                index < day.slots.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                isRTL && { flexDirection: 'row-reverse' },
              ]}
            >
              <Text style={[styles.slotTime, { color: colors.primary }]}>{slot.time}</Text>

              <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <View style={[styles.statusBadge, { backgroundColor: slot.status === 'available' ? colors.successLight : colors.danger }]}>
                  <Text style={[styles.smallText, { color: slot.status === 'available' ? colors.success : colors.white }]}>
                    {slot.status === 'available' ? t('available') : t('fullBooked')}
                  </Text>
                </View>
              </View>

              <View style={{ flex: 1, alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                {slot.status === 'available' ? (
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={() => handleBook(slot)}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.white} />
                    <Text style={[styles.smallText, { color: colors.white }]}>{t('book')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.warning }]} activeOpacity={0.8} onPress={() => handleWaitlist(slot)}>
                    <Ionicons name="time-outline" size={12} color={colors.white} />
                    <Text style={[styles.smallText, { color: colors.white }]}>{t('waitlistButton')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
    </DataState>
  </>
)}
        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="my-booking" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  typeBanner: { borderRadius: 12, padding: 12, marginBottom: 16 },
  doctorAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  doctorInfo: { fontSize: 11, marginTop: 2 },
  dayCard: { padding: 16, marginBottom: 16 },
  slotRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 6 },
  slotTime: { flex: 1.3, fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14 },
  smallText: { fontSize: 11, fontWeight: '700' },
});