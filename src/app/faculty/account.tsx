import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

export default function FacultyAccountScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [fullName, setFullName] = useState('Dr. Sara');
  const [email, setEmail] = useState('Sara.ahmed@university.edu');
  const [phone, setPhone] = useState('0557863246');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => router.back();

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

        <Field label={t('fullName')} value={fullName} onChangeText={setFullName} colors={colors} isRTL={isRTL} />
        <Field label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" colors={colors} isRTL={isRTL} />
        <Field label={t('phoneNumber')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" colors={colors} isRTL={isRTL} />

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

      <FacultyTabBar activeTab="settings" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, keyboardType, secure, colors, isRTL }: any) {
  return (
    <View style={commonStyles.field}>
      <Text style={[commonStyles.fieldLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      <TextInput
        style={[commonStyles.fieldInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secure}
      />
    </View>
  );
}