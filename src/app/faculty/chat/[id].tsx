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
import { FacultyTabBar } from '../../../components/FacultyTabBar';
import { useAppSettings } from '../../../context/AppSettingsContext';

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  audioUri?: string;
  durationMs?: number;
}

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', from: 'them', text: 'Hi Dr, when is the quiz?', time: '1:50 pm' },
    { id: '2', from: 'me', text: 'Hi, next week', time: '2:07 pm' },
  ],
};

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
    <View style={styles.voiceRow}>
      <TouchableOpacity onPress={togglePlay} activeOpacity={0.7} hitSlop={8}>
        <Ionicons name={status.playing ? 'pause-circle' : 'play-circle'} size={34} color={color} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <View style={[styles.voiceTrack, { backgroundColor: color, opacity: 0.3 }]} />
        <View
          style={[
            styles.voiceProgress,
            { backgroundColor: color, width: (progress * 100 + '%') as any },
          ]}
        />
      </View>
      <Text style={{ color: color, fontSize: 11 }}>
        {formatTime(status.playing ? status.currentTime : totalSeconds)}
      </Text>
    </View>
  );
}

export default function FacultyChatConversationScreen() {
  const { colors, t, isRTL } = useAppSettings();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES[id as string] ?? []);
  const [isRecording, setIsRecording] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

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
    const student = name || 'Student';
    Alert.alert(title, 'Calling ' + student + '...');
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
        <View style={[styles.headerRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={26}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.primary }]} numberOfLines={1}>
            {name || t('chat')}
          </Text>

          <View style={{ flex: 1 }} />

          <View style={[styles.callButtons, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity onPress={() => handleCall('video')} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="videocam" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCall('voice')} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="call" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
              {t('startConversation')}
            </Text>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubbleWrapper,
                  message.audioUri ? { width: '78%' } : null,
                  message.from === 'me' ? styles.alignRight : styles.alignLeft,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    message.from === 'me'
                      ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                      : { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
                  ]}
                >
                  {message.audioUri ? (
                    <VoiceMessage
                      uri={message.audioUri}
                      durationMs={message.durationMs}
                      isMe={message.from === 'me'}
                      colors={colors}
                    />
                  ) : (
                    <Text style={[styles.bubbleText, { color: message.from === 'me' ? colors.white : colors.primary }]}>
                      {message.text}
                    </Text>
                  )}
                </View>
                <Text style={[styles.messageTime, { color: colors.textSecondary }]}>{message.time}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {isRecording ? (
          <View style={[styles.inputRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity onPress={() => stopRecording(false)} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="trash-outline" size={26} color="#D32F2F" />
            </TouchableOpacity>

            <View
              style={[
                styles.recordingBar,
                { backgroundColor: colors.white, borderColor: colors.border },
                isRTL && { flexDirection: 'row-reverse' },
              ]}
            >
              <View style={styles.recordingDot} />
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                {formatTime(recorderState.durationMillis / 1000)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
              onPress={() => stopRecording(true)}
            >
              <Ionicons name="send" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.inputRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.white, color: colors.primary, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('typeMessage')}
              placeholderTextColor={colors.placeholder}
              value={draft}
              onChangeText={setDraft}
            />
            {draft.trim().length > 0 ? (
              <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} activeOpacity={0.7} onPress={handleSend}>
                <Ionicons name="send" size={18} color={colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} activeOpacity={0.7} onPress={startRecording}>
                <Ionicons name="mic" size={20} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 90 }} />
      </KeyboardAvoidingView>

      <FacultyTabBar activeTab="chat" onTabPress={(key) => router.push(`/faculty/${key}` as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 16, marginBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', flexShrink: 1 },
  callButtons: { flexDirection: 'row', alignItems: 'center', gap: 18 },

  messagesContent: { paddingHorizontal: 20, paddingBottom: 10, gap: 14 },

  messageBubbleWrapper: { maxWidth: '78%' },
  alignLeft: { alignSelf: 'flex-start' },
  alignRight: { alignSelf: 'flex-end' },

  bubble: { borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14 },
  bubbleText: { fontSize: 13.5 },

  messageTime: { fontSize: 10, marginTop: 4 },

  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voiceTrack: { height: 3, borderRadius: 2 },
  voiceProgress: { height: 3, borderRadius: 2, position: 'absolute', left: 0, top: 0 },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  input: { flex: 1, borderRadius: 24, height: 46, paddingHorizontal: 16, fontSize: 13, borderWidth: 1 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  recordingBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 24, height: 46, paddingHorizontal: 16, borderWidth: 1 },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D32F2F' },
});