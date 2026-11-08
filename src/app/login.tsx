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
import { commonStyles } from '../theme/styles';

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

  const align = { textAlign: isRTL ? 'right' : 'left' } as const;
  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

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

  const fields: any[] = [
    { label: t('username'), icon: 'person-outline', placeholder: t('enterUsername'), value: username, onChange: setUsername, autoCapitalize: 'none', autoCorrect: false },
    { label: t('password'), icon: 'lock-closed-outline', placeholder: t('enterPassword'), value: password, onChange: setPassword, autoCapitalize: 'none', autoCorrect: false, secure: !showPassword, toggle: () => setShowPassword(!showPassword) },
    { label: t('code'), icon: 'shield-checkmark-outline', placeholder: t('enterCode'), value: code, onChange: setCode, keyboardType: 'number-pad' },
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
              />
              {f.toggle && (
                <TouchableOpacity onPress={f.toggle} activeOpacity={0.7}>
                  <Ionicons name={f.secure ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={[commonStyles.saveButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={handleSignIn}>
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