import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppSettings } from '../../context/AppSettingsContext';
import { facultyOtpSend, facultyRegister } from '../../services/doctor';
import { errorKey, retrySeconds } from '../../services/errors';
import { commonStyles } from '../../theme/styles';

// يحوّل الأرقام العربية/الفارسية إلى إنجليزية، لأن الباك يقبل الإنجليزية فقط
const toEnglishDigits = (s: string) =>
  s
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
const onlyDigits = (s: string) => toEnglishDigits(s).replace(/\D/g, '');

// عدّاد تنازلي لمدة الحظر
function useCountdown() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= endsAt) setEndsAt(null);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  const remaining = endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - now) / 1000));
  const start = (seconds: number) => {
    const n = Date.now();
    setNow(n);
    setEndsAt(n + seconds * 1000);
  };
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { remaining, start, label: mm + ':' + ss };
}

const FACULTY_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_EMAIL = /^s\d+@uoh\.edu\.sa$/;
const PHONE = /^05\d{8}$/;

export default function FacultyRegisterScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [office, setOffice] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const lock = useCountdown();

  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  const emailNorm = email.trim().toLowerCase();
  const emailOk = FACULTY_EMAIL.test(emailNorm) && !STUDENT_EMAIL.test(emailNorm);

  const showError = (e: unknown) => {
    const secs = retrySeconds(e);
    if (secs > 0) lock.start(secs);
    Alert.alert(t('error'), t(errorKey(e) as any));
  };

  const fail = (key: string) => Alert.alert(t('error'), t(key as any));

  // إرسال رمز التحقق على بريد الجامعة
  const handleSendCode = async () => {
    if (loading || lock.remaining > 0) return;
    if (!emailNorm) return fail('err_EMAIL_REQUIRED');
    if (!emailOk) return fail('err_INVALID_FACULTY_EMAIL');
    setLoading(true);
    try {
      await facultyOtpSend(emailNorm);
      setCodeSent(true);
      setCode('');
      Alert.alert(t('verificationCodeSent'));
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  // إنشاء الحساب: الباك يتأكد من الرمز وينشئ الحساب ويرجّع رقم الدخول
  const handleCreate = async () => {
    if (loading) return;
    const name = fullName.trim();
    const dept = department.trim();
    const officeLocation = office.trim();
    const phoneNumber = toEnglishDigits(phone.trim());

    if (!name || !dept || !officeLocation || !phoneNumber || !emailNorm || !password || !confirmPassword) return fail('err_ALL_FIELDS_REQUIRED');
    if (!emailOk) return fail('err_INVALID_FACULTY_EMAIL');
    if (!PHONE.test(phoneNumber)) return fail('err_INVALID_PHONE_FORMAT');
    if (password.length < 8) return fail('passwordTooShort');
    if (password !== confirmPassword) return fail('passwordsDoNotMatch');
    if (!agreed) return fail('err_MUST_AGREE');
    if (!codeSent) return fail('err_CODE_NOT_SENT');
    if (code.length !== 6) return fail('err_VERIFICATION_REQUIRED');

    setLoading(true);
    try {
      const res = await facultyRegister({
        full_name: name,
        department: dept,
        office_location: officeLocation,
        phone_number: phoneNumber,
        email: emailNorm,
        password,
        code,
      });
      Alert.alert(t('accountCreated'), t('facultyAccountCreated') + ' ' + (res?.faculty_id ?? ''), [
        { text: t('signIn'), onPress: () => router.replace('/login') },
      ]);
    } catch (e) {
      const key = errorKey(e);
      if (key === 'err_CODE_EXPIRED' || key === 'err_CODE_ALREADY_USED') {
        setCodeSent(false);
        setCode('');
      }
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  const fields: any[] = [
    { label: t('fullName'), icon: 'person-outline', placeholder: t('enterFullName'), value: fullName, onChange: setFullName },
    { label: t('department'), icon: 'school-outline', placeholder: t('enterDepartment'), value: department, onChange: setDepartment },
    { label: t('officeLocation'), icon: 'location-outline', placeholder: t('enterOffice'), value: office, onChange: setOffice },
    { label: t('phoneNumber'), icon: 'call-outline', placeholder: t('enterPhone'), value: phone, onChange: (v: string) => setPhone(onlyDigits(v).slice(0, 10)), keyboardType: 'phone-pad', maxLength: 10 },
    { label: t('email'), icon: 'mail-outline', placeholder: t('enterFacultyEmail'), value: email, onChange: (v: string) => { setEmail(v); setCodeSent(false); setCode(''); }, keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false },
    { label: t('password'), icon: 'lock-closed-outline', placeholder: t('createPassword'), value: password, onChange: setPassword, secure: !showPassword, toggle: () => setShowPassword(!showPassword) },
    { label: t('confirmPassword'), icon: 'lock-closed-outline', placeholder: t('confirmYourPassword'), value: confirmPassword, onChange: setConfirmPassword, secure: !showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword) },
    { label: t('verificationCode'), icon: 'shield-checkmark-outline', placeholder: t('enterVerificationCode'), value: code, onChange: (v: string) => setCode(onlyDigits(v).slice(0, 6)), keyboardType: 'number-pad', maxLength: 6, action: lock.remaining > 0 ? lock.label : t('sendCode'), onAction: handleSendCode, actionDisabled: loading || lock.remaining > 0 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[commonStyles.logoContainer, { alignSelf: 'center' }]}>
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.primary, top: 0 }]} />
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.accent, top: 32 }]} />
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.placeholder, top: 64 }]} />
        </View>

        <Text style={[commonStyles.headerTitle, { color: colors.primary, textAlign: 'center' }]}>Silah</Text>
        <Text style={[commonStyles.headerTitle, { color: colors.accent, textAlign: 'center', marginTop: 16 }]}>{t('createAccount')}</Text>
        <Text style={[commonStyles.headerSubtitle, { color: colors.primary, textAlign: 'center' }]}>{t('facultyJoin')}</Text>

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
                autoCorrect={f.autoCorrect}
                maxLength={f.maxLength}
                secureTextEntry={f.secure}
              />
              {f.toggle && (
                <TouchableOpacity onPress={f.toggle}>
                  <Ionicons name={f.secure ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.primary} />
                </TouchableOpacity>
              )}
              {f.action && (
                <TouchableOpacity onPress={f.onAction} disabled={f.actionDisabled} activeOpacity={0.7}>
                  <Text style={[commonStyles.chipText, { color: f.actionDisabled ? colors.placeholder : colors.accent }]}>{f.action}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {lock.remaining > 0 && (
          <Text style={[commonStyles.paragraph, align, { color: colors.danger, marginTop: 8 }]}>
            {t('err_TOO_MANY_REQUESTS')} ({t('tryAgainIn')} {lock.label})
          </Text>
        )}

        <TouchableOpacity style={[styles.termsRow, reverse]} activeOpacity={0.7} onPress={() => setAgreed(!agreed)}>
          <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={24} color={colors.primary} />
          <Text style={[commonStyles.paragraph, align, { flex: 1, color: colors.primary }]}>
            {t('agreeToTerms')}{' '}
            <Text onPress={() => router.push({ pathname: '/terms', params: { type: 'terms' } } as any)} style={{ color: colors.accent, fontWeight: '600', textDecorationLine: 'underline' }}>{t('termsOfService')}</Text>
            {' '}{t('andWord')}{' '}
            <Text onPress={() => router.push({ pathname: '/terms', params: { type: 'privacy' } } as any)} style={{ color: colors.accent, fontWeight: '600', textDecorationLine: 'underline' }}>{t('privacyPolicy')}</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.saveButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={handleCreate}
        >
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