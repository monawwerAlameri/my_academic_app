// بيانات وهمية للأدمن — تنشال وتنربط بالباك اند لاحقاً.

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

export const initialUsers: AdminUser[] = [
  { id: 'u1', name: 'Nora Abdullah', role: 'student', email: 'nora.abdullah@example.com', joinedOn: '12-02-2026' },
  { id: 'u2', name: 'Ahmed Alharbi', role: 'student', email: 'ahmed.alharbi@example.com', joinedOn: '10-02-2026' },
  { id: 'u3', name: 'Dr. Sara Ahmed', role: 'faculty', email: 'sara.ahmed@university.edu', joinedOn: '05-01-2026', department: 'Computer Science' },
  { id: 'u4', name: 'Dr. Reem Khalid', role: 'faculty', email: 'reem.khalid@university.edu', joinedOn: '03-01-2026', department: 'Computer Science' },
  { id: 'u5', name: 'Admin User', role: 'admin', email: 'admin@university.edu', joinedOn: '01-01-2026' },
];

export const appointments: AdminAppointment[] = [
  { id: 'a1', student: 'Nora Abdullah', doctor: 'Dr. Sara Ahmed', date: '05 May 2026', time: '10:00 AM', format: 'inPerson', consultation: 'questions', status: 'confirmed' },
  { id: 'a2', student: 'Layan Ahmed', doctor: 'Dr. Reem Khalid', date: '05 May 2026', time: '11:00 AM', format: 'online', consultation: 'projectDiscussion', status: 'pending' },
  { id: 'a3', student: 'Salma Mohamed', doctor: 'Dr. Layan Ahmed', date: '06 May 2026', time: '09:00 AM', format: 'inPerson', consultation: 'questions', status: 'confirmed' },
  { id: 'a4', student: 'Fatimah Abdullah', doctor: 'Dr. Sara Ahmed', date: '06 May 2026', time: '02:00 PM', format: 'online', consultation: 'other', status: 'pending' },
  { id: 'a5', student: 'Sultan Khalid', doctor: 'Dr. Reem Khalid', date: '07 May 2026', time: '01:00 PM', format: 'inPerson', consultation: 'projectDiscussion', status: 'completed' },
  { id: 'a6', student: 'Deem Omar', doctor: 'Dr. Sara Ahmed', date: '07 May 2026', time: '11:00 AM', format: 'inPerson', consultation: 'questions', status: 'completed' },
  { id: 'a7', student: 'Najlaa Saleh', doctor: 'Dr. Laila Saud', date: '08 May 2026', time: '09:30 AM', format: 'online', consultation: 'other', status: 'completed' },
];

export const doctorRatings: DoctorRating[] = [
  { id: 'd1', name: 'Dr. Sara Ahmed', rating: 4.7, reviews: 128 },
  { id: 'd2', name: 'Dr. Reem Khalid', rating: 4.5, reviews: 96 },
  { id: 'd3', name: 'Dr. Laila Saud', rating: 4.3, reviews: 71 },
];

export const doctorReviews: DoctorReview[] = [
  { id: 'r1', doctorId: 'd1', student: 'Sara Almutairi', rating: 5, comment: 'Explains complex topics in a very clear and simple way.', date: '13-05-2026', anonymous: false },
  { id: 'r2', doctorId: 'd1', student: 'Reem Omar', rating: 5, comment: 'One of the best professors I have had. Very supportive and approachable.', date: '14-05-2026', anonymous: false },
  { id: 'r3', doctorId: 'd1', student: 'Salma Ali', rating: 4, comment: 'Great lecturer. The feedback helps a lot in improving.', date: '16-05-2026', anonymous: true },
  { id: 'r4', doctorId: 'd2', student: 'Layan Ahmed', rating: 5, comment: 'Always available and answers every question patiently.', date: '10-05-2026', anonymous: false },
  { id: 'r5', doctorId: 'd2', student: 'Nora Abdullah', rating: 4, comment: 'Helpful during the project discussion.', date: '11-05-2026', anonymous: true },
  { id: 'r6', doctorId: 'd3', student: 'Fatimah Abdullah', rating: 4, comment: 'Clear explanations, but appointments fill up quickly.', date: '09-05-2026', anonymous: false },
  { id: 'r7', doctorId: 'd3', student: 'Deem Omar', rating: 5, comment: 'Very organized and respects the appointment time.', date: '12-05-2026', anonymous: true },
];

export const adminNotifications = [
  { id: 'n1', icon: 'person-add-outline', titleKey: 'adminNotifNewUserTitle', bodyKey: 'adminNotifNewUserBody', date: '12-02-2026' },
  { id: 'n2', icon: 'shield-checkmark-outline', titleKey: 'adminNotifConflictTitle', bodyKey: 'adminNotifConflictBody', date: '05-05-2026' },
  { id: 'n3', icon: 'people-outline', titleKey: 'adminNotifFullTitle', bodyKey: 'adminNotifFullBody', date: '05-05-2026' },
  { id: 'n4', icon: 'bar-chart-outline', titleKey: 'adminNotifReportTitle', bodyKey: 'adminNotifReportBody', date: '10-05-2026' },
] as const;