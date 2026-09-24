import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday';

const days: { key: DayKey; shortKey: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' }[] = [
  { key: 'sunday', shortKey: 'sun' },
  { key: 'monday', shortKey: 'mon' },
  { key: 'tuesday', shortKey: 'tue' },
  { key: 'wednesday', shortKey: 'wed' },
  { key: 'thursday', shortKey: 'thu' },
];

type Slot = { id: string; time: string; location: string; isOnline: boolean };

const initialSlots: Record<DayKey, Slot[]> = {
  sunday: [
    { id: '1', time: '9:00 - 10:00 am', location: '203-17D', isOnline: false },
    { id: '2', time: '11:00 - 11:55 am', location: '203-17D', isOnline: false },
    { id: '3', time: '3:00 - 5:00 pm', location: '', isOnline: true },
  ],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
};

export default function FacultySchedule() {
  const { colors, t, isRTL } = useAppSettings();
  const [selectedDay, setSelectedDay] = useState<DayKey>('sunday');
  const [availableDays, setAvailableDays] = useState<Record<DayKey, boolean>>({
    sunday: true, monday: false, tuesday: false, wednesday: false, thursday: false,
  });
  const [allSlots, setAllSlots] = useState<Record<DayKey, Slot[]>>(initialSlots);

  // Add-slot modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newIsOnline, setNewIsOnline] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [addError, setAddError] = useState('');

  // Close-day modal state
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [closeReason, setCloseReason] = useState('');

  const slots = allSlots[selectedDay];

  const handleToggleDay = (value: boolean) => {
    if (!value && slots.length > 0) {
      // Turning off a day that has bookings -> ask for confirmation first
      setCloseModalVisible(true);
      return;
    }
    setAvailableDays((prev) => ({ ...prev, [selectedDay]: value }));
  };

  const confirmCloseDay = () => {
    setAvailableDays((prev) => ({ ...prev, [selectedDay]: false }));
    // Frontend-only for now: bookings would be cancelled + students notified via backend later
    setCloseModalVisible(false);
    setCloseReason('');
  };

  const openAddModal = () => {
    setNewStart('');
    setNewEnd('');
    setNewIsOnline(false);
    setNewLocation('');
    setAddError('');
    setAddModalVisible(true);
  };

  const handleSaveSlot = () => {
    if (!newStart.trim() || !newEnd.trim()) {
      setAddError(t('fillRequiredFields'));
      return;
    }
    const newSlot: Slot = {
      id: Date.now().toString(),
      time: `${newStart.trim()} - ${newEnd.trim()}`,
      location: newIsOnline ? '' : newLocation.trim(),
      isOnline: newIsOnline,
    };
    setAllSlots((prev) => ({ ...prev, [selectedDay]: [...prev[selectedDay], newSlot] }));
    setAvailableDays((prev) => ({ ...prev, [selectedDay]: true }));
    setAddModalVisible(false);
  };

  const handleDeleteSlot = (id: string) => {
    setAllSlots((prev) => ({ ...prev, [selectedDay]: prev[selectedDay].filter((s) => s.id !== id) }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('scheduleTitle')}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daysScroll}
          contentContainerStyle={[styles.daysRow, isRTL && { flexDirection: 'row-reverse' }]}
        >
          {days.map((day) => {
            const active = selectedDay === day.key;
            return (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayChip,
                  { borderColor: colors.border },
                  active && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setSelectedDay(day.key)}
              >
                <Text style={[styles.dayChipText, { color: active ? colors.white : colors.textSecondary }]}>
                  {t(day.shortKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.availableRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={[styles.availableText, { color: colors.primary }]}>
            {t('availableOn')} {t(selectedDay)}
          </Text>
          <Switch
            value={availableDays[selectedDay]}
            onValueChange={handleToggleDay}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {slots.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('noSlotsYet')}
          </Text>
        )}

        {slots.map((slot) => (
          <View
            key={slot.id}
            style={[styles.slotRow, { borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.slotTime, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                {slot.time}
              </Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: slot.isOnline ? colors.successLight : colors.pillBackground },
                  isRTL ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' },
                ]}
              >
                <Text style={[styles.badgeText, { color: slot.isOnline ? colors.success : colors.primary }]}>
                  {slot.isOnline ? t('online') : `${t('office')} ${slot.location}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteSlot(slot.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={[styles.addButton, { borderColor: colors.border }]} onPress={openAddModal}>
          <Ionicons name="add" size={18} color={colors.textSecondary} />
          <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>{t('addTimeSlot')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add time slot modal */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>{t('addTimeSlotTitle')}</Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('startTime')}</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.primary }]}
              placeholder={t('timePlaceholder')}
              placeholderTextColor={colors.placeholder}
              value={newStart}
              onChangeText={setNewStart}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('endTime')}</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.primary }]}
              placeholder={t('timePlaceholder')}
              placeholderTextColor={colors.placeholder}
              value={newEnd}
              onChangeText={setNewEnd}
            />

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeButton, { borderColor: colors.border }, !newIsOnline && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setNewIsOnline(false)}
              >
                <Text style={{ color: !newIsOnline ? colors.white : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                  {t('office')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, { borderColor: colors.border }, newIsOnline && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setNewIsOnline(true)}
              >
                <Text style={{ color: newIsOnline ? colors.white : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                  {t('online')}
                </Text>
              </TouchableOpacity>
            </View>

            {!newIsOnline && (
              <>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('location')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.primary }]}
                  placeholder={t('locationPlaceholder')}
                  placeholderTextColor={colors.placeholder}
                  value={newLocation}
                  onChangeText={setNewLocation}
                />
              </>
            )}

            {!!addError && <Text style={{ color: colors.danger, fontSize: 12, marginBottom: 8 }}>{addError}</Text>}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalButton, { borderColor: colors.border }]} onPress={() => setAddModalVisible(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={handleSaveSlot}>
                <Text style={{ color: colors.white, fontWeight: '600' }}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Close day confirmation modal */}
      <Modal visible={closeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>{t('closeDayTitle')}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 14 }}>{t('closeDayWarning')}</Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('reasonOptional')}</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.primary }]}
              placeholder={t('reasonPlaceholder')}
              placeholderTextColor={colors.placeholder}
              value={closeReason}
              onChangeText={setCloseReason}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalButton, { borderColor: colors.border }]} onPress={() => setCloseModalVisible(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.danger, borderColor: colors.danger }]} onPress={confirmCloseDay}>
                <Text style={{ color: colors.white, fontWeight: '600' }}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FacultyTabBar activeTab="schedule" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 18 },
  daysScroll: { marginBottom: 18 },
  daysRow: { flexDirection: 'row', gap: 8 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  dayChipText: { fontSize: 13, fontWeight: '600' },
  availableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  availableText: { fontSize: 15, fontWeight: '600' },
  emptyText: { fontSize: 13, marginBottom: 16 },
  slotRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, gap: 8 },
  slotTime: { fontSize: 14, fontWeight: '600' },
  badge: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  iconButton: { padding: 4 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 12, marginTop: 4 },
  addButtonText: { fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 4 },
  typeButton: { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  modalButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
});