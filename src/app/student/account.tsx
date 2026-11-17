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
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { errorKey } from '../../services/errors';
import { Profile, changePassword, getProfile, updatePhone } from '../../services/student';
import { commonStyles } from '../../theme/styles';

export default function AccountScreen() {
const { colors, t, isRTL } = useAppSettings();
const [fullName, setFullName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // تحميل البيانات من الباك
  const { data: profile } = useFetch<Profile | null>(getProfile, null);

useEffect(() => {
  if (profile) {
    setFullName(profile.fullName);
    setEmail(profile.email);
    setPhone(profile.phone);
  }
}, [profile]);

const handleSave = async () => {
  const newPhone = phone.trim();
  const phoneChanged = !!profile && newPhone !== String(profile.phone ?? '');
  const changingPassword = [currentPassword, newPassword, confirmPassword].some((v) => v !== '');
  if (!phoneChanged && !changingPassword) {
    router.back();
    return;
  }
  if (phoneChanged && !/^05\d{8}$/.test(newPhone)) {
    Alert.alert(t('error'), t('err_INVALID_PHONE_FORMAT'));
    return;
  }
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
  try {
    if (phoneChanged) await updatePhone(newPhone);
    if (changingPassword) {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    Alert.alert(changingPassword ? t('passwordChanged') : t('profileSaved'));
  } catch (e) {
    Alert.alert(t('error'), t(errorKey(e) as any));
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

        <Field label={t('fullName')} value={fullName} onChangeText={setFullName} editable={false} colors={colors} isRTL={isRTL} />
        <Field label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" editable={false} colors={colors} isRTL={isRTL} />
        <Field label={t('phoneNumber')} value={phone} onChangeText={(v: string) => setPhone(v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" colors={colors} isRTL={isRTL} />

        <Text style={[commonStyles.sectionTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('changePassword')}
        </Text>

        <Field label={t('currentPassword')} value={currentPassword} onChangeText={setCurrentPassword} secure colors={colors} isRTL={isRTL} />
        <Field label={t('newPassword')} value={newPassword} onChangeText={setNewPassword} secure colors={colors} isRTL={isRTL} />
        <Field label={t('confirmPassword')} value={confirmPassword} onChangeText={setConfirmPassword} secure colors={colors} isRTL={isRTL} />

        <TouchableOpacity style={[commonStyles.saveButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={handleSave}>
          <Text style={[commonStyles.saveButtonText, { color: colors.white }]}>{t('saveChanges')}</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="settings" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, keyboardType, secure, editable, colors, isRTL }: any) {
  const [show, setShow] = useState(false);
  return (
    <View style={commonStyles.field}>
      <Text style={[commonStyles.fieldLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          style={[commonStyles.fieldInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.primary, textAlign: isRTL ? 'right' : 'left' }, editable === false && { opacity: 0.6 }, secure && (isRTL ? { paddingLeft: 44 } : { paddingRight: 44 })]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secure && !show}
          editable={editable}
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
