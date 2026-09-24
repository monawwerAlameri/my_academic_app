import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminTabBar } from '../../components/AdminTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

export default function AdminAboutScreen() {
  const { colors, t, isRTL } = useAppSettings();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('aboutTitle')}</Text>
        </View>

        <View style={styles.logoContainer}>
          <View style={[styles.logoLayer, { backgroundColor: colors.primary, top: 0 }]} />
          <View style={[styles.logoLayer, { backgroundColor: colors.accent, top: 32 }]} />
          <View style={[styles.logoLayer, { backgroundColor: colors.placeholder, top: 64 }]} />
        </View>

        <Text style={[styles.appName, { color: colors.primary }]}>Academic{'\n'}Booking</Text>

        <View style={[styles.card, { borderColor: colors.border }]}>
          <Text style={[styles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('aboutP1')}</Text>
          <Text style={[styles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('aboutP2')}</Text>
          <Text style={[styles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('aboutP3')}</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>{t('version')}</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <AdminTabBar activeTab="settings" onTabPress={(key) => router.replace(('/admin/' + key) as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26, alignSelf: 'stretch' },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  logoContainer: { width: 90, height: 100, alignItems: 'center', position: 'relative', marginBottom: 10 },
  logoLayer: { position: 'absolute', width: 80, height: 36, borderRadius: 6 },
  appName: { fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 26, marginBottom: 24 },
  card: { alignSelf: 'stretch', borderWidth: 1, borderRadius: 18, padding: 18, gap: 14 },
  paragraph: { fontSize: 13, lineHeight: 21 },
  version: { fontSize: 11, textAlign: 'center', marginTop: 6 },
});