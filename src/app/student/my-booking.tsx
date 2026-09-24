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

type TabKey = 'previous' | 'upcoming';

interface Booking {
  id: string;
  title: string;
  doctor: string;
  location: string;
  datetime: string;
  isPast: boolean;
}

const INITIAL_BOOKINGS: Booking[] = [
  { id: '1', title: 'In-Person Appointment-Questions', doctor: 'Dr. Fatimah Abdullah', location: 'Office - Room 203(17D)', datetime: '3May 2026 - 11:00 AM', isPast: false },
  { id: '2', title: 'In-Person Appointment-Other', doctor: 'Dr.Najlaa Saleh', location: 'Office - Room 105(CL2)', datetime: '15May 2026 - 9:30 AM', isPast: false },
  { id: '3', title: 'Online Appointment-Project Discussion', doctor: 'Dr. Reem Khalid', location: 'Video Call', datetime: '10Feb 2026 - 1:00 PM', isPast: true },
];

export default function MyBookingScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  const cancelBooking = (id: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => setBookings((prev) => prev.filter((b) => b.id !== id)),
        },
      ]
    );
  };

  const filtered = bookings.filter((b) => (activeTab === 'upcoming' ? !b.isPast : b.isPast));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('myBookingsTitle')}</Text>
        </View>

        <View style={[styles.tabsWrapper, { backgroundColor: colors.cardBackground }, isRTL && { flexDirection: 'row-reverse' }]}>
          <TabButton label={t('previous')} isActive={activeTab === 'previous'} onPress={() => setActiveTab('previous')} colors={colors} />
          <TabButton label={t('upcoming')} isActive={activeTab === 'upcoming'} onPress={() => setActiveTab('upcoming')} colors={colors} />
        </View>

        <View style={[styles.listCard, { borderColor: colors.border }]}>
          {filtered.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noBookings')}</Text>
          ) : (
            filtered.map((booking, index) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                isLast={index === filtered.length - 1}
                colors={colors}
                isRTL={isRTL}
                onCancel={() => cancelBooking(booking.id)}
              />
            ))
          )}
        </View>

        <TouchableOpacity
          style={[styles.newBookingButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => router.push('/student/booking-type')}
        >
          <Text style={[styles.newBookingText, { color: colors.white }]}>{t('newBooking')}</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="my-booking" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

function TabButton({ label, isActive, onPress, colors }: any) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && { backgroundColor: colors.white }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[styles.tabText, { color: isActive ? colors.primary : colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function BookingRow({ booking, isLast, colors, isRTL, onCancel }: any) {
  return (
    <View style={[styles.bookingRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.bookingTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{booking.title}</Text>

        <View style={[styles.infoLine, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{booking.doctor}</Text>
        </View>

        <View style={[styles.infoLine, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="location-outline" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{booking.location}</Text>
        </View>

        <View style={[styles.infoLine, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{booking.datetime}</Text>
        </View>
      </View>

      {!booking.isPast && (
        <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.danger }]} activeOpacity={0.7} onPress={onCancel}>
          <Ionicons name="close" size={16} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 18, paddingTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  headerTitle: { fontSize: 22, fontWeight: '700' },

  tabsWrapper: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 18 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },

  listCard: { borderWidth: 1, borderRadius: 18, padding: 6, marginBottom: 22 },
  emptyText: { textAlign: 'center', paddingVertical: 24 },

  bookingRow: { flexDirection: 'row', padding: 14, gap: 10 },
  bookingTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoText: { fontSize: 11.5 },

  cancelButton: { width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },

  newBookingButton: { height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  newBookingText: { fontSize: 17, fontWeight: '700' },
});