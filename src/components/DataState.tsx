import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';
import { commonStyles } from '../theme/styles';

export function DataState({ loading, error, empty, emptyText, onRetry, children }: any) {
  const { colors, t } = useAppSettings();
  if (loading) return <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} />;
  if (error)
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onRetry}>
        <Text style={[commonStyles.empty, { color: colors.danger }]}>{t('loadError')} - {t('retry')}</Text>
      </TouchableOpacity>
    );
  if (empty) return <Text style={[commonStyles.empty, { color: colors.textSecondary }]}>{emptyText}</Text>;
  return <>{children}</>;
}