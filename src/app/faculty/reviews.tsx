import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DataState } from '../../components/DataState';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { FacultyReview, getFacultyReviews } from '../../services/doctor';
import { commonStyles } from '../../theme/styles';




function StarRow({ rating, size = 16, colors }: { rating: number; size?: number; colors: any }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons key={star} name={star <= rating ? 'star' : 'star-outline'} size={size} color={colors.accent} />
      ))}
    </View>
  );
}

export default function FacultyReviewsScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: reviews, loading, error, reload } = useFetch<FacultyReview[]>(getFacultyReviews, []);

const selected = reviews.find((r) => r.id === selectedId) ?? null;
const total = reviews.length;
const average = total ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10 : 0;
const nameOf = (r: FacultyReview) => (r.anonymous ? t('anonymousReviewer') : r.studentName);

  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, reverse]}>
          <TouchableOpacity onPress={() => (selected ? setSelectedId(null) : router.back())} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>
            {selected ? t('reviewTitle') : t('myRatingsTitle')}
          </Text>
        </View>

        {selected ? (
          <View style={[commonStyles.panel, styles.card, { borderColor: colors.border }]}>
            <View style={[commonStyles.headerRow, { marginBottom: 0 }, reverse]}>
              <Ionicons name="person-circle-outline" size={44} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.name, align, { color: colors.primary }]}>{nameOf(selected)}</Text>
                <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{selected.date}</Text>
              </View>
            </View>

            <View style={reverse || undefined}>
              <StarRow rating={selected.rating} size={22} colors={colors} />
            </View>

            <Text style={[commonStyles.paragraph, align, { color: colors.primary }]}>{selected.comment}</Text>
          </View>
        ) : (


          <DataState
  loading={loading}
  error={error}
  empty={reviews.length === 0}
  emptyText={t('noReviewsYet')}
  onRetry={reload}
>
            <View style={[commonStyles.panel, styles.card, { borderColor: colors.border, marginBottom: 20 }]}>
              <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{t('ratingSummary')}</Text>
              <View style={[commonStyles.headerRow, { marginBottom: 0 }, reverse]}>
                <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{average}</Text>
                <StarRow rating={Math.round(average)} size={22} colors={colors} />
              </View>
              <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>
                {t('basedOnReviews')} {total} {t('reviewsWord')}
              </Text>
            </View>

            <View style={[commonStyles.panel, { borderColor: colors.border }]}>
              {reviews.map((review, index) => (
                <TouchableOpacity
                  key={review.id}
                  style={[
                    commonStyles.menuRow,
                    index < reviews.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    reverse,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedId(review.id)}
                >
                  <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.name, align, { color: colors.primary }]}>{nameOf(review)}</Text>
                    <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{review.date}</Text>
                    <Text style={[styles.smallText, align, { color: colors.primary }]} numberOfLines={2}>{review.comment}</Text>
                  </View>
                  <StarRow rating={review.rating} size={13} colors={colors} />
                  <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </DataState>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      <FacultyTabBar activeTab="reviews" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 12 },
  card: { padding: 18, gap: 12 },
});