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
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

export default function RegisterScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  const fields: any[] = [
    { label: t('fullName'), icon: 'person-outline', placeholder: t('enterFullName'), value: fullName, onChange: setFullName },
    { label: t('phoneNumber'), icon: 'call-outline', placeholder: t('enterPhone'), value: phone, onChange: setPhone, keyboardType: 'phone-pad' },
    { label: t('email'), icon: 'mail-outline', placeholder: t('enterEmail'), value: email, onChange: setEmail, keyboardType: 'email-address', autoCapitalize: 'none' },
    { label: t('password'), icon: 'lock-closed-outline', placeholder: t('createPassword'), value: password, onChange: setPassword, secure: !showPassword, toggle: () => setShowPassword(!showPassword) },
    { label: t('confirmPassword'), icon: 'lock-closed-outline', placeholder: t('confirmYourPassword'), value: confirmPassword, onChange: setConfirmPassword, secure: !showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword) },
    { label: t('verificationCode'), icon: 'shield-checkmark-outline', placeholder: t('enterVerificationCode'), value: code, onChange: setCode, keyboardType: 'number-pad', action: t('sendCode') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[commonStyles.logoContainer, { alignSelf: 'center' }]}>
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.primary, top: 0 }]} />
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.accent, top: 32 }]} />
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.placeholder, top: 64 }]} />
        </View>

        <Text style={[commonStyles.headerTitle, { color: colors.primary, textAlign: 'center' }]}>Academic{'\n'}Booking</Text>
        <Text style={[commonStyles.headerTitle, { color: colors.accent, textAlign: 'center', marginTop: 16 }]}>{t('createAccount')}</Text>
        <Text style={[commonStyles.headerSubtitle, { color: colors.primary, textAlign: 'center' }]}>{t('joinUs')}</Text>

        {fields.map((f) => (
          <View key={f.label}>
            <Text style={[commonStyles.name, align, { color: colors.primary, marginBottom: 6 }]}>{f.label}</Text>
            <View style={[commonStyles.searchBox, { borderColor: colors.border, backgroundColor: colors.background }, reverse]}>
              <Ionicons name={f.icon} size={22} color={colors.primary} />
              <TextInput
                style={[commonStyles.searchInput, align, { color: colors.primary }]}
                placeholder={f.placeholder}
                placeholderTextColor={colors.placeholder}
                value={f.value}
                onChangeText={f.onChange}
                keyboardType={f.keyboardType}
                autoCapitalize={f.autoCapitalize}
                secureTextEntry={f.secure}
              />
              {f.toggle && (
                <TouchableOpacity onPress={f.toggle}>
                  <Ionicons name={f.secure ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.primary} />
                </TouchableOpacity>
              )}
              {f.action && (
                <TouchableOpacity>
                  <Text style={[commonStyles.chipText, { color: colors.accent }]}>{f.action}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.termsRow, reverse]} activeOpacity={0.7} onPress={() => setAgreed(!agreed)}>
          <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={24} color={colors.primary} />
          <Text style={[commonStyles.paragraph, align, { flex: 1, color: colors.primary }]}>
            {t('agreeToTerms')}{' '}
            <Text style={{ color: colors.accent, fontWeight: '600' }}>{t('termsOfService')}</Text>
            {' '}{t('andWord')}{' '}
            <Text style={{ color: colors.accent, fontWeight: '600' }}>{t('privacyPolicy')}</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[commonStyles.saveButton, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
          <Text style={[commonStyles.saveButtonText, { color: colors.white }]}>{t('createAccount')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[commonStyles.paragraph, { color: colors.primary }]}>{t('alreadyHaveAccount')}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/login')}>
            <Text style={[commonStyles.name, { color: colors.accent }]}> {t('signIn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
});