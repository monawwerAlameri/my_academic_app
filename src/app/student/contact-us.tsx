import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

export default function ContactUsScreen() {
  const { colors, t, isRTL } = useAppSettings();

  const CONTACT_ROWS = [
    { icon: 'mail-outline' as const, label: t('contactEmail'), value: 'silahacademic@gmail.com' },
    { icon: 'call-outline' as const, label: t('contactPhone'), value: '0530657978' },
    { icon: 'location-outline' as const, label: t('contactAddress'), value: t('contactAddressValue') },
  ]
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('contactUsTitle')}</Text>
        </View>

        <Text style={[commonStyles.headerSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('contactSubtitle')}
        </Text>

        <View style={[commonStyles.panel, { borderColor: colors.border }]}>
          {CONTACT_ROWS.map((row, index) => (
            <View
              key={row.label}
              style={[
                commonStyles.menuRow,
                index < CONTACT_ROWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                isRTL && { flexDirection: 'row-reverse' },
              ]}
            >
              <Ionicons name={row.icon} size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{row.label}</Text>
                <Text style={[commonStyles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="settings" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rowLabel: { fontSize: 12, marginBottom: 3 },
});