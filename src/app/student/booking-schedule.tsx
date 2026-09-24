import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

type SlotStatus = 'available' | 'full';
interface Slot { id: string; time: string; status: SlotStatus; }
interface DaySchedule { id: string; label: string; slots: Slot[]; }

const DOCTOR = {
  name: 'Dr.Laila saud',
  office: 'Office 203-17D',
  rating: '4,7',
};

const SCHEDULE: DaySchedule[] = [
  { id: 'mon', label: 'Monday - 3May', slots: [
    { id: 's1', time: '11:00 Am - 11:55 Am', status: 'available' },
    { id: 's2', time: '9:00 Am - 10:00 Am', status: 'full' },
  ]},
  { id: 'tue', label: 'Tuseday - 4May', slots: [
    { id: 's4', time: '9:00 Am - 10:00 Am', status: 'full' },
    { id: 's5', time: '11:00 Am - 11:55 Am', status: 'available' },
  ]},
];

export default function BookingScheduleScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { type, subtype } = useLocalSearchParams<{ type: string; subtype: string }>();
  const [search, setSearch] = useState('Dr.Laila saud');

  const handleBook = (day: DaySchedule, slot: Slot) => {
    router.push({
      pathname: '/student/booking-confirm',
      params: { type, subtype, doctor: DOCTOR.name, location: DOCTOR.office, datetime: day.label + ' - ' + slot.time },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('myBookingsTitle')}</Text>
        </View>

        <View style={[styles.typeBanner, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.typeBannerText, { color: colors.primary }]}>{type} Appointment - {subtype}</Text>
        </View>

        <View style={[styles.searchWrapper, { backgroundColor: colors.white }, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="search" size={18} color={colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <View style={[styles.doctorCard, { backgroundColor: colors.white }, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={[styles.doctorAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.doctorName, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{DOCTOR.name}</Text>
            <Text style={[styles.doctorInfo, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{DOCTOR.office}</Text>
            <Text style={[styles.doctorInfo, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{t('rating')} {DOCTOR.rating} ⭐</Text>
          </View>
        </View>

        {SCHEDULE.map((day) => (
          <View key={day.id} style={[styles.dayCard, { borderColor: colors.border }]}>
            <Text style={[styles.dayLabel, { color: colors.primary }]}>{day.label}</Text>

            {day.slots.map((slot, index) => (
              <View key={slot.id} style={[styles.slotRow, index < day.slots.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.
                border }, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[styles.slotTime, { flex: 1.3, color: colors.primary }]}>{slot.time}</Text>

                <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <View style={[styles.statusBadge, { backgroundColor: slot.status === 'available' ? colors.successLight : colors.danger }]}>
                    <Text style={[styles.statusText, { color: slot.status === 'available' ? colors.success : colors.white }]}>
                      {slot.status === 'available' ? t('available') : t('fullBooked')}
                    </Text>
                  </View>
                </View>

                <View style={{ flex: 1, alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                  {slot.status === 'available' ? (
                    <TouchableOpacity style={[styles.bookButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={() => handleBook(day, slot)}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.white} />
                      <Text style={[styles.bookButtonText, { color: colors.white }]}>{t('book')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.waitlistButton, { backgroundColor: colors.warning }]} activeOpacity={0.8}>
                      <Ionicons name="time-outline" size={12} color={colors.white} />
                      <Text style={[styles.waitlistButtonText, { color: colors.white }]}>{t('waitlistButton')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="my-booking" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 18, paddingTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '700' },

  typeBanner: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 16 },
  typeBannerText: { fontSize: 12.5, fontWeight: '700' },

  searchWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 30, height: 46, paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 13 },

  doctorCard: { flexDirection: 'row', gap: 12, borderRadius: 16, padding: 14, marginBottom: 18 },
  doctorAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 15, fontWeight: '700' },
  doctorInfo: { fontSize: 11, marginTop: 2 },

  dayCard: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 16 },
  dayLabel: { fontSize: 16, fontWeight: '700', marginBottom: 10 },

  slotRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 6 },
  slotTime: { fontSize: 12 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 10.5, fontWeight: '700' },

  bookButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14 },
  bookButtonText: { fontSize: 11, fontWeight: '700' },

  waitlistButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14 },
  waitlistButtonText: { fontSize: 10, fontWeight: '700' },
});