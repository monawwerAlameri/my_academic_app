import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabBar } from '../../../components/BottomTabBar';
import { DataState } from '../../../components/DataState';
import { useAppSettings } from '../../../context/AppSettingsContext';
import { useFetch } from '../../../hooks/useFetch';
import { errorKey } from '../../../services/errors';
import { Message, getMessages, sendMessage } from '../../../services/student';
import { commonStyles } from '../../../theme/styles';



export default function ChatConversationScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { id, name, canSend } = useLocalSearchParams<{ id: string; name: string; canSend?: string }>();
  const readOnly = canSend === '0';
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
const { data: messages, loading, error, reload, silentReload } =
  useFetch<Message[]>(() => getMessages(id), [], [id]);

useEffect(() => {
  const timer = setInterval(silentReload, 5000);
  return () => clearInterval(timer);
}, [silentReload]);

 

  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

 const handleSend = async () => {
  const text = draft.trim();
    if (text.length === 0 || sending || readOnly) return;
  setSending(true);
  try {
    await sendMessage(id, text);
    setDraft('');
    silentReload();
  } catch (e) {
    Alert.alert(t('error'), t(errorKey(e) as any));
  } finally {
    setSending(false);
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[commonStyles.headerRow, { paddingHorizontal: 20, paddingTop: 16 }, reverse]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
          <Text style={[commonStyles.name, { flex: 1, color: colors.primary }]} numberOfLines={1}>
            {name || t('chatTitle')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10, gap: 14 }} showsVerticalScrollIndicator={false}>
          <DataState
  loading={loading}
  error={error}
  empty={messages.length === 0}
  emptyText={t('noMessages')}
  onRetry={reload}
>
          {messages.map((message) => {
            const isMe = message.from === 'me';
            return (
              <View
                key={message.id}
                style={{ maxWidth: '78%', alignSelf: isMe ? 'flex-end' : 'flex-start' }}
              >
                <View
                  style={[
                    styles.bubble,
                    isMe
                      ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                      : { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
                  ]}
                >
                
                    <Text style={[commonStyles.paragraph, { color: isMe ? colors.white : colors.primary }]}>{message.text}</Text>
                  
                </View>
                <Text style={[styles.smallText, { color: colors.textSecondary, marginTop: 4 }]}>{message.time}</Text>
              </View>
            );
          })}
          </DataState>
        </ScrollView>

        {readOnly ? (
          <Text style={[commonStyles.paragraph, { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 20, paddingTop: 10 }]}>{t('chatReadOnly')}</Text>
        ) : (
        <View style={[styles.inputRow, reverse]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.white, color: colors.primary, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('typeMessage')}
            placeholderTextColor={colors.placeholder}
            value={draft}
            onChangeText={setDraft}
          />
          <TouchableOpacity
                  
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
            onPress={handleSend}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
                )}

        <View style={{ height: 90 }} />
      </KeyboardAvoidingView>

      <BottomTabBar activeTab="chat" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 11 },
  bubble: { borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  input: { flex: 1, borderRadius: 24, height: 46, paddingHorizontal: 16, borderWidth: 1 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});

