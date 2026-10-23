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
import { BottomTabBar } from '../../components/BottomTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { commonStyles } from '../../theme/styles';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
}

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Dr. Sara salem', lastMessage: 'Hi, next week', time: '2:07 pm' },
  { id: '2', name: 'Dr. Sultan Khalid', lastMessage: 'Thank you Dr.', time: '10:50 am' },
  { id: '3', name: 'Dr. Salma Ayed', lastMessage: 'See you tomorrow', time: '8:38 am' },
  { id: '4', name: 'Dr. Nora Alotaibi', lastMessage: 'Okay, noted', time: 'Yeasterday' },
  { id: '5', name: 'Dr. Laila saud', lastMessage: 'Can I reschedule?', time: 'Monday' },
  { id: '6', name: 'Dr. Mohammed', lastMessage: 'Got it, thanks', time: 'May 19' },
];

export default function ChatScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [search, setSearch] = useState('');

  const filtered = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openChat = (conversation: Conversation) => {
    router.push({
      pathname: '/student/chat/[id]',
      params: { id: conversation.id, name: conversation.name },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('chatTitle')}</Text>
        </View>

        <View style={[commonStyles.searchBox, { backgroundColor: colors.white, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            style={[commonStyles.searchInput, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('searchDoctor')}
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[commonStyles.panel, { borderColor: colors.border }]}>
          {filtered.map((conversation, index) => (
            <TouchableOpacity
              key={conversation.id}
              style={[
                styles.chatRow,
                index < filtered.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                isRTL && { flexDirection: 'row-reverse' },
              ]}
              activeOpacity={0.7}
              onPress={() => openChat(conversation)}
            >
              <Ionicons name="person-circle-outline" size={40} color={colors.primary} />

              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {conversation.name}
                </Text>
                <Text
                  style={[styles.smallText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
              </View>

              <Text style={[styles.smallText, { color: colors.textSecondary }]}>{conversation.time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomTabBar activeTab="chat" onTabPress={(key) => router.push(`/student/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chatRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  smallText: { fontSize: 12 },
});