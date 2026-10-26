import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
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
import { FacultyTabBar } from '../../../components/FacultyTabBar';
import { useAppSettings } from '../../../context/AppSettingsContext';
import { commonStyles } from '../../../theme/styles';

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', from: 'them', text: 'Hi Dr, when is the quiz?', time: '1:50 pm' },
    { id: '2', from: 'me', text: 'Hi, next week', time: '2:07 pm' },
  ],
};


export default function FacultyChatConversationScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES[id as string] ?? []);



  const reverse = isRTL && { flexDirection: 'row-reverse' as const };

  const handleSend = () => {
    if (draft.trim().length === 0) return;
    const newMessage: Message = {
      id: String(messages.length + 1),
      from: 'me',
      text: draft.trim(),
      time: 'now',
    };
    setMessages([...messages, newMessage]);
    setDraft('');
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
            {name || t('chat')}
          </Text>

        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10, gap: 14 }} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <Text style={[commonStyles.empty, { color: colors.textSecondary }]}>{t('startConversation')}</Text>
          ) : (
            messages.map((message) => {
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
            })
          )}
        </ScrollView>

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

        <View style={{ height: 90 }} />
      </KeyboardAvoidingView>

      <FacultyTabBar activeTab="chat" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
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