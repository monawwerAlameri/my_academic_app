import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

interface Review {
  id: string;
  studentName: string;
  rating: number;
  date: string;
  comment: string;
}

const SUMMARY = { average: 4.7, totalReviews: 128 };

const REVIEWS: Review[] = [
  { id: '1', studentName: 'Sara Almutairi', rating: 5, date: 'May 13,2026', comment: 'Dr. Sara explains complex topics in a very clear and simple way.' },
  { id: '2', studentName: 'Reem Omar', rating: 5, date: 'May 14,2026', comment: "One of the best professors I've had. Very supportive and approachable." },
  { id: '3', studentName: 'Salma', rating: 5, date: 'May 16,2026', comment: 'Great lecturer and very knowledgeable. her feedback helps a lot in improving.' },
];

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

  const selected = REVIEWS.find((r) => r.id === selectedId) ?? null;
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
                <Text style={[commonStyles.name, align, { color: colors.primary }]}>{selected.studentName}</Text>
                <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{selected.date}</Text>
              </View>
            </View>

            <View style={reverse || undefined}>
              <StarRow rating={selected.rating} size={22} colors={colors} />
            </View>

            <Text style={[commonStyles.paragraph, align, { color: colors.primary }]}>{selected.comment}</Text>
          </View>
        ) : (
          <>
            <View style={[commonStyles.panel, styles.card, { borderColor: colors.border, marginBottom: 20 }]}>
              <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{t('ratingSummary')}</Text>
              <View style={[commonStyles.headerRow, { marginBottom: 0 }, reverse]}>
                <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{SUMMARY.average}</Text>
                <StarRow rating={Math.round(SUMMARY.average)} size={22} colors={colors} />
              </View>
              <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>
                {t('basedOnReviews')} {SUMMARY.totalReviews} {t('reviewsWord')}
              </Text>
            </View>

            <View style={[commonStyles.panel, { borderColor: colors.border }]}>
              {REVIEWS.map((review, index) => (
                <TouchableOpacity
                  key={review.id}
                  style={[
                    commonStyles.menuRow,
                    index < REVIEWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    reverse,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedId(review.id)}
                >
                  <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.name, align, { color: colors.primary }]}>{review.studentName}</Text>
                    <Text style={[styles.smallText, align, { color: colors.textSecondary }]}>{review.date}</Text>
                    <Text style={[styles.smallText, align, { color: colors.primary }]} numberOfLines={2}>{review.comment}</Text>
                  </View>
                  <StarRow rating={review.rating} size={13} colors={colors} />
                  <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </>
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