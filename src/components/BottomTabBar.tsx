import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';
import { TranslationKey } from '../i18n/translations';

type TabItem = {
  key: string;
  labelKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
};

const TABS: TabItem[] = [
  { key: 'home', labelKey: 'home', icon: 'home' },
  { key: 'my-booking', labelKey: 'myBooking', icon: 'calendar-outline' },
  { key: 'waitlist', labelKey: 'waitlist', icon: 'time-outline' },
  { key: 'chat', labelKey: 'chat', icon: 'chatbubble-ellipses-outline' },
  { key: 'reviews', labelKey: 'reviews', icon: 'star-outline' },
  { key: 'settings', labelKey: 'settings', icon: 'settings-outline' },
];

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  const { colors, t, isRTL, isDarkMode } = useAppSettings();

  const barBackground = isDarkMode ? colors.background : colors.navBackground;
  const inactiveColor = isDarkMode ? '#9A9AA0' : '#FFFFFF';

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: barBackground },
        isDarkMode && { borderWidth: 1, borderColor: colors.border },
        isRTL && { flexDirection: 'row-reverse' },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={isActive ? colors.accent : inactiveColor}
            />
            <Text
              style={[
                styles.label,
                { color: inactiveColor },
                isActive && { color: colors.accent, fontWeight: '700' },
              ]}
            >
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  tab: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontSize: 10 },
});