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
import { AdminTabBar } from '../../components/AdminTabBar';
import { AppLogo } from '../../components/AppLogo';
import { useAppSettings } from '../../context/AppSettingsContext';
import { adminApi } from '../../services/adminApi';
import { clearSession } from '../../services/session';
import { commonStyles } from '../../theme/styles';

export default function SettingsScreen() {
  const { colors, t, isDarkMode, toggleDarkMode, language, toggleLanguage, isRTL } =
    useAppSettings();

  const handlePress = async (key: string) => {
     if (key === 'logout') {
      try { await adminApi.logout(); } catch {}
      clearSession();
      router.replace('/login');
    } else if (key === 'account') {
      router.push('/admin/account');
    } else if (key === 'privacy') {
      router.push('/admin/privacy-policy');
    } else if (key === 'about') {
      router.push('/admin/about');
    } else if (key === 'contact') {
      router.push('/admin/contact-us');
    }
  };

  const NAV_ROWS = [
    { key: 'account', label: t('account'), icon: 'person-outline' as const },
    { key: 'privacy', label: t('privacyPolicy'), icon: 'lock-closed-outline' as const },
    { key: 'about', label: t('about'), icon: 'information-circle-outline' as const },
    { key: 'contact', label: t('contactUs'), icon: 'call-outline' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[commonStyles.scrollContentHeader, isRTL && { direction: 'rtl' }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[commonStyles.headerRow, styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('settingsTitle')}</Text>
        </View>

        <Text style={[commonStyles.headerSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('settingsSubtitle')}
        </Text>

        {/* Navigation rows */}
        <View style={[commonStyles.panel, styles.listCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {NAV_ROWS.map((row) => (
            <TouchableOpacity
              key={row.key}
              style={[commonStyles.menuRow, styles.row, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
              activeOpacity={0.7}
              onPress={() => handlePress(row.key)}
            >
              <Ionicons name={row.icon} size={20} color={colors.primary} />
              <Text style={[styles.rowLabel, { color: colors.primary }]}>{row.label}</Text>
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={18}
                color={colors.textSecondary}
                style={isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }}
              />
            </TouchableOpacity>
          ))}

          {/* Dark mode toggle */}
          <View style={[commonStyles.menuRow, styles.row, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="moon-outline" size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.primary }]}>{t('darkMode')}</Text>
            <View style={isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }}>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          {/* Language toggle */}
          <View style={[commonStyles.menuRow, styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="language-outline" size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.primary }]}>{t('arabic')}</Text>
            <View style={isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }}>
              <Switch
              value={language === 'ar'}
                onValueChange={toggleLanguage}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.
                    white}
              />
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[commonStyles.menuRow, styles.logoutRow, isRTL && { flexDirection: 'row-reverse' }]}
          activeOpacity={0.7}
          onPress={() => handlePress('logout')}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutLabel, { color: colors.danger }]}>{t('logout')}</Text>
        </TouchableOpacity>

        {/* Watermark Logo */}
        <View style={{ alignItems: 'center', marginTop: 50, opacity: 0.18 }}>
          <View style={commonStyles.logoContainer}>
            <AppLogo />
          </View>
          <Text style={[commonStyles.headerTitle, { color: colors.primary, textAlign: 'center' }]}>Silah</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <AdminTabBar activeTab="settings" onTabPress={(key) => router.replace(('/admin/' + key) as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  headerRow: { marginBottom: 10 },

  listCard: { marginBottom: 20 },

  row: { borderBottomWidth: 1 },
  rowLabel: { fontSize: 14.5, fontWeight: '600' },

  logoutRow: { paddingVertical: 14 },
  logoutLabel: { fontSize: 14.5, fontWeight: '700' },

  watermarkWrapper: { alignItems: 'center', marginTop: 50, opacity: 0.18 },
  watermarkText: { fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 26 },
});

