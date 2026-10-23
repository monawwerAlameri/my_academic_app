import { Ionicons } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import { useAppSettings } from '../../../context/AppSettingsContext';
import { commonStyles } from '../../../theme/styles';

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  audioUri?: string;
  durationMs?: number;
}

const MESSAGES: Message[] = [
  { id: '1', from: 'me', text: 'Hi Dr, when is the quiz?', time: '1:50 pm' },
  { id: '2', from: 'them', text: 'Hi, next week', time: '2:07 pm' },
];

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return mm + ':' + (ss < 10 ? '0' : '') + ss;
}

function VoiceMessage({
  uri,
  durationMs,
  isMe,
  colors,
}: {
  uri: string;
  durationMs?: number;
  isMe: boolean;
  colors: any;
}) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const totalSeconds = status.duration && status.duration > 0 ? status.duration : (durationMs || 0) / 1000;
  const progress = totalSeconds > 0 ? Math.min(status.currentTime / totalSeconds, 1) : 0;
  const color = isMe ? colors.white : colors.primary;

  const togglePlay = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (totalSeconds > 0 && status.currentTime >= totalSeconds - 0.1) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <TouchableOpacity onPress={togglePlay} activeOpacity={0.7} hitSlop={8}>
        <Ionicons name={status.playing ? 'pause-circle' : 'play-circle'} size={34} color={color} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <View style={[styles.bar, { backgroundColor: color, opacity: 0.3 }]} />
        <View
          style={[
            styles.bar,
            { backgroundColor: color, position: 'absolute', left: 0, top: 0, width: (progress * 100 + '%') as any },
          ]}
        />
      </View>
      <Text style={[styles.smallText, { color }]}>
        {formatTime(status.playing ? status.currentTime : totalSeconds)}
      </Text>
    </View>
  );
}

export default function ChatConversationScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { name } = useLocalSearchParams<{ id: string; name: string }>();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [isRecording, setIsRecording] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

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

  const handleCall = (type: 'video' | 'voice') => {
    const title = type === 'video' ? 'Video Call' : 'Voice Call';
    const doctor = name || 'Doctor';
    Alert.alert(title, 'Calling ' + doctor + '...');
  };

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow microphone access to record voice messages.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch (e) {
      Alert.alert('Error', 'Could not start recording.');
    }
  };
  const stopRecording = async (send: boolean) => {
    try {
      const durationMs = recorderState.durationMillis;
      await recorder.stop();
      setIsRecording(false);
      await setAudioModeAsync({ allowsRecording: false });

      const uri = recorder.uri;
      if (send && uri && durationMs > 500) {
        const voiceMessage: Message = {
          id: String(messages.length + 1),
          from: 'me',
          text: '',
          time: 'now',
          audioUri: uri,
          durationMs: durationMs,
        };
        setMessages([...messages, voiceMessage]);
      }
    } catch (e) {
      setIsRecording(false);
      Alert.alert('Error', 'Could not save the recording.');
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

          <TouchableOpacity onPress={() => handleCall('video')} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="videocam" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCall('voice')} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="call" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10, gap: 14 }} showsVerticalScrollIndicator={false}>
          {messages.map((message) => {
            const isMe = message.from === 'me';
            return (
              <View
                key={message.id}
                style={{ maxWidth: '78%', width: message.audioUri ? '78%' : undefined, alignSelf: isMe ? 'flex-end' : 'flex-start' }}
              >
                <View
                  style={[
                    styles.bubble,
                    isMe
                      ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                      : { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
                  ]}
                >
                  {message.audioUri ? (
                    <VoiceMessage uri={message.audioUri} durationMs={message.durationMs} isMe={isMe} colors={colors} />
                  ) : (
                    <Text style={[commonStyles.paragraph, { color: isMe ? colors.white : colors.primary }]}>{message.text}</Text>
                  )}
                </View>
                <Text style={[styles.smallText, { color: colors.textSecondary, marginTop: 4 }]}>{message.time}</Text>
              </View>
            );
          })}
        </ScrollView>

        {isRecording ? (
          <View style={[styles.inputRow, reverse]}>
            <TouchableOpacity onPress={() => stopRecording(false)} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="trash-outline" size={26} color={colors.danger} />
            </TouchableOpacity>

            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderColor: colors.border }, reverse]}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger }} />
              <Text style={[commonStyles.chipText, { color: colors.primary }]}>
                {formatTime(recorderState.durationMillis / 1000)}
              </Text>
            </View>

            <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} activeOpacity={0.7} onPress={() => stopRecording(true)}>
              <Ionicons name="send" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
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
              onPress={draft.trim().length > 0 ? handleSend : startRecording}
            >
              <Ionicons name={draft.trim().length > 0 ? 'send' : 'mic'} size={20} color={colors.white} />
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
  bar: { height: 3, borderRadius: 2 },
  bubble: { borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  input: { flex: 1, borderRadius: 24, height: 46, paddingHorizontal: 16, borderWidth: 1 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});