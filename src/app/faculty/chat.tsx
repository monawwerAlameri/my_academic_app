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
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';

interface Conversation {
  id: string;
  name: string;
  lastActive: string;
}

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Sara salem', lastActive: '2:07 pm' },
  { id: '2', name: 'Sultan Khalid', lastActive: '10:50 am' },
  { id: '3', name: 'Salma Ayed', lastActive: '8:38 am' },
  { id: '4', name: 'Nora Alotaibi', lastActive: 'Yeasterday' },
  { id: '5', name: 'Laila saud', lastActive: 'Monday' },
  { id: '6', name: 'Mohammed', lastActive: 'May 19' },
];

export default function FacultyChatScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [search, setSearch] = useState('');

  const filteredList = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openChat = (conversation: Conversation) => {
    router.push({
      pathname: '/faculty/chat/[id]',
      params: { id: conversation.id, name: conversation.name },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('chat')}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('conversationsLabel')}
        </Text>

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
              onPress={() => openChat(conv)}
            >
              <View style={[styles.convAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={18} color={colors.white} />
              </View>
              <Text style={[styles.convName, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                {conv.name}
              </Text>
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
});