import { request } from './api';

export interface Booking { id: string; title: string; doctor: string; location: string; datetime: string; isPast: boolean; }
export interface WaitingItem { id: string; doctor: string; office: string; day: string; time: string; aheadOfYou: number; }
export interface NotificationItem { id: string; title: string; date: string; message: string; }
export interface Conversation { id: string; name: string; lastMessage: string; time: string; }
export interface Message { id: string; from: 'me' | 'them'; text: string; time: string; }
export interface Slot { id: string; time: string; status: 'available' | 'full'; }
export interface DaySchedule { id: string; label: string; slots: Slot[]; }
export interface Review { id: string; name: string; anonymous: boolean; rating: number; comment: string; date: string; }
export interface Doctor { id: string; name: string; office?: string; avgRating: number; reviewsCount: number; }
export interface Profile { fullName: string; email: string; phone: string; }

// الحجوزات
export const getBookings = () => request<Booking[]>('/student/bookings');
export const cancelBooking = (id: string) => request<void>(`/student/bookings/${id}`, { method: 'DELETE' });
export const createBooking = (data: { doctorId: string; slotId: string; type: string; subtype: string }) =>
  request<Booking>('/student/bookings', { method: 'POST', body: JSON.stringify(data) });

// الجدول
export const getDoctorSchedule = (doctorId: string) => request<DaySchedule[]>(`/doctors/${doctorId}/schedule`);

// قائمة الانتظار
export const getWaitlist = () => request<WaitingItem[]>('/student/waitlist');
export const joinWaitlist = (slotId: string) => request<void>('/student/waitlist', { method: 'POST', body: JSON.stringify({ slotId }) });
export const leaveWaitlist = (id: string) => request<void>(`/student/waitlist/${id}`, { method: 'DELETE' });

// الإشعارات
export const getNotifications = () => request<NotificationItem[]>('/student/notifications');
export const clearNotifications = () => request<void>('/student/notifications', { method: 'DELETE' });

// المحادثات
export const getConversations = () => request<Conversation[]>('/student/chats');
export const getMessages = (chatId: string) => request<Message[]>(`/student/chats/${chatId}/messages`);
export const sendMessage = (chatId: string, text: string) =>
  request<Message>(`/student/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ text }) });

// التقييمات
export const getDoctors = () => request<Doctor[]>('/doctors');
export const searchDoctors = (query: string) => request<Doctor[]>(`/doctors?search=${encodeURIComponent(query)}`);
export const getDoctorReviews = (doctorId: string) => request<Review[]>(`/doctors/${doctorId}/reviews`);
export const submitReview = (doctorId: string, data: { rating: number; comment: string; anonymous: boolean }) =>
  request<Review>(`/doctors/${doctorId}/reviews`, { method: 'POST', body: JSON.stringify(data) });

// الحساب
export const getProfile = () => request<{ fullName: string; email: string; phone: string }>('/student/profile');
export const updateProfile = (data: { fullName: string; email: string; phone: string }) =>
  request<void>('/student/profile', { method: 'PUT', body: JSON.stringify(data) });
export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  request<void>('/student/password', { method: 'PUT', body: JSON.stringify(data) });


