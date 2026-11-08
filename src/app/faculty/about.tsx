import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

export default function FacultyAboutScreen() {
  const { colors, t, isRTL } = useAppSettings();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('aboutTitle')}</Text>
        </View>

        <View style={[commonStyles.logoContainer, { alignSelf: 'center' }]}>
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.primary, top: 0 }]} />
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.accent, top: 32 }]} />
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.placeholder, top: 64 }]} />
        </View>

        <Text style={[commonStyles.headerTitle, { color: colors.primary, textAlign: 'center', marginBottom: 24 }]}>Academic{'\n'}Booking</Text>

        <View style={[commonStyles.panel, styles.card, { borderColor: colors.border }]}>
          {['aboutP1', 'aboutP2', 'aboutP3'].map((key) => (
            <Text key={key} style={[commonStyles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t(key as any)}
            </Text>
          ))}
          <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center' }}>{t('version')}</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <FacultyTabBar activeTab="settings" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, gap: 14 },
});