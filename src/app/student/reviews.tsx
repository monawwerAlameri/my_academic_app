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
import { commonStyles } from '../../theme/styles';

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

  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  const filteredDoctors = DOCTORS.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmitReview = () => {
    if (myRating === 0 || myComment.trim() === '') return;
    setMyRating(0);
    setMyComment('');
    setPostAnonymously(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={[commonStyles.headerTitle, align, { color: colors.primary, marginBottom: 16 }]}>{t('reviewsTitle')}</Text>

        <View style={[commonStyles.searchBox, { backgroundColor: colors.white, borderColor: colors.border }, reverse]}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            style={[commonStyles.searchInput, align, { color: colors.primary }]}
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
              style={[commonStyles.card, { alignItems: 'center', backgroundColor: colors.cardBackground, borderColor: colors.border }, reverse]}
              activeOpacity={0.7}
              onPress={() => setSelectedDoctor(doctor)}
            >
              <Ionicons name="person-circle-outline" size={30} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.name, align, { color: colors.primary }]}>{doctor.name}</Text>
                <View style={[styles.row, reverse]}>
                  <StarRow rating={Math.round(doctor.avgRating)} colors={colors} />
                  <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                    {doctor.avgRating} · {doctor.reviewsCount} {t('reviewsCountLabel')}
                  </Text>
                </View>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.placeholder} />
            </TouchableOpacity>
          ))}

        {selectedDoctor && (
          <View style={[commonStyles.panel, { padding: 18, borderColor: colors.border }]}>
            <TouchableOpacity style={[commonStyles.headerRow, reverse]} activeOpacity={0.7} onPress={() => setSelectedDoctor(null)}>
              <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={18} color={colors.primary} />
              <Text style={[commonStyles.chipText, { color: colors.primary }]}>{t('backToSearch')}</Text>
            </TouchableOpacity>

            <View style={[commonStyles.headerRow, reverse]}>
              <Ionicons name="person-circle-outline" size={44} color={colors.primary} />
              <View>
                <Text style={[commonStyles.name, { color: colors.primary }]}>{selectedDoctor.name}</Text>
                <View style={[styles.row, reverse]}>
                  <StarRow rating={Math.round(selectedDoctor.avgRating)} colors={colors} />
                  <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                    {selectedDoctor.avgRating} ({selectedDoctor.reviewsCount})
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {selectedDoctor.reviews.length === 0 ? (
              <Text style={[commonStyles.empty, { color: colors.textSecondary }]}>{t('noReviewsYet')}</Text>
            ) : (
              selectedDoctor.reviews.map((review) => (
                <View key={review.id} style={{ marginBottom: 14 }}>
                  <View style={[styles.row, { justifyContent: 'space-between' }, reverse]}>
                    <Text style={[commonStyles.name, { color: colors.primary }]}>{review.name}</Text>
                    <Text style={[styles.smallText, { color: colors.textSecondary }]}>{review.date}</Text>
                  </View>
                  <StarRow rating={review.rating} size={12} colors={colors} />
                  <Text style={[styles.smallText, align, { color: colors.textSecondary, marginTop: 6 }]}>{review.comment}</Text>
                </View>
              ))
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[commonStyles.name, align, { color: colors.primary, marginBottom: 10 }]}>{t('writeReview')}</Text>
            <StarRow rating={myRating} size={22} editable onChange={setMyRating} colors={colors} />

            <TextInput
              style={[styles.reviewInput, align, { borderColor: colors.border, color: colors.primary }]}
              placeholder={t('shareExperience')}
              placeholderTextColor={colors.placeholder}
              value={myComment}
              onChangeText={setMyComment}
              multiline
            />

            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 14 }, reverse]}>
              <TouchableOpacity style={[styles.row, reverse]} activeOpacity={0.7} onPress={() => setPostAnonymously(!postAnonymously)}>
                <Ionicons name={postAnonymously ? 'checkbox' : 'square-outline'} size={22} color={colors.primary} />
                <Text style={[styles.smallText, { color: colors.textSecondary }]}>{t('postAnonymously')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.chip, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={handleSubmitReview}
              >
                <Text style={[commonStyles.chipText, { color: colors.white }]}>{t('submit')}</Text>
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
  smallText: { fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  divider: { height: 1, marginVertical: 14 },
  reviewInput: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 70, marginTop: 12, textAlignVertical: 'top' },
});