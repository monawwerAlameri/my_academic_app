import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';// لتنقل بين الصفحات
import { useState } from 'react'; // يجيب الحالة اللي هي اي قسم فاتح
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // يجيب المكونات الاساسية 
import { BottomTabBar } from '../../components/BottomTabBar'; // يجيب الشريط السفلي من مجلد المكونات المشتركه بين الملفات
import { useAppSettings } from '../../context/AppSettingsContext'; // الاعدادات عامة 
import { commonStyles } from '../../theme/styles'; // التنسيقات المشتركة

type SectionKey = 'inPerson' | 'online'; // تعريف نوعين من القيم

export default function BookingTypeScreen() {
  const { colors, t, isRTL } = useAppSettings(); // يعرف متغير ويخزن فيه قيمه نحتاجها بعدين 
  const [expanded, setExpanded] = useState<SectionKey | null>('inPerson'); // تفتح هي بشكل تلقائي 

  const SUB_OPTIONS = [t('optQuestions'), t('optProjectDiscussion'), t('optOther')];

  const goToSchedule = (type: string, subtype: string) => { // اختصار براميتر 
    router.push({ pathname: '/student/booking-schedule', params: { type, subtype } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('typeOfAppointment')}</Text>
        </View>

        <TypeSection
          icon="person"
          title={t('inPersonAppointment')}
          isExpanded={expanded === 'inPerson'} // تتحكم اذا فاتح الاختيار او لا
          onToggle={() => setExpanded(expanded === 'inPerson' ? null : 'inPerson')}
          onSelect={(subtype: string) => goToSchedule('In-Person', subtype)}
          options={SUB_OPTIONS}
          colors={colors}
          isRTL={isRTL}
        />

        <TypeSection
          icon="phone-portrait-outline"
          title={t('onlineAppointment')}
          isExpanded={expanded === 'online'}
          onToggle={() => setExpanded(expanded === 'online' ? null : 'online')}
          onSelect={(subtype: string) => goToSchedule('Online', subtype)}
          options={SUB_OPTIONS}
          colors={colors}
          isRTL={isRTL}
        />

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="my-booking" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

function TypeSection({ icon, title, isExpanded, onToggle, onSelect, options, colors, isRTL }: any) {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={[styles.sectionHeader, { backgroundColor: colors.white }, isRTL && { flexDirection: 'row-reverse' }]}
        activeOpacity={0.8}
        onPress={onToggle}
      >
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[commonStyles.name, { color: colors.primary }]}>{title}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'} // يوضح حالة القسم اذا فاتح او مقفل 
          size={18}
          color={colors.primary}
          style={isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.optionsWrapper, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
          {options.map((option: string) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionPill, { backgroundColor: colors.pillBackground }]}
              activeOpacity={0.7}
              onPress={() => onSelect(option)}
            >
              <Text style={[commonStyles.chipText, { color: colors.primary }]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 26 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 30, paddingVertical: 16, paddingHorizontal: 20 },
  optionsWrapper: { marginTop: 14, gap: 12, paddingRight: 8 },
  optionPill: { borderRadius: 20, paddingVertical: 12, paddingHorizontal: 24, minWidth: '65%', alignItems: 'center' },
});