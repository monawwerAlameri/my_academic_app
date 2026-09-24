import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

export default function BookingConfirmScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { type, subtype, doctor, location, datetime } = useLocalSearchParams<{
    type: string; subtype: string; doctor: string; location: string; datetime: string;
  }>();

  const handleConfirm = () => router.push('/student/my-booking');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('myBookingsTitle')}</Text>
        </View>

        <View style={[styles.card, { borderColor: colors.border }]}>
          <View style={[styles.typeBadge, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <Text style={[styles.typeBadgeText, { color: colors.primary }]}>{type} Appointment-{subtype}</Text>
          </View>

          <View style={[styles.infoLine, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>{doctor}</Text>
          </View>

          <View style={[styles.infoLine, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>{location}</Text>
          </View>

          <View style={[styles.infoLine, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>{datetime}</Text>
          </View>

          <TouchableOpacity style={[styles.confirmButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={handleConfirm}>
            <Text style={[styles.confirmButtonText, { color: colors.white }]}>{t('confirmBooking')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="my-booking" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 18, paddingTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '700' },

  card: { borderWidth: 1, borderRadius: 18, padding: 20 },
  typeBadge: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 20 },
  typeBadgeText: { fontSize: 13, fontWeight: '700' },

  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  infoText: { fontSize: 14, fontWeight: '600' },

  confirmButton: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  confirmButtonText: { fontSize: 15, fontWeight: '700' },
});