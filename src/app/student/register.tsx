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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={[styles.logoLayer, { backgroundColor: colors.primary, top: 0 }]} />
          <View style={[styles.logoLayer, { backgroundColor: colors.accent, top: 40 }]} />
          <View style={[styles.logoLayer, { backgroundColor: colors.placeholder, top: 80 }]} />
        </View>

        <Text style={[styles.title, { color: colors.primary }]}>Academic{'\n'}Booking</Text>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>{t('createAccount')}</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>{t('joinUs')}</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('fullName')}</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="person-outline" size={22} color={colors.primary} />
            <TextInput style={[styles.input, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]} placeholder={t('enterFullName')} placeholderTextColor={colors.placeholder} value={fullName} onChangeText={setFullName} />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('phoneNumber')}</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="call-outline" size={22} color={colors.primary} />
            <TextInput style={[styles.input, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]} placeholder={t('enterPhone')} placeholderTextColor={colors.placeholder} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('email')}</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="mail-outline" size={22} color={colors.primary} />
            <TextInput style={[styles.input, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]} placeholder={t('enterEmail')} placeholderTextColor={colors.placeholder} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('password')}</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
            <TextInput style={[styles.input, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]} placeholder={t('createPassword')} placeholderTextColor={colors.placeholder} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('confirmPassword')}</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
            <TextInput style={[styles.input, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]} placeholder={t('confirmYourPassword')} placeholderTextColor={colors.placeholder} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('verificationCode')}</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            <TextInput style={[styles.input, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]} placeholder={t('enterVerificationCode')} placeholderTextColor={colors.placeholder} value={code} onChangeText={setCode} keyboardType="number-pad" />
            <TouchableOpacity>
              <Text style={[styles.sendCodeText, { color: colors.accent }]}>{t('sendCode')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.termsRow, isRTL && { flexDirection: 'row-reverse' }]} activeOpacity={0.7} onPress={() => setAgreed(!agreed)}>
          <View style={[styles.checkbox, { borderColor: colors.border }, agreed && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            {agreed ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
          </View>
          <Text style={[styles.termsText, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('agreeToTerms')}{' '}
            <Text style={{ color: colors.accent, fontWeight: '600' }}>{t('termsOfService')}</Text>
            {' '}{t('andWord')}{' '}
            <Text style={{ color: colors.accent, fontWeight: '600' }}>{t('privacyPolicy')}</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
          <Text style={[styles.createButtonText, { color: colors.white }]}>{t('createAccount')}</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.primary }]}>{t('alreadyHaveAccount')}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/login')}>
            <Text style={[styles.signInText, { color: colors.accent }]}> {t('signIn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingHorizontal: 32, paddingTop: 45, paddingBottom: 35, alignItems: 'center' },
  logoContainer: { width: 110, height: 125, alignItems: 'center', position: 'relative', marginBottom: 15 },
  logoLayer: { position: 'absolute', width: 100, height: 45, borderRadius: 7 },
  title: { fontSize: 34, fontWeight: '700', textAlign: 'center', lineHeight: 40 },
  sectionTitle: { fontSize: 24, fontWeight: '700', marginTop: 18 },
  subtitle: { fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 26 },
  field: { width: '100%', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  inputWrapper: { width: '100%', height: 58, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 15 },
  input: { flex: 1, height: '100%', marginLeft: 12, fontSize: 15 },
  sendCodeText: { fontWeight: '700', fontSize: 14 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', width: '100%', marginTop: 6, marginBottom: 20, gap: 10 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  termsText: { flex: 1, fontSize: 14, lineHeight: 20 },
  createButton: { width: '100%', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  createButtonText: { fontSize: 18, fontWeight: '700' },
  footerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 15 },
  signInText: { fontSize: 15, fontWeight: '600' },
});