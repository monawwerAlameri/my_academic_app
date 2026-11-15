import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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
import { DataState } from '../../components/DataState';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { DayKey, ScheduleSlot, addSlot, cancelAllOnDate, deleteSlot, getClosedDates, getSchedule, toApiTime } from '../../services/doctor';
import { errorKey } from '../../services/errors';
import { commonStyles } from '../../theme/styles';




const days: { key: DayKey; shortKey: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' }[] = [
  { key: 'sunday', shortKey: 'sun' },
  { key: 'monday', shortKey: 'mon' },
  { key: 'tuesday', shortKey: 'tue' },
  { key: 'wednesday', shortKey: 'wed' },
  { key: 'thursday', shortKey: 'thu' },
];




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


const nextDateOf = (day: DayKey) => {
  const index = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4 }[day];
  const d = new Date();
  d.setDate(d.getDate() + ((index - d.getDay() + 7) % 7));
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export default function FacultySchedule() {
  const { colors, t, isRTL } = useAppSettings();
  const [selectedDay, setSelectedDay] = useState<DayKey>('sunday');
const [closedDays, setClosedDays] = useState<Record<DayKey, boolean>>({
  sunday: false, monday: false, tuesday: false, wednesday: false, thursday: false,
});
const [busy, setBusy] = useState(false);
const { data: allSlots, loading, error, reload } = useFetch<ScheduleSlot[]>(getSchedule, []);
// الأيام المغلقة من السيرفر (حتى لا تضيع بعد إعادة التحميل)
  const loadClosed = async () => {
    try {
      const dates = await getClosedDates();
      const next: Record<DayKey, boolean> = {
        sunday: false, monday: false, tuesday: false, wednesday: false, thursday: false,
      };
      days.forEach((d) => { next[d.key] = dates.includes(nextDateOf(d.key)); });
      setClosedDays(next);
    } catch {}
  };

  useEffect(() => { loadClosed(); }, []);

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

const slots = allSlots.filter((s) => s.day === selectedDay);
  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  const chipStyle = (active: boolean) => [
    commonStyles.chip,
    { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : 'transparent' },
  ];
  const chipTextStyle = (active: boolean) => [commonStyles.chipText, { color: active ? colors.white : colors.textSecondary }];

const handleToggleDay = (value: boolean) => {
  if (!value && slots.length > 0) {
    setCloseModalVisible(true);
    return;
  }
  setClosedDays((prev) => ({ ...prev, [selectedDay]: !value }));
};

 
const confirmCloseDay = async () => {
  if (busy) return;
  setBusy(true);
  try {
    await cancelAllOnDate(nextDateOf(selectedDay), closeReason.trim() || undefined);
    setClosedDays((prev) => ({ ...prev, [selectedDay]: true }));
    setCloseModalVisible(false);
    setCloseReason('');
  } catch (e) {
    Alert.alert(t('error'), t(errorKey(e) as any));
  } finally {
    setBusy(false);
  }
};

  const openAddModal = () => {
    setNewStart('');
    setNewEnd('');
    setNewIsOnline(false);
    setNewLocation('');
    setAddError('');
    setAddModalVisible(true);
  };

  
      const handleSaveSlot = async () => {
  if (busy) return;
  if (!newStart.trim() || !newEnd.trim()) {
    setAddError(t('fillRequiredFields'));
    return;
  }
  const start = toApiTime(newStart);
  const end = toApiTime(newEnd);
  if (!start || !end || end <= start) {
    setAddError(t('invalidTime'));
    return;
  }
  if (!newIsOnline && !newLocation.trim()) {
    setAddError(t('fillLocation'));
    return;
  }
  setBusy(true);
  try {
    await addSlot({ day: selectedDay, start, end, isOnline: newIsOnline, location: newLocation.trim() });
    setClosedDays((prev) => ({ ...prev, [selectedDay]: false }));
    setAddModalVisible(false);
    reload();
  } catch (e) {
    setAddError(t(errorKey(e) as any));
  } finally {
    setBusy(false);
  }
};

 const handleDeleteSlot = async (id: string) => {
  try {
    await deleteSlot(id);
    reload();
  } catch (e) {
    Alert.alert(t('error'), t(errorKey(e) as any));
  }
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
            value={slots.length > 0 && !closedDays[selectedDay]}
            onValueChange={handleToggleDay}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

      <DataState
  loading={loading}
  error={error}
  empty={slots.length === 0}
  emptyText={t('noSlotsYet')}
  onRetry={reload}
>
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

</DataState>

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