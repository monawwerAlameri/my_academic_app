import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

type ListTab = 'previous' | 'upcoming';

interface Booking {
  id: string;
  title: string;
  studentName: string;
  datetime: string;
  isPast: boolean;
}

const BOOKINGS: Booking[] = [
  { id: '1', title: 'In-Person Appointment-Questions', studentName: 'Fatimah Abdullah', datetime: '3May 2026 - 11:00 AM', isPast: false },
  { id: '2', title: 'In-Person Appointment-Other', studentName: 'Najlaa Saleh', datetime: '15May 2026 - 9:30 AM', isPast: false },
  { id: '3', title: 'Online Appointment-Project Discussion', studentName: 'Reem Khalid', datetime: '10Feb 2026 - 1:00 PM', isPast: true },
];

export default function FacultyBookingsScreen() {
  const { colors, t, isRTL, language } = useAppSettings();
  const [tab, setTab] = useState<ListTab>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);

  const confirmCancel = (booking: Booking) => {
    const isAr = language === 'ar';
    Alert.alert(
      isAr ? 'إلغاء الحجز' : 'Cancel Booking',
      isAr ? 'هل أنت متأكد من إلغاء هذا الموعد؟' : 'Are you sure you want to cancel this appointment?',
      [
        { text: isAr ? 'لا' : 'No', style: 'cancel' },
        {
          text: isAr ? 'نعم' : 'Yes',
          style: 'destructive',
          onPress: () => setBookings((prev) => prev.filter((b) => b.id !== booking.id)),
        },
      ]
    );
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
          {filtered.length === 0 ? (
            <Text style={[commonStyles.empty, { color: colors.textSecondary }]}>{t('noBookings')}</Text>
          ) : (
            filtered.map((booking, index) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                isLast={index === filtered.length - 1}
                onCancel={() => confirmCancel(booking)}
                colors={colors}
                isRTL={isRTL}
              />
            ))
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

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
  isLast,
  onCancel,
  colors,
  isRTL,
}: {
  booking: Booking;
  isLast: boolean;
  onCancel: () => void;
  colors: any;
  isRTL: boolean;
}) {
  const info = [
    { icon: 'person-circle-outline', text: booking.studentName },
    { icon: 'time-outline', text: booking.datetime },
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
        <Text style={[commonStyles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{booking.title}</Text>
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
});