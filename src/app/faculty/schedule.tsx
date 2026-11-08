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
import { commonStyles } from '../../theme/styles';

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

function ModalField({ label, value, onChangeText, placeholder, colors }: any) {
  return (
    <View style={commonStyles.field}>
      <Text style={[commonStyles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[commonStyles.fieldInput, { borderColor: colors.border, color: colors.primary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function ModalButtons({ onCancel, onConfirm, confirmLabel, confirmColor, cancelLabel, colors }: any) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
      <TouchableOpacity style={[commonStyles.chip, { flex: 1, alignItems: 'center', borderColor: colors.border }]} onPress={onCancel}>
        <Text style={[commonStyles.chipText, { color: colors.textSecondary }]}>{cancelLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[commonStyles.chip, { flex: 1, alignItems: 'center', backgroundColor: confirmColor, borderColor: confirmColor }]}
        onPress={onConfirm}
      >
        <Text style={[commonStyles.chipText, { color: colors.white }]}>{confirmLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

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
  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  const chipStyle = (active: boolean) => [
    commonStyles.chip,
    { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : 'transparent' },
  ];
  const chipTextStyle = (active: boolean) => [commonStyles.chipText, { color: active ? colors.white : colors.textSecondary }];

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
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[commonStyles.headerTitle, align, { color: colors.primary, marginBottom: 16 }]}>{t('scheduleTitle')}</Text>

        <View style={[commonStyles.chipsRow, reverse]}>
          {days.map((day) => (
            <TouchableOpacity key={day.key} style={chipStyle(selectedDay === day.key)} onPress={() => setSelectedDay(day.key)}>
              <Text style={chipTextStyle(selectedDay === day.key)}>{t(day.shortKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[commonStyles.headerRow, { justifyContent: 'space-between' }, reverse]}>
          <Text style={[commonStyles.name, { color: colors.primary }]}>
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
          <Text style={[commonStyles.paragraph, align, { color: colors.textSecondary }]}>{t('noSlotsYet')}</Text>
        )}

        {slots.map((slot) => (
          <View key={slot.id} style={[commonStyles.card, { alignItems: 'center', borderColor: colors.border }, reverse]}>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.name, align, { color: colors.primary }]}>{slot.time}</Text>
              <Text style={[styles.smallText, align, { color: slot.isOnline ? colors.success : colors.textSecondary }]}>
                {slot.isOnline ? t('online') : `${t('office')} ${slot.location}`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteSlot(slot.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={[commonStyles.card, { borderColor: colors.border, borderStyle: 'dashed', justifyContent: 'center' }]}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={18} color={colors.textSecondary} />
          <Text style={[commonStyles.chipText, { color: colors.textSecondary }]}>{t('addTimeSlot')}</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Add time slot modal */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[commonStyles.panel, { width: '100%', padding: 20, backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[commonStyles.name, { color: colors.primary, marginBottom: 14 }]}>{t('addTimeSlotTitle')}</Text>

            <ModalField label={t('startTime')} value={newStart} onChangeText={setNewStart} placeholder={t('timePlaceholder')} colors={colors} />
            <ModalField label={t('endTime')} value={newEnd} onChangeText={setNewEnd} placeholder={t('timePlaceholder')} colors={colors} />

            <View style={commonStyles.chipsRow}>
              <TouchableOpacity style={[chipStyle(!newIsOnline), { flex: 1, alignItems: 'center' }]} onPress={() => setNewIsOnline(false)}>
                <Text style={chipTextStyle(!newIsOnline)}>{t('office')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[chipStyle(newIsOnline), { flex: 1, alignItems: 'center' }]} onPress={() => setNewIsOnline(true)}>
                <Text style={chipTextStyle(newIsOnline)}>{t('online')}</Text>
              </TouchableOpacity>
            </View>

            {!newIsOnline && (
              <ModalField label={t('location')} value={newLocation} onChangeText={setNewLocation} placeholder={t('locationPlaceholder')} colors={colors} />
            )}

            {!!addError && <Text style={[styles.smallText, { color: colors.danger, marginBottom: 8 }]}>{addError}</Text>}

            <ModalButtons
              onCancel={() => setAddModalVisible(false)}
              onConfirm={handleSaveSlot}
              cancelLabel={t('cancel')}
              confirmLabel={t('save')}
              confirmColor={colors.primary}
              colors={colors}
            />
          </View>
        </View>
      </Modal>

      {/* Close day confirmation modal */}
      <Modal visible={closeModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[commonStyles.panel, { width: '100%', padding: 20, backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[commonStyles.name, { color: colors.primary, marginBottom: 8 }]}>{t('closeDayTitle')}</Text>
            <Text style={[commonStyles.paragraph, { color: colors.textSecondary, marginBottom: 14 }]}>{t('closeDayWarning')}</Text>

            <ModalField label={t('reasonOptional')} value={closeReason} onChangeText={setCloseReason} placeholder={t('reasonPlaceholder')} colors={colors} />

            <ModalButtons
              onCancel={() => setCloseModalVisible(false)}
              onConfirm={confirmCloseDay}
              cancelLabel={t('cancel')}
              confirmLabel={t('confirm')}
              confirmColor={colors.danger}
              colors={colors}
            />
          </View>
        </View>
      </Modal>

      <FacultyTabBar activeTab="schedule" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
});