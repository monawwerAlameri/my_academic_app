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
import { ChatAttachment, PickedFileChip } from '../../../components/ChatAttachment';
import { DataState } from '../../../components/DataState';
import { useAppSettings } from '../../../context/AppSettingsContext';
import { useFetch } from '../../../hooks/useFetch';
import { errorKey } from '../../../services/errors';
import { Message, getMessages, sendMessage } from '../../../services/student';
import { commonStyles } from '../../../theme/styles';
import { PickedFile, pickAttachment } from '../../../utils/attachments';

export default function ChatConversationScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { id, name, canSend } = useLocalSearchParams<{ id: string; name: string; canSend?: string }>();
  const readOnly = canSend === '0';
  const [draft, setDraft] = useState('');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [sending, setSending] = useState(false);
  const { data: messages, loading, error, reload, silentReload } =
    useFetch<Message[]>(() => getMessages(id), [], [id]);

  useEffect(() => {
    const timer = setInterval(silentReload, 5000);
    return () => clearInterval(timer);
  }, [silentReload]);

  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  // اختيار مرفق (الأنواع غير المسموحة مثل php تنرفض هنا وفي الباك)
  const handlePick = async () => {
    if (sending || readOnly) return;
    try {
      const res = await pickAttachment();
      if (!res) return;
      if ('error' in res) {
        Alert.alert(t('error'), t(('err_' + res.error) as any));
        return;
      }
      setFile(res.file);
    } catch {
      Alert.alert(t('error'), t('err_UPLOAD_FAILED'));
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if ((text.length === 0 && !file) || sending || readOnly) return;
    setSending(true);
    try {
      await sendMessage(id, text, file ?? undefined);
      setDraft('');
      setFile(null);
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
              const textColor = isMe ? colors.white : colors.primary;
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
                    {message.attachment && <ChatAttachment attachment={message.attachment} color={textColor} />}
                    {message.text.length > 0 && (
                      <Text style={[commonStyles.paragraph, { color: textColor }, message.attachment && { marginTop: 8 }]}>{message.text}</Text>
                    )}
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
          <>
            {file && <PickedFileChip name={file.name} onRemove={() => setFile(null)} colors={colors} isRTL={isRTL} />}
            <View style={[styles.inputRow, reverse]}>
              <TouchableOpacity
                style={[styles.attachButton, { borderColor: colors.border, backgroundColor: colors.white }]}
                activeOpacity={0.7}
                onPress={handlePick}
              >
                <Ionicons name="attach" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { backgroundColor: colors.white, color: colors.primary, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
                placeholder={t('typeMessage')}
                placeholderTextColor={colors.placeholder}
                value={draft}
                onChangeText={setDraft}
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.primary, opacity: sending ? 0.6 : 1 }]}
                activeOpacity={0.7}
                onPress={handleSend}
              >
                <Ionicons name="send" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 90 }} />
      </KeyboardAvoidingView>

      <BottomTabBar activeTab="chat" onTabPress={(key) => router.push(('/student/' + key) as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 11 },
  bubble: { borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  input: { flex: 1, borderRadius: 24, height: 46, paddingHorizontal: 16, borderWidth: 1 },
  attachButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});