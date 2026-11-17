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
import { DataState } from '../../components/DataState';
import { FacultyTabBar } from '../../components/FacultyTabBar';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { FacultyConversation, getFacultyConversations } from '../../services/doctor';
import { commonStyles } from '../../theme/styles';

export default function FacultyChatScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const [search, setSearch] = useState('');
  const { data: conversations, loading, error, reload } = useFetch<FacultyConversation[]>(getFacultyConversations, []);

  const filteredList = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openChat = (conversation: FacultyConversation) => {
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
          <DataState
            loading={loading}
            error={error}
            empty={filteredList.length === 0}
            emptyText={t('noConversations')}
            onRetry={reload}
          >
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
                <View>
                  <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
                  {conv.isNow && <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.background }]} />}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.name, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {conv.name}
                  </Text>
                  {conv.isNow && (
                    <View style={[styles.activeBadge, { backgroundColor: colors.successLight }, isRTL ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
                      <Text style={[styles.activeText, { color: colors.success }]}>{t('activeNow')}</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.smallText, { color: colors.textSecondary }]}>{conv.time}</Text>
              </TouchableOpacity>
            ))}
          </DataState>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <FacultyTabBar activeTab="chat" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  smallText: { fontSize: 12 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  activeBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activeText: { fontSize: 11, fontWeight: '700' },
});