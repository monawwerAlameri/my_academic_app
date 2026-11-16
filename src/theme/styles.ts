import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  scrollContent: { padding: 20 },
  scrollContentHeader: { paddingHorizontal: 20, paddingTop: 16 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  headerTitle: { fontSize: 40, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, lineHeight: 18, marginBottom: 22 },

  card: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12 },
  panel: { borderWidth: 1, borderRadius: 18 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 16 },

  paragraph: { fontSize: 13, lineHeight: 21 },
  name: { fontSize: 15, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },

  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, height: 50, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },

  logoContainer: { width: 90, height: 100, alignItems: 'center', position: 'relative', marginBottom: 10 },
  logoLayer: { position: 'absolute', width: 80, height: 36, borderRadius: 6 },

  avatarWrapper: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  changePhotoButton: { borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16 },
  changePhotoText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, marginTop: 10 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderRadius: 12, height: 48, paddingHorizontal: 14, fontSize: 14 },
  saveButton: { height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  saveButtonText: { fontSize: 15, fontWeight: '700' },
});