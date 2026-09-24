import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  BackHandler,
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
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

interface Message {
  id: string;
  text: string;
  time: string;
  fromMe: boolean;
}

interface Conversation {
  id: string;
  name: string;
  lastActive: string;
  messages: Message[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Sara salem',
    lastActive: '2:07 pm',
    messages: [
      { id: 'm1', text: 'Hi Dr ,when is the quis?', time: '1:50 pm', fromMe: false },
      { id: 'm2', text: 'Hi,next week', time: '2:07 pm', fromMe: true },
    ],
  },
  { id: '2', name: 'Sultan Khalid', lastActive: '10:50 am', messages: [] },
  { id: '3', name: 'Salma Ayed', lastActive: '8:38 am', messages: [] },
  { id: '4', name: 'Nora Alotaibi', lastActive: 'Yeasterday', messages: [] },
  { id: '5', name: 'Laila saud', lastActive: 'Monday', messages: [] },
  { id: '6', name: 'Mohammed', lastActive: 'May 19', messages: [] },
];

export default function FacultyChatScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    const onBackPress = () => {
      if (selectedId) {
        setSelectedId(null);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [selectedId]);

  const filteredList = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!draft.trim() || !selected) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: Date.now().toString(), text: draft.trim(), time: 'Now', fromMe: true },
              ],
            }
          : c
      )
    );
    setDraft('');
  };

  if (selected) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={[
              styles.chatHeaderRow,
              { backgroundColor: colors.white, borderBottomColor: colors.border },
              isRTL && { flexDirection: 'row-reverse' },
            ]}
          >
            <TouchableOpacity onPress={() => setSelectedId(null)} activeOpacity={0.7}>
              <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
            </TouchableOpacity>
            <View style={[styles.chatHeaderAvatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={16} color={colors.white} />
            </View>
            <Text style={[styles.chatHeaderName, { color: colors.primary }]}>{selected.name}</Text>
            <TouchableOpacity style={isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }} activeOpacity={0.7}>
              <Ionicons name="videocam" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={isRTL ? { marginRight: 14 } : { marginLeft: 14 }} activeOpacity={0.7}>
              <Ionicons name="call" size={19} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.messagesArea}>
            {selected.messages.length === 0 ? (
              <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>{t('startConversation')}</Text>
            ) : (
              selected.messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.bubble,
                    msg.fromMe
                      ? { backgroundColor: colors.border, alignSelf: isRTL ? 'flex-start' : 'flex-end', borderBottomRightRadius: 2 }
                      : { backgroundColor: colors.accent, alignSelf: isRTL ? 'flex-end' : 'flex-start', borderBottomLeftRadius: 2 },
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{msg.text}</Text>
                  <Text style={[styles.bubbleTime, { color: colors.primary, textAlign: isRTL ? 'left' : 'right' }]}>{msg.time}</Text>
                </View>
              ))
            )}
          </ScrollView>

          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.white, borderTopColor: colors.border },
              isRTL && { flexDirection: 'row-reverse' },
            ]}
          >
            <TextInput
              style={[styles.messageInput, { backgroundColor: colors.background, color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('typeMessage')}
              placeholderTextColor={colors.placeholder}
              value={draft}
              onChangeText={setDraft}
            />
            <TouchableOpacity onPress={sendMessage} activeOpacity={0.7}>
              <Ionicons name="send" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('chat')}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{t('conversationsLabel')}</Text>

        <View style={[styles.searchWrapper, { backgroundColor: colors.white }, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="search" size={18} color={colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('searchForStudent')}
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[styles.listCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {filteredList.map((conv, index) => (
            <TouchableOpacity
              key={conv.id}
              style={[
                styles.convRow,
                index < filteredList.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                isRTL && { flexDirection: 'row-reverse' },
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedId(conv.id)}
            >
              <View style={[styles.convAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={18} color={colors.white} />
              </View>
              <Text style={[styles.convName, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{conv.name}</Text>
              <Text style={[styles.convTime, { color: colors.textSecondary }]}>{conv.lastActive}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <FacultyTabBar activeTab="chat" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 10 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '700' },

  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    height: 46,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 13 },

  listCard: { borderWidth: 1, borderRadius: 18, padding: 4 },
  convRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  convAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  convName: { flex: 1, fontSize: 14.5, fontWeight: '600' },
  convTime: { fontSize: 11 },

  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chatHeaderAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  chatHeaderName: { fontSize: 15, fontWeight: '700' },

  messagesArea: { padding: 18, gap: 10, flexGrow: 1 },
  emptyChatText: { textAlign: 'center', marginTop: 40 },

  bubble: { maxWidth: '75%', padding: 12, borderRadius: 14, marginBottom: 4 },
  bubbleText: { fontSize: 13.5 },
  bubbleTime: { fontSize: 9.5, opacity: 0.6, marginTop: 4 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
  },
  messageInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
  },
});