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
import { commonStyles } from '../../theme/styles';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContentHeader} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[commonStyles.headerTitle, { color: colors.primary }]}>{t('chat')}</Text>
        </View>

        <Text style={[commonStyles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left', marginBottom: 12 }]}>
          {t('conversationsLabel')}
        </Text>

        <View style={[commonStyles.searchBox, { backgroundColor: colors.white, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="search" size={18} color={colors.primary} />
          <TextInput
            style={[commonStyles.searchInput, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('searchForStudent')}
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={[commonStyles.panel, { borderColor: colors.border }]}>
          {filteredList.map((conv, index) => (
            <TouchableOpacity
              key={conv.id}
              style={[
                commonStyles.menuRow,
                index < filteredList.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                isRTL && { flexDirection: 'row-reverse' },
              ]}
              activeOpacity={0.7}
              onPress={() => openChat(conv)}
            >
              <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
              <Text style={[commonStyles.name, { flex: 1, color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                {conv.name}
              </Text>
              <Text style={[styles.smallText, { color: colors.textSecondary }]}>{conv.lastActive}</Text>
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
  smallText: { fontSize: 12 },
});