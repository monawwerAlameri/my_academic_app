import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { FacultyProfile, changeFacultyPassword, getFacultyProfile, updateFacultyProfile } from '../../services/doctor';
import { errorKey } from '../../services/errors';
import { commonStyles } from '../../theme/styles';

export default function FacultyAccountScreen() {
const { colors, t, isRTL } = useAppSettings();
const [fullName, setFullName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [office, setOffice] = useState('');
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [saving, setSaving] = useState(false);

const { data: profile } = useFetch<FacultyProfile | null>(getFacultyProfile, null);

useEffect(() => {
  if (profile) {
    setFullName(profile.fullName);
    setEmail(profile.email);
    setPhone(profile.phone);
    setOffice(profile.office);
  }
}, [profile]);

const handleSave = async () => {
  if (!profile || saving) return;
  if (!fullName.trim() || !email.trim() || !phone.trim() || !office.trim()) {
    Alert.alert(t('error'), t('err_ALL_FIELDS_REQUIRED'));
    return;
  }
  const changingPassword = !!(currentPassword || newPassword || confirmPassword);
  if (changingPassword) {
    if (!currentPassword || !newPassword) {
      Alert.alert(t('error'), t('err_ALL_FIELDS_REQUIRED'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordMismatch'));
      return;
    }
  }
  setSaving(true);
  try {
    await updateFacultyProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      office: office.trim(),
    });
    if (changingPassword) {
      await changeFacultyPassword({ currentPassword, newPassword });
    }
    Alert.alert(changingPassword ? t('passwordChanged') : t('profileSaved'));
    router.back();
  } catch (e) {
    Alert.alert(t('error'), t(errorKey(e) as any));
  } finally {
    setSaving(false);
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('editProfile')}</Text>
        </View>

        <View style={commonStyles.avatarWrapper}>
          <View style={[commonStyles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={40} color={colors.white} />
          </View>
          
        </View>

        <Text style={[commonStyles.sectionTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('personalInfo')}
        </Text>

        <Field label={t('fullName')} value={fullName} onChangeText={setFullName} colors={colors} isRTL={isRTL} />
        <Field label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" colors={colors} isRTL={isRTL} />
        <Field label={t('phoneNumber')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" colors={colors} isRTL={isRTL} />
        <Field label={t('location')} value={office} onChangeText={setOffice} colors={colors} isRTL={isRTL} />

        <Text style={[commonStyles.sectionTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('changePassword')}
        </Text>

        <Field label={t('currentPassword')} value={currentPassword} onChangeText={setCurrentPassword} secure colors={colors} isRTL={isRTL} />
        <Field label={t('newPassword')} value={newPassword} onChangeText={setNewPassword} secure colors={colors} isRTL={isRTL} />
        <Field label={t('confirmPassword')} value={confirmPassword} onChangeText={setConfirmPassword} secure colors={colors} isRTL={isRTL} />

        <TouchableOpacity style={[commonStyles.saveButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={handleSave} disabled={saving}>
          <Text style={[commonStyles.saveButtonText, { color: colors.white }]}>{t('saveChanges')}</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      <FacultyTabBar activeTab="settings" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, keyboardType, secure, colors, isRTL }: any) {
  const [show, setShow] = useState(false);
  return (
    <View style={commonStyles.field}>
      <Text style={[commonStyles.fieldLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          style={[commonStyles.fieldInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.primary, textAlign: isRTL ? 'right' : 'left' }, secure && (isRTL ? { paddingLeft: 44 } : { paddingRight: 44 })]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secure && !show}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)} activeOpacity={0.7} style={[{ position: 'absolute', padding: 4 }, isRTL ? { left: 10 } : { right: 10 }]}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}




