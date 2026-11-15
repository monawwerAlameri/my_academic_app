import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { clearSession } from '../../services/session';
import { commonStyles } from '../../theme/styles';

export default function SettingsScreen() {
  const { colors, t, isDarkMode, toggleDarkMode, language, toggleLanguage, isRTL } =
    useAppSettings();

  const reverse = isRTL && { flexDirection: 'row-reverse' as const };
  const rowStyle = [commonStyles.menuRow, { borderBottomWidth: 1, borderBottomColor: colors.border }, reverse];
  const labelStyle = [commonStyles.name, { flex: 1, color: colors.primary }];
  const switchColors = { trackColor: { false: colors.border, true: colors.accent }, thumbColor: colors.white };

  const NAV_ROWS = [
    { route: '/student/account', label: t('account'), icon: 'person-outline' as const },
    { route: '/student/privacy-policy', label: t('privacyPolicy'), icon: 'lock-closed-outline' as const },
    { route: '/student/about', label: t('about'), icon: 'information-circle-outline' as const },
    { route: '/student/contact-us', label: t('contactUs'), icon: 'call-outline' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[commonStyles.scrollContentHeader, isRTL && { direction: 'rtl' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[commonStyles.headerRow, reverse]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('settingsTitle')}</Text>
        </View>

        <Text style={[commonStyles.headerSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('settingsSubtitle')}
        </Text>

        <View style={[commonStyles.panel, { borderColor: colors.border, marginBottom: 20 }]}>
          {NAV_ROWS.map((row) => (
            <TouchableOpacity key={row.route} style={rowStyle} activeOpacity={0.7} onPress={() => router.push(row.route as any)}>
              <Ionicons name={row.icon} size={20} color={colors.primary} />
              <Text style={labelStyle}>{row.label}</Text>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}

          <View style={rowStyle}>
            <Ionicons name="moon-outline" size={20} color={colors.primary} />
            <Text style={labelStyle}>{t('darkMode')}</Text>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} {...switchColors} />
          </View>

          <View style={[commonStyles.menuRow, reverse]}>
            <Ionicons name="language-outline" size={20} color={colors.primary} />
            <Text style={labelStyle}>{t('arabic')}</Text>
            <Switch value={language === 'ar'} onValueChange={toggleLanguage} {...switchColors} />
          </View>
        </View>

        <TouchableOpacity style={[commonStyles.menuRow, reverse]} activeOpacity={0.7} onPress={() => { clearSession(); router.replace('/login'); }}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[commonStyles.name, { color: colors.danger }]}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={styles.watermark}>
          <View style={commonStyles.logoContainer}>
            <View style={[commonStyles.logoLayer, { backgroundColor: colors.primary, top: 0 }]} />
            <View style={[commonStyles.logoLayer, { backgroundColor: colors.accent, top: 32 }]} />
            <View style={[commonStyles.logoLayer, { backgroundColor: colors.placeholder, top: 64 }]} />
          </View>
          <Text style={[commonStyles.headerTitle, { color: colors.primary, textAlign: 'center' }]}>Academic{'\n'}Booking</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="settings" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  watermark: { alignItems: 'center', marginTop: 50, opacity: 0.18 },
});


