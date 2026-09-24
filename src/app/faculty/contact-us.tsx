import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

export default function FacultyContactUsScreen() {
  const { colors, t, isRTL } = useAppSettings();

  const CONTACT_ROWS = [
    { icon: 'mail-outline' as const, label: t('contactEmail'), value: 'support@academicbooking.uoh.edu.sa' },
    { icon: 'call-outline' as const, label: t('contactPhone'), value: '+966 16 000 0000' },
    { icon: 'location-outline' as const, label: t('contactAddress'), value: 'University of Hail, College of CSE' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('contactUsTitle')}</Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('contactSubtitle')}
        </Text>

        <View style={[styles.card, { borderColor: colors.border }]}>
          {CONTACT_ROWS.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.row,
                index < CONTACT_ROWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                isRTL && { flexDirection: 'row-reverse' },
              ]}
            >
              <Ionicons name={row.icon} size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{row.label}</Text>
                <Text style={[styles.rowValue, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <FacultyTabBar activeTab="settings" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 12, lineHeight: 18, marginBottom: 22 },
  card: { borderWidth: 1, borderRadius: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 16 },
  rowLabel: { fontSize: 12, marginBottom: 3 },
  rowValue: { fontSize: 14, fontWeight: '600' },
});