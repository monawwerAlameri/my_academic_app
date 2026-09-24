import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

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

export default function FacultyReviewsScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = REVIEWS.find((r) => r.id === selectedId) ?? null;

  // ----- Detail view (inline, same file) -----
  if (selected) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity onPress={() => setSelectedId(null)} activeOpacity={0.7}>
              <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('reviewTitle')}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.studentRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.studentNameLarge, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {selected.studentName}
                </Text>
                <Text style={[styles.dateLarge, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {selected.date}
                </Text>
              </View>
            </View>

            <View style={[styles.starsRow, isRTL && { flexDirection: 'row-reverse' }]}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= selected.rating ? 'star' : 'star-outline'}
                  size={22}
                  color={colors.accent}
                />
              ))}
            </View>

            <Text style={[styles.commentLarge, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
              {selected.comment}
            </Text>
          </View>

          <View style={{ height: 90 }} />
        </ScrollView>

        <FacultyTabBar activeTab="reviews" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
      </SafeAreaView>
    );
  }

  // ----- List view -----
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('myRatingsTitle')}</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('ratingSummary')}
          </Text>
          <View style={[styles.summaryRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.summaryScore, { color: colors.primary }]}>{SUMMARY.average}</Text>
            <StarRow rating={Math.round(SUMMARY.average)} size={22} colors={colors} />
          </View>
          <Text style={[styles.summarySubtext, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('basedOnReviews')} {SUMMARY.totalReviews} {t('reviewsWord')}
          </Text>
        </View>

        <View style={[styles.listCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {REVIEWS.map((review, index) => (
            <TouchableOpacity key={review.id} activeOpacity={0.7} onPress={() => setSelectedId(review.id)}>
              <ReviewRow review={review} isLast={index === REVIEWS.length - 1} colors={colors} isRTL={isRTL} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <FacultyTabBar activeTab="reviews" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

function StarRow({ rating, size = 16, colors }: { rating: number; size?: number; colors: any }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons key={star} name={star <= rating ? 'star' : 'star-outline'} size={size} color={colors.accent} />
      ))}
    </View>
  );
}

function ReviewRow({
  review,
  isLast,
  colors,
  isRTL,
}: {
  review: Review;
  isLast: boolean;
  colors: any;
  isRTL: boolean;
}) {
  return (
    <View style={[styles.reviewRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <View style={[styles.reviewHeader, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="person" size={16} color={colors.white} />
        </View>
        <Text style={[styles.studentName, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{review.studentName}</Text>
        <StarRow rating={review.rating} size={13} colors={colors} />
        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.textSecondary} />
      </View>
      <Text
        style={[
          styles.reviewDate,
          { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
          isRTL ? { marginRight: 32 } : { marginLeft: 32 },
        ]}
      >
        {review.date}
      </Text>
      <Text
        style={[
          styles.reviewComment,
          { color: colors.primary, textAlign: isRTL ? 'right' : 'left' },
          isRTL ? { marginRight: 32 } : { marginLeft: 32 },
        ]}
        numberOfLines={2}
      >
        {review.comment}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 10 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  headerTitle: { fontSize: 22, fontWeight: '700' },

  summaryCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 },
  summaryLabel: { fontSize: 13, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryScore: { fontSize: 30, fontWeight: '700' },
  summarySubtext: { fontSize: 11.5, marginTop: 6 },

  listCard: { borderWidth: 1, borderRadius: 18, padding: 6 },
  reviewRow: { padding: 14 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  avatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  studentName: { fontSize: 13.5, fontWeight: '700', flex: 1 },
  reviewDate: { fontSize: 10.5, marginBottom: 6 },
  reviewComment: { fontSize: 12.5, lineHeight: 18 },

  card: { borderWidth: 1, borderRadius: 18, padding: 18, gap: 16 },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarLarge: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  studentNameLarge: { fontSize: 16, fontWeight: '700' },
  dateLarge: { fontSize: 12, marginTop: 2 },
  starsRow: { flexDirection: 'row', gap: 4 },
  commentLarge: { fontSize: 14, lineHeight: 22 },
});