import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';
import { commonStyles } from '../theme/styles';

export function EmptyState({ text, icon = 'file-tray-outline' }: any) {
  const { colors } = useAppSettings();
  return (
    <View style={{ alignItems: 'center', marginTop: 32, paddingHorizontal: 24, gap: 12 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border }}>
        <Ionicons name={icon} size={32} color={colors.textSecondary} />
      </View>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>{text}</Text>
    </View>
  );
}

export function DataState({ loading, error, empty, emptyText, onRetry, children }: any) {
  const { colors, t } = useAppSettings();
  if (loading) return <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />;
  if (error)
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onRetry}>
        <Text style={[commonStyles.empty, { color: colors.danger }]}>{t('loadError')} - {t('retry')}</Text>
      </TouchableOpacity>
    );
  if (empty) return <EmptyState text={emptyText} />;
  return <>{children}</>;
}