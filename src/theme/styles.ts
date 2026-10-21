import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  scrollContent: { padding: 20 },
  scrollContentHeader: { paddingHorizontal: 20, paddingTop: 16 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
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
});