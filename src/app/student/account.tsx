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
import { Profile, changePassword, getProfile } from '../../services/student';
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
  if (!currentPassword && !newPassword && !confirmPassword) {
    router.back();
    return;
  }
  if (!currentPassword || !newPassword) {
    Alert.alert(t('error'), t('err_ALL_FIELDS_REQUIRED'));
    return;
  }
  if (newPassword !== confirmPassword) {
    Alert.alert(t('error'), t('passwordMismatch'));
    return;
  }
  try {
    await changePassword({ currentPassword, newPassword });
    Alert.alert(t('passwordChanged'));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
          <TouchableOpacity style={[commonStyles.changePhotoButton, { borderColor: colors.border }]} activeOpacity={0.7}>
            <Text style={[commonStyles.changePhotoText, { color: colors.primary }]}>{t('changePhoto')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[commonStyles.sectionTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('personalInfo')}
        </Text>

        <Field label={t('fullName')} value={fullName} onChangeText={setFullName} editable={false} colors={colors} isRTL={isRTL} />
        <Field label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" editable={false} colors={colors} isRTL={isRTL} />
        <Field label={t('phoneNumber')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={false} colors={colors} isRTL={isRTL} />

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
  return (
    <View style={commonStyles.field}>
      <Text style={[commonStyles.fieldLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      <TextInput
        style={[commonStyles.fieldInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.primary, textAlign: isRTL ? 'right' : 'left' } ,editable === false && { opacity: 0.6 }]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        editable={editable}
      />
    </View>
  );
}