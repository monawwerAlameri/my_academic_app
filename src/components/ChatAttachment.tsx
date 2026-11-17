import { Ionicons } from '@expo/vector-icons';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Attachment } from '../utils/attachments';

// يعرض المرفق داخل فقاعة الرسالة: الصورة تطلع مصغّرة، وباقي الملفات أيقونة مع الاسم. الضغط يفتح الملف
export function ChatAttachment({ attachment, color }: { attachment: Attachment; color: string }) {
  const open = () => { Linking.openURL(attachment.url).catch(() => {}); };

  if (attachment.type === 'image') {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={open}>
        <Image source={{ uri: attachment.url }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={open} style={styles.fileRow}>
      <Ionicons name={attachment.type === 'video' ? 'videocam-outline' : 'document-text-outline'} size={22} color={color} />
      <Text style={[styles.fileName, { color }]} numberOfLines={2}>{attachment.name}</Text>
    </TouchableOpacity>
  );
}

// الملف المختار قبل الإرسال (يطلع فوق خانة الكتابة مع زر إلغاء)
export function PickedFileChip({ name, onRemove, colors, isRTL }: { name: string; onRemove: () => void; colors: any; isRTL: boolean }) {
  return (
    <View style={[styles.chip, { backgroundColor: colors.cardBackground, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
      <Ionicons name="attach" size={18} color={colors.primary} />
      <Text style={[styles.chipText, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>{name}</Text>
      <TouchableOpacity onPress={onRemove} activeOpacity={0.7}>
        <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: 200, height: 200, borderRadius: 12 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 220 },
  fileName: { fontSize: 13, fontWeight: '600', flexShrink: 1, textDecorationLine: 'underline' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  chipText: { flex: 1, fontSize: 13 },
});