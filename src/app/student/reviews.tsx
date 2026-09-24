import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

type Review = { id: string; name: string; anonymous: boolean; rating: number; comment: string; date: string; };
type Doctor = { id: string; name: string; avgRating: number; reviewsCount: number; reviews: Review[]; };

const DOCTORS: Doctor[] = [
  {
    id: '1', name: 'Dr. Fatimah Abdullah', avgRating: 4.6, reviewsCount: 32,
    reviews: [
      { id: 'r1', name: 'Nora A.', anonymous: false, rating: 5, comment: 'Very clear and patient during the meeting.', date: '2 days ago' },
      { id: 'r2', name: 'Anonymous student', anonymous: true, rating: 4, comment: 'Helpful feedback, replied fast on chat.', date: '1 week ago' },
    ],
  },
  { id: '2', name: 'Dr. Najlaa Saleh', avgRating: 4.2, reviewsCount: 18, reviews: [] },
];

function StarRow({ rating, size = 14, editable = false, onChange, colors }: any) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} disabled={!editable} activeOpacity={0.7} onPress={() => onChange?.(n)}>
          <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={size} color={colors.warning} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [postAnonymously, setPostAnonymously] = useState(false);

  const filteredDoctors = DOCTORS.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmitReview = () => {
    if (myRating === 0 || myComment.trim() === '') return;
    setMyRating(0);
    setMyComment('');
    setPostAnonymously(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={[styles.pageTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('reviewsTitle')}</Text>

        <View style={[styles.searchWrapper, { backgroundColor: colors.white }, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('searchDoctorReviews')}
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={(text) => { setSearch(text); setSelectedDoctor(null); }}
          />
        </View>

        {!selectedDoctor &&
          filteredDoctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              style={[styles.doctorCard, { backgroundColor: colors.cardBackground }, isRTL && { flexDirection: 'row-reverse' }]}
              activeOpacity={0.7}
              onPress={() => setSelectedDoctor(doctor)}
            >
              <Ionicons name="person-circle-outline" size={30} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.doctorName, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{doctor.name}</Text>
                <View style={[styles.ratingRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <StarRow rating={Math.round(doctor.avgRating)} colors={colors} />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                    {doctor.avgRating} · {doctor.
                    reviewsCount} {t('reviewsCountLabel')}
                  </Text>
                </View>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.placeholder} />
            </TouchableOpacity>
          ))}

        {selectedDoctor && (
          <View style={[styles.card, { borderColor: colors.border }]}>
            <TouchableOpacity style={[styles.backRow, isRTL && { flexDirection: 'row-reverse' }]} activeOpacity={0.7} onPress={() => setSelectedDoctor(null)}>
              <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={18} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>{t('backToSearch')}</Text>
            </TouchableOpacity>

            <View style={[styles.doctorHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Ionicons name="person-circle-outline" size={44} color={colors.primary} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
              <View>
                <Text style={[styles.doctorNameLarge, { color: colors.primary }]}>{selectedDoctor.name}</Text>
                <View style={[styles.ratingRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <StarRow rating={Math.round(selectedDoctor.avgRating)} colors={colors} />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                    {selectedDoctor.avgRating} ({selectedDoctor.reviewsCount})
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {selectedDoctor.reviews.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noReviewsYet')}</Text>
            ) : (
              selectedDoctor.reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={[styles.reviewHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.reviewerName, { color: colors.primary }]}>{review.name}</Text>
                    <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{review.date}</Text>
                  </View>
                  <StarRow rating={review.rating} size={12} colors={colors} />
                  <Text style={[styles.reviewComment, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{review.comment}</Text>
                </View>
              ))
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.writeTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('writeReview')}</Text>
            <StarRow rating={myRating} size={22} editable onChange={setMyRating} colors={colors} />

            <TextInput
              style={[styles.reviewInput, { borderColor: colors.border, color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('shareExperience')}
              placeholderTextColor={colors.placeholder}
              value={myComment}
              onChangeText={setMyComment}
              multiline
            />

            <View style={[styles.submitRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity style={[styles.anonRow, isRTL && { flexDirection: 'row-reverse' }]} activeOpacity={0.7} onPress={() => setPostAnonymously(!postAnonymously)}>
                <View style={[styles.checkbox, { borderColor: colors.border }, postAnonymously && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  {postAnonymously && <Ionicons name="checkmark" size={14} color={colors.white} />}
                </View>
                <Text style={[styles.anonText, { color: colors.textSecondary }]}>{t('postAnonymously')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.
              primary }]} activeOpacity={0.8} onPress={handleSubmitReview}>
                <Text style={[styles.submitText, { color: colors.white }]}>{t('submit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="reviews" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  pageTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 30, height: 52, paddingHorizontal: 18, gap: 10, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14 },
  doctorCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 14, marginBottom: 12 },
  doctorName: { fontSize: 15, fontWeight: '700' },
  doctorNameLarge: { fontSize: 17, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  ratingText: { fontSize: 12 },
  card: { borderWidth: 1, borderRadius: 20, padding: 18 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  backText: { fontSize: 13, fontWeight: '600' },
  doctorHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: 1, marginVertical: 14 },
  emptyText: { fontSize: 13, fontStyle: 'italic' },
  reviewItem: { marginBottom: 14 },
  reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewerName: { fontSize: 13, fontWeight: '700' },
  reviewDate: { fontSize: 11 },
  reviewComment: { fontSize: 13, marginTop: 6 },
  writeTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  reviewInput: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 70, fontSize: 13, marginTop: 12, textAlignVertical: 'top' },
  submitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  anonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 18, height: 18, borderWidth: 1.5, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  anonText: { fontSize: 12 },
  submitButton: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  submitText: { fontSize: 13, fontWeight: '700' },
});