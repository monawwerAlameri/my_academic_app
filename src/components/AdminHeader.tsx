import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';
import { commonStyles } from '../theme/styles';
interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { colors, isRTL } = useAppSettings();

  return (
    <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={{ flex: 1 }}>
        <Text style={[commonStyles.headerTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.actions, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
          activeOpacity={0.7}
          onPress={() => router.push('/admin/notifications' as any)}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          <View style={[styles.dot, { backgroundColor: colors.danger }]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
          activeOpacity={0.7}
          onPress={() => router.replace('/admin/settings' as any)}
        >
          <Ionicons name="person" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 },
 subtitle: { fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4 },
});