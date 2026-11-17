import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';
import { commonStyles } from '../theme/styles';

// صفحة عامة بدون شريط سفلي: تعرض شروط الخدمة أو سياسة الخصوصية من شاشة إنشاء الحساب
export default function TermsScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? t('privacyPolicyTitle') : t('termsOfService');
  const keys = isPrivacy ? ['privacyP1', 'privacyP2', 'privacyP3'] : ['termsP1', 'termsP2', 'termsP3'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{title}</Text>
        </View>

        <View style={[commonStyles.panel, styles.card, { borderColor: colors.border }]}>
          {keys.map((key) => (
            <Text key={key} style={[commonStyles.paragraph, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t(key as any)}
            </Text>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, gap: 16 },
});