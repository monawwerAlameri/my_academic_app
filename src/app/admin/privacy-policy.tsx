import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminTabBar } from '../../components/AdminTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

export default function AdminPrivacyPolicyScreen() {
  const { colors, t, isRTL } = useAppSettings();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('privacyPolicyTitle')}</Text>
        </View>

        <View style={[commonStyles.panel, styles.card, { borderColor: colors.border }]}>
          <Text style={[commonStyles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('privacyP1')}</Text>
          <Text style={[commonStyles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('privacyP2')}</Text>
          <Text style={[commonStyles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('privacyP3')}</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <AdminTabBar activeTab="settings" onTabPress={(key) => router.replace(('/admin/' + key) as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, gap: 16 },
});