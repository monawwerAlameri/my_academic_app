import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

export default function PrivacyPolicyScreen() {
  const { colors, t, isRTL } = useAppSettings();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('privacyPolicyTitle')}</Text>
        </View>

        <View style={[styles.card, { borderColor: colors.border }]}>
          <Text style={[styles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('privacyP1')}</Text>
          <Text style={[styles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('privacyP2')}</Text>
          <Text style={[styles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('privacyP3')}</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="settings" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 18, padding: 18, gap: 16 },
  paragraph: { fontSize: 13, lineHeight: 21 },
});