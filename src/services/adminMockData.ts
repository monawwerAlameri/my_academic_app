import { TranslationKey } from '../i18n/translations';

export type UserRole = 'student' | 'faculty' | 'admin';
export type AppointmentStatus = 'confirmed' | 'pending' | 'completed';
export type AppointmentFormat = 'inPerson' | 'online';
export type ConsultationType = 'questions' | 'projectDiscussion' | 'other';

export interface AdminUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  joinedOn: string;
  suspended?: boolean;
  department?: string;
}

export interface AdminAppointment {
  id: string;
  student: string;
  doctor: string;
  date: string;
  time: string;
  format: AppointmentFormat;
  consultation: ConsultationType;
  status: AppointmentStatus;
}

export interface DoctorRating {
  id: string;
  name: string;
  rating: number;
  reviews: number;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  student: string;
  rating: number;
  comment: string;
  date: string;
  anonymous: boolean;
}

export interface AdminNotification {
  id: string;
  icon: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  date: string;
}

// القوائم فاضية، تنربط بالباك اند.
export const initialUsers: AdminUser[] = [];
export const appointments: AdminAppointment[] = [];
export const doctorRatings: DoctorRating[] = [];
export const doctorReviews: DoctorReview[] = [];
export const adminNotifications: AdminNotification[] = [];