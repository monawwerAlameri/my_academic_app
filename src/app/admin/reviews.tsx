import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdminHeader } from '../../components/AdminHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { DataState } from '../../components/DataState';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { adminApi, DoctorRatingSummary, DoctorReviewsData } from '../../services/adminApi';
import { commonStyles } from '../../theme/styles';

function Stars({ value, size, color }: { value: number; size: number; color: string }) {
  const filled = Math.round(value);
  const items = [0, 1, 2, 3, 4];
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {items.map((i) => (
        <Ionicons key={i} name={i < filled ? 'star' : 'star-outline'} size={size} color={color} />
      ))}
    </View>
  );
}

export default function AdminReviews() {
  const { colors, t, isRTL } = useAppSettings();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const textAlign = isRTL ? 'right' : 'left';
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const q = query.trim().toLowerCase();

  const list = useFetch(async () => {
    const res = await adminApi.getReviews();
    if (!res.success || !res.data) throw new Error(res.message);
    return res.data;
  }, [] as DoctorRatingSummary[]);

  const detail = useFetch(async () => {
    if (!selectedId) return null;
    const res = await adminApi.getDoctorReviews(selectedId);
    if (!res.success || !res.data) throw new Error(res.message);
    return res.data;
  }, null as DoctorReviewsData | null, [selectedId]);

  const doctors = list.data.filter((d) => d.fullName.toLowerCase().includes(q));
  const selected = detail.data && detail.data.facultyId === selectedId ? detail.data : null;

  let content = null;

  if (selectedId === null) {
    // ---------- قائمة الدكاترة ----------
    const doctorCards = doctors.map((d) => {
      const rating = d.averageRating ?? 0;
      return (
        <TouchableOpacity
          key={d.facultyId}
          activeOpacity={0.8}
          onPress={() => setSelectedId(d.facultyId)}
          style={[commonStyles.card, styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border, flexDirection: rowDir }]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.pillBackground }]}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>{d.fullName.replace('Dr. ', '').charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[commonStyles.name, { color: colors.primary, textAlign: textAlign }]}>{d.fullName}</Text>
            <View style={[styles.starsRow, { flexDirection: rowDir }]}>
              <Stars value={rating} size={14} color={colors.accent} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{rating.toFixed(1)}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                ({d.reviewCount} {t('reviewsCountLabel')})
              </Text>
            </View>
          </View>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      );
    });

    content = (
      <View>
        <View style={[commonStyles.searchBox, { borderColor: colors.border, backgroundColor: colors.cardBackground, flexDirection: rowDir }]}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            style={[commonStyles.searchInput, { color: colors.primary, textAlign: textAlign }]}
            placeholder={t('searchDoctorReviews')}
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <DataState loading={list.loading} error={list.error} empty={doctors.length === 0} emptyText={t('noDoctorsFound')} onRetry={list.reload}>
          {doctorCards}
        </DataState>
      </View>
    );
  } else {
    // ---------- تقييمات دكتور واحد ----------
    const rating = selected?.averageRating ?? 0;

    content = (
      <View>
        <TouchableOpacity
          style={[styles.backRow, { flexDirection: rowDir }]}
          activeOpacity={0.7}
          onPress={() => setSelectedId(null)}
        >
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color={colors.accent} />
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 14 }}>{t('backToSearch')}</Text>
        </TouchableOpacity>

        <DataState loading={detail.loading || !selected} error={detail.error} empty={false} onRetry={detail.reload}>
          {selected && (
            <>
              <View style={[styles.summary, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.white, fontSize: 17, fontWeight: '700' }}>{selected.fullName}</Text>
                <View style={[styles.starsRow, { marginTop: 10, flexDirection: rowDir }]}>
                  <Text style={{ color: colors.white, fontSize: 30, fontWeight: '700' }}>{rating.toFixed(1)}</Text>
                  <Stars value={rating} size={18} color={colors.accent} />
                </View>
                <Text style={{ color: colors.white, opacity: 0.8, fontSize: 12.5, marginTop: 4 }}>
                  {selected.reviewCount} {t('reviewsCountLabel')}
                </Text>
              </View>

              {selected.reviews.length === 0 && (
                <Text style={[commonStyles.empty, { color: colors.textSecondary }]}>{t('noReviewsYet')}</Text>
              )}

              {selected.reviews.map((r) => (
                <View key={String(r.reviewId)} style={[styles.reviewCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <View style={[styles.reviewTop, { flexDirection: rowDir }]}>
                    <Text style={[commonStyles.name, { color: colors.primary }]}>
                      {r.reviewerName === 'Anonymous' ? t('anonymousReviewer') : r.reviewerName}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{String(r.reviewDate ?? '').slice(0, 10)}</Text>
                  </View>
                  <View style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start', marginVertical: 6 }}>
                    <Stars value={r.rating} size={14} color={colors.accent} />
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: textAlign }}>{r.comment}</Text>
                </View>
              ))}
            </>
          )}
        </DataState>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AdminHeader title={t('reviewsTitle')} subtitle={t('reviewsAdminSubtitle')} />
        {content}
        <View style={{ height: 110 }} />
      </ScrollView>
      <AdminTabBar activeTab="reviews" onTabPress={(key) => router.replace(('/admin/' + key) as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
summary: { borderRadius: 18, padding: 18, marginBottom: 16 },
  reviewCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});