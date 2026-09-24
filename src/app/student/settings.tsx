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

export default function SettingsScreen() {
  const { colors, t, isDarkMode, toggleDarkMode, language, toggleLanguage, isRTL } =
    useAppSettings();

  const handlePress = (key: string) => {
    if (key === 'logout') {
      router.push('/login');
    } else if (key === 'account') {
      router.push('/student/account');
    } else if (key === 'privacy') {
      router.push('/student/privacy-policy');
    } else if (key === 'about') {
      router.push('/student/about');
    } else if (key === 'contact') {
      router.push('/student/contact-us');
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
        contentContainerStyle={[styles.scrollContent, isRTL && { direction: 'rtl' }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={26}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('settingsTitle')}</Text>
        </View>

        <Text style={[styles.headerSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('settingsSubtitle')}
        </Text>

        {/* Navigation rows */}
        <View style={[styles.listCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {NAV_ROWS.map((row) => (
            <TouchableOpacity
              key={row.key}
              style={[styles.row, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
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
          <View style={[styles.row, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
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
          <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="language-outline" size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.primary }]}>{t('arabic')}</Text>
            <View style={isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }}>
              <Switch
                value={language === 'ar'}
                onValueChange={toggleLanguage}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutRow, isRTL && { flexDirection: 'row-reverse' }]}
          activeOpacity={0.7}
          onPress={() => handlePress('logout')}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutLabel, { color: colors.danger }]}>{t('logout')}</Text>
        </TouchableOpacity>

        {/* Watermark Logo */}
        <View style={styles.watermarkWrapper}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoLayer, { backgroundColor: colors.primary, top: 0 }]} />
            <View style={[styles.logoLayer, { backgroundColor: colors.accent, top: 32 }]} />
            <View style={[styles.logoLayer, { backgroundColor: colors.placeholder, top: 64 }]} />
          </View>
          <Text style={[styles.watermarkText, { color: colors.primary }]}>Academic{'\n'}Booking</Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="settings" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, marginBottom: 22, lineHeight: 18 },

  listCard: { borderWidth: 1, borderRadius: 18, marginBottom: 20 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rowLabel: { fontSize: 14.5, fontWeight: '600' },

  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  logoutLabel: { fontSize: 14.5, fontWeight: '700' },

  watermarkWrapper: { alignItems: 'center', marginTop: 50, opacity: 0.18 },
  logoContainer: { width: 90, height: 100, alignItems: 'center', position: 'relative', marginBottom: 10 },
  logoLayer: { position: 'absolute', width: 80, height: 36, borderRadius: 6 },
  watermarkText: { fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 26 },
});
