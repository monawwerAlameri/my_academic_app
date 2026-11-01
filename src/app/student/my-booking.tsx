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
import { DataState } from '../../components/DataState';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { errorKey } from '../../services/errors';
import { Booking, cancelBooking as cancelBookingApi, getBookings } from '../../services/student';
import { commonStyles } from '../../theme/styles';

type TabKey = 'previous' | 'upcoming';



export default function MyBookingScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const { data: bookings, loading, error, reload } = useFetch<Booking[]>(getBookings, []);

const cancelBooking = (id: string) => {
  Alert.alert(t('cancelBookingTitle'), t('cancelBookingMsg'), [
    { text: t('no'), style: 'cancel' },
    {
      text: t('yesCancel'),
      style: 'destructive',
      onPress: async () => {
        try {
          await cancelBookingApi(id);
          reload();
        } catch (e) {
          Alert.alert(t('error'), t(errorKey(e) as any));
        }
      },
    },
  ]);
};

  const filtered = bookings.filter((b) => (activeTab === 'upcoming' ? !b.isPast : b.isPast));

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
          <TabButton label={t('previous')} isActive={activeTab === 'previous'} onPress={() => setActiveTab('previous')} colors={colors} />
          <TabButton label={t('upcoming')} isActive={activeTab === 'upcoming'} onPress={() => setActiveTab('upcoming')} colors={colors} />
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
      isLast={index === filtered.length - 1}
      colors={colors}
      isRTL={isRTL}
      onCancel={() => cancelBooking(booking.id)}
    />
  ))}
</DataState>
        </View>

        <TouchableOpacity
          style={[commonStyles.saveButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => router.push('/student/booking-type')}
        >
          <Text style={[commonStyles.saveButtonText, { color: colors.white }]}>{t('newBooking')}</Text>
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
      style={[commonStyles.chip, { borderColor: colors.border, backgroundColor: isActive ? colors.white : colors.cardBackground }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[commonStyles.chipText, { color: isActive ? colors.primary : colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function BookingRow({ booking, isLast, colors, isRTL, onCancel }: any) {
  const info = [
    { icon: 'person-circle-outline', text: booking.doctor },
    { icon: 'location-outline', text: booking.location },
    { icon: 'time-outline', text: booking.datetime },
  ];

  return (
    <View style={[commonStyles.menuRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
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