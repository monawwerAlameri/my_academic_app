import { router } from 'expo-router';
import { Alert } from 'react-native';
import { Booking } from '../services/student';

export const canChat = (b: Booking) => b.type === 'Online' && b.status !== 'Cancelled' && !!b.doctorId;

export const chatStarted = (b: Booking) => Date.now() >= b.startMs;

export const openBookingChat = (b: Booking, t: (key: any) => string) => {
  if (!chatStarted(b)) {
    Alert.alert(t('chatNotStartedTitle'), t('chatNotStartedMsg'));
    return;
  }
  router.push({ pathname: '/student/chat/[id]', params: { id: b.doctorId, name: b.doctor } });
};