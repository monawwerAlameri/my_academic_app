import { request } from './api';
import { fromApiTime } from './doctor';
import { getStudentId } from './session';

// ---------- أدوات ----------
const call = async <T = any>(path: string, body: Record<string, any> = {}): Promise<T> => {
  const res = await request<{ data: T }>(`/student/${path}.php`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
};

const callAsStudent = async <T = any>(path: string, body: Record<string, any> = {}) =>
  call<T>(path, { student_id: await getStudentId(), ...body });

const truthy = (v: any) => v === true || Number(v) === 1;

const clockOf = (v: string) => {
  const s = v ?? '';
  return fromApiTime(s.includes(' ') ? s.split(' ')[1] : s);
};

// ---------- الحجوزات ----------
export interface Booking {
  id: string;
  doctor: string;
  location: string;
  datetime: string;
  isPast: boolean;
  status: string;
  type: string;
  subtype: string;
  canCancel: boolean;
  doctorId: string;
  startMs: number;
}

  const toBooking = (a: any, isPast: boolean, ids: Record<string, string>): Booking => {
  const start = new Date(`${a.appointment_date}T${a.appointment_time}`);
  return {
    id: String(a.appointment_id),
    doctor: a.doctor_name ?? '',
    location: a.location ?? '',
    datetime: `${a.appointment_date} - ${fromApiTime(a.appointment_time)} - ${fromApiTime(a.appointment_end_time)}`,
    isPast,
    status: a.status ?? '',
    type: a.appointment_type ?? '',
    subtype: a.consultation_type ?? '',
    canCancel: !isPast && start.getTime() - Date.now() > 30 * 60 * 1000,
    doctorId: a.faculty_id ? String(a.faculty_id) : ids[a.doctor_name] ?? '',
    startMs: start.getTime(),
  };
};


export const getBookings = async (): Promise<Booking[]> => {
  const [upcoming, previous, doctors] = await Promise.all([
    callAsStudent<any[]>('get_appointments'),
    callAsStudent<any[]>('get_previous_appointments'),
    getDoctors().catch(() => [] as Doctor[]),
  ]);
  const ids: Record<string, string> = {};
  doctors.forEach((d) => { ids[d.name] = d.id; });
  return [
    ...(upcoming ?? []).map((a) => toBooking(a, false, ids)),
    ...(previous ?? []).map((a) => toBooking(a, true, ids)),
  ];
};

export const cancelBooking = (id: string) =>
  callAsStudent('cancel_appointment', { appointment_id: Number(id) });

export interface SlotRequest {
  doctorId: string;
  date: string;
  start: string;
  end: string;
  type: string;
  subtype: string;
}

const slotBody = (d: SlotRequest) => ({
  faculty_id: d.doctorId,
  appointment_date: d.date,
  appointment_time: d.start,
  appointment_end_time: d.end,
  appointment_type: d.type,
  consultation_type: d.subtype,
});

export const createBooking = (d: SlotRequest) => callAsStudent('book_appointment', slotBody(d));

// ---------- الدكاترة والجدول ----------
export interface Doctor {
  id: string;
  name: string;
  office?: string;
  avgRating: number;
  reviewsCount: number;
}

export const getDoctors = async (): Promise<Doctor[]> => {
  const rows = ((await call<any[]>('get_doctors')) ?? []);
  return rows.map((d) => ({
    id: String(d.faculty_id),
    name: d.full_name ?? '',
    office: d.office_location ?? '',
    avgRating: Number(d.avg_rating ?? 0),
    reviewsCount: Number(d.reviews_count ?? 0),
  }));
};

export const searchDoctors = async (query: string): Promise<Doctor[]> => {
  const all = await getDoctors();
  const q = query.trim().toLowerCase();
  return q ? all.filter((d) => d.name.toLowerCase().includes(q)) : all;
};

export interface Slot {
  id: string;
  time: string;
  status: 'available' | 'full';
  date: string;
  start: string;
  end: string;
}
export interface DaySchedule { id: string; date: string; dayKey: string; slots: Slot[]; }

export const getDoctorSchedule = async (doctorId: string, type: string): Promise<DaySchedule[]> => {
  const rows = ((await call<any[]>('get_available_slots', { faculty_id: doctorId, appointment_type: type })) ?? []);
  const days = new Map<string, DaySchedule>();
  rows.forEach((r) => {
    if (!days.has(r.appointment_date)) {
      days.set(r.appointment_date, {
        id: r.appointment_date,
        date: r.appointment_date,
        dayKey: String(r.day_of_week ?? '').toLowerCase(),
        slots: [],
      });
    }
    days.get(r.appointment_date)!.slots.push({
      id: `${r.appointment_date}|${r.appointment_time}`,
      time: `${fromApiTime(r.appointment_time)} - ${fromApiTime(r.appointment_end_time)}`,
      status: truthy(r.is_full) ? 'full' : 'available',
      date: r.appointment_date,
      start: r.appointment_time,
      end: r.appointment_end_time,
    });
  });
  return Array.from(days.values());
};

// ---------- قائمة الانتظار ----------
export interface WaitingItem {
  id: string;
  doctor: string;
  type: string;
  subtype: string;
  time: string;
  aheadOfYou: number;
}

export const getWaitlist = async (): Promise<WaitingItem[]> => {
  const rows = ((await callAsStudent<any[]>('get_waiting_list')) ?? []);
  return rows.map((w) => ({
    id: String(w.waiting_id),
    doctor: w.doctor_name ?? '',
    type: w.appointment_type ?? '',
    subtype: w.consultation_type ?? '',
    time: `${clockOf(w.requested_time)} - ${clockOf(w.requested_end_time)}`,
    aheadOfYou: Number(w.ahead_of_you ?? 0),
  }));
};

export const joinWaitlist = (d: SlotRequest) => callAsStudent('join_waiting_list', slotBody(d));
export const leaveWaitlist = (id: string) => callAsStudent('leave_waiting_list', { waiting_id: Number(id) });

// ---------- الإشعارات ----------
export interface NotificationItem {
  id: string;
  titleKey: string;
  date: string;
  message: string;
  isRead: boolean;
}

const notifTitleKey = (type: string) => {
  const s = (type ?? '').toLowerCase();
  if (s.includes('cancel')) return 'notifCancellation';
  if (s.includes('wait')) return 'notifWaitlist';
  if (s.includes('remind')) return 'notifReminder';
  if (s.includes('book') || s.includes('confirm')) return 'notifStudentBooked';
  return 'notificationTitle';
};

const readMessage = (raw: string) => {
  try {
    const p = JSON.parse(raw);
    const when = [p.date, p.time ? fromApiTime(p.time) : ''].filter(Boolean).join(' ');
    return [p.doctor, when].filter(Boolean).join(' · ');
  } catch {
    return raw ?? '';
  }
};

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const rows = ((await callAsStudent<any[]>('get_notifications')) ?? []);
  return rows.map((n) => ({
    id: String(n.notification_id),
    titleKey: notifTitleKey(n.notification_type),
    date: String(n.notification_time ?? '').slice(0, 10),
    message: readMessage(n.message),
    isRead: truthy(n.is_read),
  }));
};

