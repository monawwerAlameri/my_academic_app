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
import { DataState } from '../../components/DataState';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { Conversation, getConversations } from '../../services/student';
import { commonStyles } from '../../theme/styles';




export default function ChatScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [search, setSearch] = useState('');
  const { data: conversations, loading, error, reload } = useFetch<Conversation[]>(getConversations, []);

  const filtered = conversations.filter((c) =>
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
          <DataState
  loading={loading}
  error={error}
  empty={filtered.length === 0}
  emptyText={t('noConversations')}
  onRetry={reload}
>

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

</DataState>
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