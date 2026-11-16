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
import { useAppSettings } from '../context/AppSettingsContext';
import { adminApi } from '../services/adminApi';
import { facultyLogin, facultyVerify } from '../services/doctor';
import { adminErrorKey, errorKey, retrySeconds } from '../services/errors';
import { setAdminId, setFacultyId, setStudentId } from '../services/session';
import { studentLogin, studentVerify } from '../services/student';
import { commonStyles } from '../theme/styles';

// ---- أدوات مساعدة (داخل الملف بدل ملفات جديدة) ----
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
  return { remaining, start, label: `${mm}:${ss}` };
}


type Role = 'student' | 'faculty' | 'admin';

// نحدد الدور من اللي كتبه المستخدم بالخانة الأولى:
// أرقام فقط (أو إيميل الجامعة s123@uoh.edu.sa) = طالبة، F001 = دكتورة، غير كذا = أدمن
const detectRole = (raw: string): { role: Role; id: string } => {
  const value = toEnglishDigits(raw.trim());
  const uni = value.match(/^s(\d+)@uoh\.edu\.sa$/i);
  if (uni) return { role: 'student', id: uni[1] };
  if (/^\d+$/.test(value)) return { role: 'student', id: value };
  if (/^f[a-z]?\d+$/i.test(value)) return { role: 'faculty', id: value };
  return { role: 'admin', id: value };
};

export default function LoginScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [facultyIdFromServer, setFacultyIdFromServer] = useState('');
  const [loading, setLoading] = useState(false);
  const lock = useCountdown();

  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  const { role, id } = detectRole(username);
  const needsCode = true;

  const resetCodeStep = () => {
    setCodeSent(false);
    setCode('');
  };

  const showError = (e: unknown) => {
    const secs = retrySeconds(e);
    if (secs > 0) lock.start(secs);
    Alert.alert(t('error'), t(errorKey(e) as any));
  };

  // ردود الأدمن ما ترمي خطأ، ترجع success=false مع message
  const showAdminFailure = (res: { message?: string; data?: any }) => {
    const secs = retrySeconds(res);
    if (secs > 0) {
      lock.start(secs);
      resetCodeStep(); // الباك يمسح الرمز عند الحظر
    }
    const key = adminErrorKey(res.message);
    if (key === 'err_CODE_EXPIRED' || key === 'err_NO_PENDING_LOGIN') resetCodeStep();
    Alert.alert(t('error'), t(key as any));
  };

  // زر إرسال الرمز: يتأكد من الباسورد ثم يرسل الرمز على الإيميل
  const handleSendCode = async () => {
    if (loading || lock.remaining > 0) return;
    if (!id || !password) {
      Alert.alert(t('error'), t('err_LOGIN_FIELDS_REQUIRED'));
      return;
    }
    setLoading(true);
    try {
      if (role === 'student') {
        const d = await studentLogin(id, password);
        if (!d?.email) throw new Error('REQUEST_FAILED');
        setStudentEmail(d.email);
      } else if (role === 'faculty') {
        const d = await facultyLogin(id, password);
        setFacultyIdFromServer(d?.faculty_id ?? id);
      } else {
        const res = await adminApi.login(id, password);
        if (!res.success) {
          setAdminId(res.data?.adminId ?? '');
          showAdminFailure(res);
          return;
        }
        // رمز التجربة يظهر فقط أثناء التطوير (ADMIN_OTP_DEV_MODE)، وما يظهر بالنسخة النهائية
        if (__DEV__ && res.data?.devCode) setCode(res.data.devCode);
      }
      setCodeSent(true);
      Alert.alert(t('verificationCodeSent'));
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  // زر الدخول: يتحقق من الرمز (الدكتورة تدخل مباشرة)
  const handleSignIn = async () => {
    if (loading) return;
    if (!id || !password) {
      Alert.alert(t('error'), t('err_LOGIN_FIELDS_REQUIRED'));
      return;
    }
    if (needsCode) {
      if (!codeSent) {
        Alert.alert(t('error'), t('err_CODE_NOT_SENT'));
        return;
      }
      if (code.length !== 6) {
        Alert.alert(t('error'), t('err_VERIFICATION_REQUIRED'));
        return;
      }
    }
    setLoading(true);
    try {
      if (role === 'student') {
        await studentVerify(studentEmail, code);
        setStudentId(id);
        router.replace('/student/home');
      } else if (role === 'faculty') {
        const d = await facultyVerify(facultyIdFromServer || id, code);
        setFacultyId(d.faculty_id);
        router.replace('/faculty/home');
      } else {
        const res = await adminApi.verifyLogin(code);
        if (!res.success) {
          showAdminFailure(res);
          return;
        }
        router.replace('/admin/home');
      }
    } catch (e) {
      const key = errorKey(e);
      if (key === 'err_CODE_EXPIRED' || key === 'err_CODE_ALREADY_USED') resetCodeStep();
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  const fields: any[] = [
    {
      label: t('username'), icon: 'person-outline', placeholder: t('enterUsername'), value: username,
      onChange: (v: string) => { setUsername(v); resetCodeStep(); },
      autoCapitalize: 'none', autoCorrect: false,
    },
    {
      label: t('password'), icon: 'lock-closed-outline', placeholder: t('enterPassword'), value: password,
      onChange: (v: string) => { setPassword(v); resetCodeStep(); },
      autoCapitalize: 'none', autoCorrect: false,
      secure: !showPassword, toggle: () => setShowPassword(!showPassword),
    },
  ];

  if (needsCode) {
    fields.push({
      label: t('code'), icon: 'shield-checkmark-outline', placeholder: t('enterCode'), value: code,
      onChange: (v: string) => setCode(onlyDigits(v).slice(0, 6)),
      keyboardType: 'number-pad', maxLength: 6,
      action: lock.remaining > 0 ? lock.label : t('sendCode'),
      onAction: handleSendCode,
      actionDisabled: loading || lock.remaining > 0,
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[commonStyles.logoContainer, { alignSelf: 'center' }]}>
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.primary, top: 0 }]} />
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.accent, top: 32 }]} />
          <View style={[commonStyles.logoLayer, { backgroundColor: colors.placeholder, top: 64 }]} />
        </View>

        <Text style={[commonStyles.headerTitle, { color: colors.primary, textAlign: 'center' }]}>Silah</Text>
        <Text style={[commonStyles.headerSubtitle, { color: colors.primary, textAlign: 'center', marginTop: 16 }]}>{t('signInSubtitle')}</Text>

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
                secureTextEntry={f.secure}
                maxLength={f.maxLength}
              />
              {f.toggle && (
                <TouchableOpacity onPress={f.toggle} activeOpacity={0.7}>
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

        <TouchableOpacity
          style={[commonStyles.saveButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={handleSignIn}
        >
          <Text style={[commonStyles.saveButtonText, { color: colors.white }]}>{t('signIn')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[commonStyles.paragraph, { color: colors.primary }]}>{t('noAccount')}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/student/register')}>
            <Text style={[commonStyles.name, { color: colors.accent }]}> {t('signUp')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
});