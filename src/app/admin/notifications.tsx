import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppSettings } from '../../context/AppSettingsContext';
import { adminNotifications } from '../../services/adminMockData';

export default function AdminNotifications() {
  const { colors, t, isRTL } = useAppSettings();
  const [items, setItems] = useState([...adminNotifications]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.primary, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>{t('notificationTitle')}</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={() => setItems([])} activeOpacity={0.7}>
              <Text style={{ color: colors.accent, fontWeight: '700' }}>{t('clearAll')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 && (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>{t('noNotifications')}</Text>
        )}

        {items.map((n) => (
          <View key={n.id} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.pillBackground }]}>
              <Ionicons name={n.icon as any} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={[styles.titleRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={[styles.cardTitle, { color: colors.primary }]}>{t(n.titleKey)}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{n.date}</Text>
              </View>
              <Text style={[styles.body, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{t(n.bodyKey)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 14 },
  card: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  body: { fontSize: 12.5, marginTop: 4, lineHeight: 18 },
});