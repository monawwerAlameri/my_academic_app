import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

export default function AccountScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [fullName, setFullName] = useState('Nora Alshammari');
  const [email, setEmail] = useState('nora@uoh.edu.sa');
  const [phone, setPhone] = useState('0557863246');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => router.back();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('editProfile')}</Text>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={40} color={colors.white} />
          </View>
          <TouchableOpacity style={[styles.changePhotoButton, { borderColor: colors.border }]} activeOpacity={0.7}>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>{t('changePhoto')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('personalInfo')}
        </Text>

        <Field label={t('fullName')} value={fullName} onChangeText={setFullName} colors={colors} isRTL={isRTL} />
        <Field label={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" colors={colors} isRTL={isRTL} />
        <Field label={t('phoneNumber')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" colors={colors} isRTL={isRTL} />

        <Text style={[styles.sectionTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('changePassword')}
        </Text>

        <Field label={t('currentPassword')} value={currentPassword} onChangeText={setCurrentPassword} secure colors={colors} isRTL={isRTL} />
        <Field label={t('newPassword')} value={newPassword} onChangeText={setNewPassword} secure colors={colors} isRTL={isRTL} />
        <Field label={t('confirmPassword')} value={confirmPassword} onChangeText={setConfirmPassword} secure colors={colors} isRTL={isRTL} />

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: colors.white }]}>{t('saveChanges')}</Text>
        </TouchableOpacity>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="settings" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, keyboardType, secure, colors, isRTL }: any) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secure}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  changePhotoButton: { borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16 },
  changePhotoText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, marginTop: 10 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderRadius: 12, height: 48, paddingHorizontal: 14, fontSize: 14 },
  saveButton: { height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  saveButtonText: { fontSize: 15, fontWeight: '700' },
});