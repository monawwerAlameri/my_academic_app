import { request, upload } from './api';
import { getFacultyId } from './session';
import { Attachment, PickedFile, appendFile, toAttachment } from '../utils/attachments';

export type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday';

// ---------- أدوات الوقت ----------
export const fromApiTime = (s: string) => {
  const [hh, mm] = (s ?? '').split(':');
  let h = parseInt(hh, 10);
  if (isNaN(h)) return '';
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${mm} ${ap}`;
};

export const toApiTime = (input: string): string | null => {
  const m = input.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm|ص|م)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3];
  if ((ap === 'pm' || ap === 'م') && h < 12) h += 12;
  if ((ap === 'am' || ap === 'ص') && h === 12) h = 0;
  if (h > 23 || parseInt(min, 10) > 59) return null;
  return `${String(h).padStart(2, '0')}:${min}:00`;
};

// ---------- المواعيد ----------
export interface FacultyAppointment {
  id: string;
  studentName: string;
  date: string;
  time: string;
  isOnline: boolean;
  consultationKey: 'optQuestions' | 'optProjectDiscussion' | 'optOther';
  status: string;
  isPast: boolean;
}

const consultationKey = (v: string): FacultyAppointment['consultationKey'] => {
  const s = (v ?? '').toLowerCase();
  if (s.includes('question')) return 'optQuestions';
  if (s.includes('project')) return 'optProjectDiscussion';
  return 'optOther';
};

export const getFacultyAppointments = async (): Promise<FacultyAppointment[]> => {
  const fid = await getFacultyId();
  const res = await request<{ data: any[] }>(`/Faculty/get_appointments.php?faculty_id=${encodeURIComponent(fid)}`);
  return (res.data ?? []).map((a) => ({
    id: String(a.appointment_id),
    studentName: a.student_name ?? '',
    date: a.appointment_date,
    time: fromApiTime(a.appointment_time),
    isOnline: String(a.appointment_type ?? '').toLowerCase().includes('online'),
    consultationKey: consultationKey(a.consultation_type),
    status: a.status,
    isPast: a.status !== 'Booked',
  }));
};

export const cancelFacultyAppointment = async (appointmentId: string, reason?: string) =>
  request<void>('/Faculty/cancel_appointment.php', {
    method: 'POST',
    body: JSON.stringify({ appointment_id: Number(appointmentId), faculty_id: await getFacultyId(), reason }),
  });

export const cancelAllOnDate = async (date: string, reason?: string) =>
  request<void>('/Faculty/cancel_all_appointments.php', {
    method: 'POST',
    body: JSON.stringify({ faculty_id: await getFacultyId(), appointment_date: date, reason }),
  });

export const getClosedDates = async (): Promise<string[]> => {
  const fid = await getFacultyId();
  const res = await request<{ data: any[] }>(`/Faculty/get_closed_dates.php?faculty_id=${encodeURIComponent(fid)}`);
  return (res.data ?? []).map((d) => String(d.closed_date));
};

export const reopenDate = async (date: string) =>
  request<void>('/Faculty/reopen_date.php', {
    method: 'POST',
    body: JSON.stringify({ faculty_id: await getFacultyId(), closed_date: date }),
  });

// ---------- الجدول ----------
export interface ScheduleSlot {
  id: string;
  day: DayKey;
  time: string;
  isOnline: boolean;
  location: string;
}

export const getSchedule = async (): Promise<ScheduleSlot[]> => {
  const fid = await getFacultyId();
  const res = await request<{ data: any[] }>(`/Faculty/get_schedule.php?faculty_id=${encodeURIComponent(fid)}`);
  return (res.data ?? []).map((s) => ({
    id: String(s.schedule_id),
    day: String(s.day_of_week).toLowerCase() as DayKey,
    time: `${fromApiTime(s.start_time)} - ${fromApiTime(s.end_time)}`,
    isOnline: String(s.appointment_type ?? '').toLowerCase().includes('online'),
    location: s.location ?? '',
  }));
};

export const addSlot = async (d: { day: DayKey; start: string; end: string; isOnline: boolean; location: string }) =>
  request<void>('/Faculty/create_schedule.php', {
    method: 'POST',
    body: JSON.stringify({
      faculty_id: await getFacultyId(),
      day_of_week: d.day.charAt(0).toUpperCase() + d.day.slice(1),
      start_time: d.start,
      end_time: d.end,
      appointment_type: d.isOnline ? 'Online' : 'In-Person',
      location: d.isOnline ? 'Online' : d.location,
    }),
  });

export const deleteSlot = async (scheduleId: string) =>
  request<void>('/Faculty/delete_schedule.php', {
    method: 'POST',
    body: JSON.stringify({ schedule_id: Number(scheduleId), faculty_id: await getFacultyId() }),
  });

// ---------- التقييمات ----------
export interface FacultyReview {
  id: string;
  studentName: string;
  anonymous: boolean;
  rating: number;
  date: string;
  comment: string;
}

export const getFacultyReviews = async (): Promise<FacultyReview[]> => {
  const fid = await getFacultyId();
  const res = await request<{ data: any[] }>(`/Faculty/get_reviews.php?faculty_id=${encodeURIComponent(fid)}`);
  return (res.data ?? []).map((r) => ({
    id: String(r.review_id),
    studentName: r.student_name ?? '',
    anonymous: Number(r.is_anonymous) === 1 || !r.student_name,
    rating: Number(r.rating),
    date: r.review_date,
    comment: r.comment,
  }));
};

// ---------- الإشعارات ----------
export interface FacultyNotification { id: string; type: string; message: string; time: string; }
const readNotifMessage = (raw: string) => {
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === 'object') {
      const when = [p.date, p.time ? fromApiTime(p.time) : ''].filter(Boolean).join(' ');
      return [p.student ?? p.student_name ?? p.doctor, when, p.reason].filter(Boolean).join(' · ');
    }
  } catch {}
  return raw ?? '';
};
export const getFacultyNotifications = async (): Promise<FacultyNotification[]> => {
  const fid = await getFacultyId();
  const res = await request<{ data: any[] }>(`/Faculty/get_notifications.php?faculty_id=${encodeURIComponent(fid)}`);
  return (res.data ?? []).map((n) => ({
    id: String(n.notification_id),
    type: n.notification_type,
    message: readNotifMessage(n.message),
    time: n.notification_time,
  }));
};

// ---------- الحساب ----------
export interface FacultyProfile { fullName: string; email: string; phone: string; office: string; }

export const getFacultyProfile = async (): Promise<FacultyProfile> => {
  const fid = await getFacultyId();
  const res = await request<{ data: any }>(`/Faculty/get_profile.php?faculty_id=${encodeURIComponent(fid)}`);
  return {
    fullName: res.data?.full_name ?? '',
    email: res.data?.email ?? '',
    phone: res.data?.phone_number ?? '',
    office: res.data?.office_location ?? '',
  };
};

export const updateFacultyProfile = async (p: FacultyProfile) =>
  request<void>('/Faculty/update_profile.php', {
    method: 'POST',
    body: JSON.stringify({
      faculty_id: await getFacultyId(),
      full_name: p.fullName,
      email: p.email,
      phone_number: p.phone,
      office_location: p.office,
    }),
  });

 

 export const facultyLogin = async (faculty_id: string, password: string) => {
  const res = await request<{ data: { faculty_id: string; email: string; full_name: string } }>('/Faculty/login.php', {
    method: 'POST',
    body: JSON.stringify({ faculty_id, password }),
  });
  return res.data;
};

export const facultyVerify = async (faculty_id: string, code: string) => {
  const res = await request<{ data: { faculty_id: string; full_name: string } }>('/Faculty/verify.php', {
    method: 'POST',
    body: JSON.stringify({ faculty_id, code }),
  });
  return res.data;
};

  export const changeFacultyPassword = async (d: { currentPassword: string; newPassword: string }) =>
  request<void>('/Faculty/change_password.php', {
    method: 'POST',
    body: JSON.stringify({
      faculty_id: await getFacultyId(),
      current_password: d.currentPassword,
      new_password: d.newPassword,
    }),
  });

  // ---------- المحادثات ----------
export interface FacultyConversation { id: string; name: string; lastMessage: string; time: string; isNow: boolean; }
export interface FacultyMessage { id: string; from: 'me' | 'them'; text: string; time: string; attachment?: Attachment; }

const clockOf = (v: string) => {
  const s = v ?? '';
  return fromApiTime(s.includes(' ') ? s.split(' ')[1] : s);
};

export const getFacultyConversations = async (): Promise<FacultyConversation[]> => {
  const fid = await getFacultyId();
  const res = await request<{ data: any[] }>('/Faculty/get_conversations.php?faculty_id=' + encodeURIComponent(fid));
  return (res.data ?? []).map((c) => ({
    id: String(c.student_id),
    name: c.student_name ?? c.full_name ?? '',
    lastMessage: c.last_message ?? '',
    time: clockOf(c.last_message_time ?? c.last_active ?? ''),
    isNow: c.is_now === true || Number(c.is_now) === 1,
  }));
};
export const getFacultyMessages = async (studentId: string): Promise<FacultyMessage[]> => {
  const fid = await getFacultyId();
  const res = await request<{ data: any[] }>(
    '/Faculty/get_messages.php?faculty_id=' + encodeURIComponent(fid) + '&student_id=' + encodeURIComponent(studentId)
  );
  return (res.data ?? []).map((m) => ({
    id: String(m.message_id),
    from: String(m.sender_type ?? '').toLowerCase() === 'student' ? 'them' : 'me',
    text: m.message_text ?? '',
    time: clockOf(m.sent_at ?? ''),
    attachment: toAttachment(m),
  }));
};

export const sendFacultyMessage = async (studentId: string, text: string, file?: PickedFile) => {
  const fid = await getFacultyId();
  if (!file) {
    return request<void>('/Faculty/send_message.php', {
      method: 'POST',
      body: JSON.stringify({ faculty_id: fid, student_id: studentId, message_text: text }),
    });
  }
  const form = new FormData();
  form.append('student_id', studentId);
  form.append('message_text', text);
  appendFile(form, file);
  return upload<void>('/Faculty/send_message.php?faculty_id=' + encodeURIComponent(fid), form);
};

  