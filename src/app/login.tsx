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
import { useAppSettings } from '../context/AppSettingsContext';

// مستخدمين وهميين مؤقتاً لين الباك اند يخلص
const mockUsers = [
  { username: 'student1', password: '1234', role: 'student' },
  { username: 'doctor1', password: '1234', role: 'faculty' },
  { username: 'admin1', password: '1234', role: 'admin' },
];

export default function LoginScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    const found = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!found) {
      alert('اسم المستخدم أو كلمة المرور غير صحيحة');
      return;
    }

    switch (found.role) {
      case 'student':
        router.replace('/student/home');
        break;
      case 'faculty':
        router.replace('/faculty/home');
        break;
      case 'admin':
        router.replace('/admin/home');
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={[styles.logoLayer, { backgroundColor: colors.primary, top: 0 }]} />
          <View style={[styles.logoLayer, { backgroundColor: colors.accent, top: 40 }]} />
          <View style={[styles.logoLayer, { backgroundColor: colors.placeholder, top: 80 }]} />
        </View>

        <Text style={[styles.title, { color: colors.primary }]}>Academic{'\n'}Booking</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>{t('signInSubtitle')}</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('username')}</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="person-outline" size={24} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('enterUsername')}
              placeholderTextColor={colors.placeholder}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('password')}</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('enterPassword')}
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('code')}</Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.background }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('enterCode')}
              placeholderTextColor={colors.placeholder}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
          </View>
        </View>
        <TouchableOpacity style={[styles.signInButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={handleSignIn}>
          <Text style={[styles.signInText, { color: colors.white }]}>{t('signIn')}</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.primary }]}>{t('noAccount')}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/student/register')}>
            <Text style={[styles.signUpText, { color: colors.accent }]}> {t('signUp')}</Text>
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
  title: { fontSize: 40, fontWeight: '700', textAlign: 'center', lineHeight: 46 },
  subtitle: { fontSize: 17, textAlign: 'center', marginTop: 22, marginBottom: 30 },
  field: { width: '100%', marginBottom: 18 },
  label: { fontSize: 18, fontWeight: '700', marginBottom: 9 },
  inputWrapper: { width: '100%', height: 64, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 17 },
  input: { flex: 1, height: '100%', marginLeft: 14, fontSize: 17 },
  signInButton: { width: '100%', height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  signInText: { fontSize: 20, fontWeight: '700' },
  footerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 17 },
  signUpText: { fontSize: 17, fontWeight: '600' },
});