export const markNotificationsRead = () => callAsStudent('mark_notifications_read');

// ---------- المحادثات ----------
export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isNow: boolean;
}
export interface Message { id: string; from: 'me' | 'them'; text: string; time: string; }

export const getConversations = async (): Promise<Conversation[]> => {
  const rows = ((await callAsStudent<any[]>('get_conversations')) ?? []);
  return rows.map((c) => ({
    id: String(c.faculty_id),
    name: c.doctor_name ?? '',
    lastMessage: c.last_message ?? (c.last_attachment_type ? '📎' : ''),
    time: clockOf(c.last_message_time ?? ''),
    unread: Number(c.unread_count ?? 0),
    isNow: truthy(c.is_now),
  }));
};

export const getMessages = async (chatId: string): Promise<Message[]> => {
  const rows = ((await callAsStudent<any[]>('get_messages', { faculty_id: chatId })) ?? []);
  return rows.map((m) => ({
    id: String(m.message_id),
    from: truthy(m.is_mine) ? 'me' : 'them',
    text: m.message_text || m.attachment_name || '',
    time: clockOf(m.sent_at ?? ''),
  }));
};

export const sendMessage = (chatId: string, text: string) =>
  callAsStudent('send_message', { faculty_id: chatId, message_text: text });

// ---------- التقييمات ----------
export interface Review {
  id: string;
  name: string;
  anonymous: boolean;
  rating: number;
  comment: string;
  date: string;
}

export const getDoctorReviews = async (doctorId: string): Promise<Review[]> => {
  const rows = ((await call<any[]>('get_reviews', { faculty_id: doctorId })) ?? []);
  return rows.map((r) => ({
    id: String(r.review_id),
    name: r.reviewer_name ?? '',
    anonymous: truthy(r.is_anonymous) || !r.reviewer_name,
    rating: Number(r.rating),
    comment: r.comment ?? '',
    date: r.review_date ?? '',
  }));
};

export const submitReview = (
  doctorId: string,
  data: { rating: number; comment: string; anonymous: boolean }
) =>
  callAsStudent('add_review', {
    faculty_id: doctorId,
    rating: data.rating,
    comment: data.comment,
    is_anonymous: data.anonymous ? 1 : 0,
  });

// ---------- الحساب ----------
export interface Profile { fullName: string; email: string; phone: string; }

export const getProfile = async (): Promise<Profile> => {
  const d = await callAsStudent<any>('get_profile');
  return { fullName: d?.full_name ?? '', email: d?.email ?? '', phone: d?.phone_number ?? '' };
};

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  callAsStudent('change_password', { current_password: data.currentPassword, new_password: data.newPassword });
// ---------- التسجيل والدخول ----------
export const studentLogin = (student_id: string, password: string) =>
  call<{ phone_number: string; full_name: string; code: string }>('login', { student_id, password });

export const studentOtpSend = (phone_number: string) =>
  call<{ code: string }>('otp_send', { phone_number });

export const studentVerify = (phone_number: string, code: string) =>
  call('verify', { phone_number, code });

export const studentRegister = (d: {
  student_id: string; full_name: string; phone_number: string; email: string; password: string;
}) => call('register', d);