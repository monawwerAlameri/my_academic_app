import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppLogo } from '../../components/AppLogo';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

export default function AboutScreen() {
  const { colors, t, isRTL } = useAppSettings();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[commonStyles.scrollContentHeader, styles.scrollContent]} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('aboutTitle')}</Text>
        </View>

        <View style={commonStyles.logoContainer}>
          <AppLogo />
        </View>

        <Text style={[styles.appName, { color: colors.primary }]}>Silah</Text>

        <View style={[commonStyles.panel, styles.card, { borderColor: colors.border }]}>
      <Text style={[commonStyles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('aboutP1')}</Text>
          <Text style={[commonStyles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('aboutP2')}</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>{t('version')}</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="settings" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { alignItems: 'center' },
  headerRow: { marginBottom: 26, alignSelf: 'stretch' },
  appName: { fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 26, marginBottom: 24 },
  card: { alignSelf: 'stretch', padding: 18, gap: 14 },
  version: { fontSize: 11, textAlign: 'center', marginTop: 6 },
});