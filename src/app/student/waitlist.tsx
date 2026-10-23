import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

interface WaitingItem {
  id: string;
  doctor: string;
  office: string;
  day: string;
  time: string;
  aheadOfYou: number;
}

const INITIAL_WAITING_LIST: WaitingItem[] = [
  { id: '1', doctor: 'Dr.Laila', office: 'Office', day: 'Monday', time: '10:00-10:55 Am', aheadOfYou: 1 },
  { id: '2', doctor: 'Dr.Salma', office: 'Office', day: 'Wednesday', time: '10:00-10:55 Am', aheadOfYou: 4 },
  { id: '3', doctor: 'Dr.Najla', office: 'Office', day: 'Monday', time: '10:00-10:55 Am', aheadOfYou: 10 },
];

const MAX_QUEUE = 10;

export default function WaitingListScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [waitingList, setWaitingList] = useState<WaitingItem[]>(INITIAL_WAITING_LIST);

  const removeItem = (id: string) => {
    Alert.alert(
      'Leave Waiting List',
      'Are you sure you want to remove yourself from the waiting list?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Remove',
          style: 'destructive',
          onPress: () => setWaitingList((prev) => prev.filter((item) => item.id !== id)),
        },
      ]
    );
  };

  const getProgressColor = (aheadOfYou: number) => {
    if (aheadOfYou <= 2) return colors.success;
    if (aheadOfYou <= 6) return colors.warning;
    return colors.danger;
  };

  const getProgressPercent = (aheadOfYou: number) => {
    const percent = 1 - (aheadOfYou - 1) / MAX_QUEUE;
    return Math.max(0.08, Math.min(1, percent)) * 100;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('waitlist')}</Text>
        </View>

        <View style={[commonStyles.panel, { borderColor: colors.border }]}>
          {waitingList.length === 0 ? (
            <Text style={[commonStyles.empty, { color: colors.textSecondary }]}>{t('noWaitingAppointments')}</Text>
          ) : (
            waitingList.map((item, index) => {
              const progressColor = getProgressColor(item.aheadOfYou);
              return (
                <View
                  key={item.id}
                  style={[
                    commonStyles.menuRow,
                    index < waitingList.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    isRTL && { flexDirection: 'row-reverse' },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[commonStyles.name, { color: colors.primary }]}>{item.doctor}</Text>
                    <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                      {item.office} · {item.day} · {item.time}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={[styles.track, { backgroundColor: colors.border }]}>
                      <View style={{ height: 6, width: `${getProgressPercent(item.aheadOfYou)}%` as any, backgroundColor: progressColor }} />
                    </View>
                    <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                      {t('aheadOfYou')}: <Text style={{ color: progressColor, fontWeight: '700' }}>{item.aheadOfYou}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity activeOpacity={0.7} onPress={() => removeItem(item.id)}>
                    <Ionicons name="close" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="waitlist" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 12 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
});