import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { errorKey } from '../../services/errors';
import { createBooking } from '../../services/student';
import { commonStyles } from '../../theme/styles';
import { appointmentLabel } from '../../utils/labels';

export default function BookingConfirmScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { type, subtype, doctorId, date, start, end, doctor, location, datetime } = useLocalSearchParams<{
  type: string; subtype: string; doctorId: string; date: string; start: string; end: string;
  doctor: string; location: string; datetime: string;
    }>();
  const [submitting, setSubmitting] = useState(false);

 const handleConfirm = async () => {
  if (submitting) return;
  setSubmitting(true);
  try {
    await createBooking({ doctorId, date, start, end, type, subtype });
    Alert.alert(t('bookingConfirmed'));
    router.push('/student/my-booking');
  } catch (e) {
    Alert.alert(t('bookingFailed'), t(errorKey(e) as any));
  } finally {
    setSubmitting(false);
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

        <View style={[commonStyles.panel, styles.card, { borderColor: colors.border }]}>
          <View style={[styles.typeBadge, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <Text style={[styles.typeBadgeText, { color: colors.primary }]}>{appointmentLabel(type, subtype, t)}</Text>
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

          <TouchableOpacity style={[commonStyles.saveButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={handleConfirm}>
            <Text style={[commonStyles.saveButtonText, { color: colors.white }]}>{t('confirmBooking')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="my-booking" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20 },
  typeBadge: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 20 },
  typeBadgeText: { fontSize: 13, fontWeight: '700' },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  infoText: { fontSize: 14, fontWeight: '600' },
});