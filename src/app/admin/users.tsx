import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminHeader } from '../../components/AdminHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { DataState } from '../../components/DataState';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { adminApi, ApiUser, UserRoleApi } from '../../services/adminApi';
import { commonStyles } from '../../theme/styles';

type UserRole = 'student' | 'faculty';
interface AdminUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  office: string;
  suspended: boolean;
}
type Filter = 'all' | UserRole;
type ActionType = 'delete' | 'suspend' | 'activate';
const FILTERS: Filter[] = ['all', 'student', 'faculty'];

const toUser = (u: ApiUser): AdminUser => ({
  id: String(u.userId),
  name: u.fullName ?? '',
  role: u.role === 'Faculty' ? 'faculty' : 'student',
  email: u.email ?? '',
  phone: u.phoneNumber ?? '',
  office: (u as any).officeLocation ?? '',
  suspended: u.accountStatus === 'Suspended',
});

export default function AdminUsers() {
  const { colors, t, isRTL } = useAppSettings();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [pending, setPending] = useState<{ user: AdminUser; action: ActionType } | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: users, loading, error, reload } = useFetch(async () => {
    const res = await adminApi.getUsers();
    if (!res.success || !res.data) throw new Error(res.message);
    return res.data.map(toUser);
  }, [] as AdminUser[]);

  const roleLabel = (role: UserRole) => (role === 'student' ? t('roleStudent') : t('roleFaculty'));
  const filterLabel = (f: Filter) => (f === 'all' ? t('all') : roleLabel(f));
  const roleColor = (role: UserRole) => (role === 'student' ? colors.accent : colors.success);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = filter === 'all' ? true : u.role === filter;
      const text = (u.name + ' ' + u.email).toLowerCase();
      return matchesRole && text.includes(q);
    });
  }, [users, query, filter]);

  const initials = (name: string) =>
    name.replace('Dr. ', '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  // ---------- confirm dialog (delete / suspend / activate) ----------
  const dialogTitle = () => {
    if (pending === null) return '';
    if (pending.action === 'delete') return t('deleteUserTitle');
    if (pending.action === 'suspend') return t('suspendUserTitle');
    return t('activateUserTitle');
  };
  const dialogMessage = () => {
    if (pending === null) return '';
    if (pending.action === 'delete') return t('deleteUserMessage');
    if (pending.action === 'suspend') return t('suspendUserMessage');
    return t('activateUserMessage');
  };
  const confirmLabel = () => {
    if (pending === null) return '';
    if (pending.action === 'delete') return t('delete');
    if (pending.action === 'suspend') return t('suspend');
    return t('activate');
  };
  const confirmColor = () => {
    if (pending === null) return colors.danger;
    if (pending.action === 'activate') return colors.success;
    if (pending.action === 'suspend') return colors.warning;
    return colors.danger;
  };

  const confirmAction = async () => {
    if (pending === null || busy) return;
    const { user, action } = pending;
    const role: UserRoleApi = user.role === 'faculty' ? 'Faculty' : 'Student';
    setBusy(true);
    try {
      const res =
        action === 'delete'
          ? await adminApi.deleteUser(user.id, role)
          : await adminApi.updateUserStatus(user.id, role, action === 'suspend' ? 'Suspended' : 'Active');
      if (!res.success) Alert.alert(t('error'), t('somethingWentWrong'));
      else reload();
    } catch {
      Alert.alert(t('error'), t('somethingWentWrong'));
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AdminHeader title={t('userManagement')} />

        <View style={[commonStyles.searchBox, styles.searchBox, { borderColor: colors.border, backgroundColor: colors.cardBackground }, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <TextInput
            style={[commonStyles.searchInput, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('searchUser')}
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={[commonStyles.chipsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[commonStyles.chip, { borderColor: colors.border }, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[commonStyles.chipText, { color: active ? colors.white : colors.textSecondary }]}>{filterLabel(f)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <DataState loading={loading} error={error} empty={visible.length === 0} emptyText={t('noUsersFound')} onRetry={reload}>
          {visible.map((u) => {
            const isSuspended = u.suspended;
            return (
              <View
                key={u.role + '-' + u.id}
                style={[
                  commonStyles.card, styles.card,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  isRTL && { flexDirection: 'row-reverse' },
                  isSuspended && { opacity: 0.65 },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: roleColor(u.role) + '33' }]}>
                  <Text style={[styles.avatarText, { color: roleColor(u.role) }]}>{initials(u.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[styles.nameRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.name, { color: colors.primary }]} numberOfLines={1}>{u.name}</Text>
                    <View style={[styles.badge, { backgroundColor: colors.pillBackground }]}>
                      <Text style={[styles.badgeText, { color: colors.primary }]}>{roleLabel(u.role)}</Text>
                    </View>
                    {isSuspended && (
                      <View style={[styles.badge, { backgroundColor: colors.warning + '2E' }]}>
                        <Text style={[styles.badgeText, { color: colors.warning }]}>{t('suspended')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.meta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>{u.email}</Text>
                  {u.office ? (
                    <Text style={[styles.meta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>{u.office}</Text>
                  ) : null}
                  {u.phone ? (<Text style={[styles.meta, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{u.phone}</Text>
                  ) : null}
                </View>

                <View style={[styles.actions, isRTL && { flexDirection: 'row-reverse' }]}>
                  {u.role === 'faculty' && (
                    <TouchableOpacity
                      style={[styles.iconBtn, { backgroundColor: (isSuspended ? colors.success : colors.warning) + '2E' }]}
                      activeOpacity={0.7}
                      onPress={() => setPending({ user: u, action: isSuspended ? 'activate' : 'suspend' })}
                    >
                      <Ionicons
                        name={isSuspended ? 'play-circle-outline' : 'pause-circle-outline'}
                        size={21}
                        color={isSuspended ? colors.success : colors.warning}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: colors.dangerLight }]}
                    activeOpacity={0.7}
                    onPress={() => setPending({ user: u, action: 'delete' })}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </DataState>
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Confirm dialog */}
      <Modal transparent animationType="fade" visible={pending !== null} onRequestClose={() => setPending(null)}>
        <View style={styles.overlay}>
          <View style={[styles.dialog, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{dialogTitle()}</Text>
            {pending !== null && (
              <Text style={[styles.dialogName, { color: colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>{pending.user.name}</Text>
            )}
            <Text style={[styles.dialogBody, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{dialogMessage()}</Text>
            <View style={[styles.dialogActions, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity style={[styles.dialogButton, { borderColor: colors.border, borderWidth: 1 }]} onPress={() => setPending(null)}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dialogButton, { backgroundColor: confirmColor(), opacity: busy ? 0.6 : 1 }]} onPress={confirmAction}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{confirmLabel()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AdminTabBar activeTab="users" onTabPress={(key) => router.replace(('/admin/' + key) as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBox: { marginBottom: 12 },
  card: { alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', borderRadius: 20, borderWidth: 1, padding: 20 },
  dialogTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  dialogName: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  dialogBody: { fontSize: 13, lineHeight: 19, marginBottom: 18 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  dialogButton: { flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});