import { BASE_URL } from './api';
import { getAdminId } from './session';

const ADMIN_URL = BASE_URL + '/admin';

export const ADMIN_ENDPOINTS = {
  login: ADMIN_URL + '/login.php',
  verifyLogin: ADMIN_URL + '/verify_login.php',
  logout: ADMIN_URL + '/logout.php',
  getUsers: ADMIN_URL + '/get_users.php',
  deleteUser: ADMIN_URL + '/delete_user.php',
  updateUserStatus: ADMIN_URL + '/update_user_status.php',
  getAppointments: ADMIN_URL + '/get_appointments.php',
  getDashboard: ADMIN_URL + '/get_dashboard.php',
  getReports: ADMIN_URL + '/get_reports.php',
  getReviews: ADMIN_URL + '/get_reviews.php',
  deleteReview: ADMIN_URL + '/delete_review.php',
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export type UserRoleApi = 'Student' | 'Faculty';
export type AccountStatus = 'Active' | 'Suspended';
export type AppointmentStatusApi = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface AdminLoginData { adminId: string; fullName: string; email: string }
export interface AdminLoginStartData { adminId: string; email: string; expiresInSeconds: number; devCode?: string }
export interface ApiUser { userId: string; fullName: string; email: string; phoneNumber: string; role: string; accountStatus: string }
export interface ApiAppointment {
  appointmentId: number | string; studentName: string; facultyName: string; appointmentDate: string;
  appointmentTime: string; appointmentType: string; consultationType: string; status: string; location: string;
}

export interface DashboardAttentionItem {
  appointmentId: number | string; studentName: string; facultyName: string;
  appointmentDate: string; appointmentTime: string;
}
export interface DashboardData {
  totalUsers: number; students: number; faculty: number; pendingAppointments: number;
  needsAttention: DashboardAttentionItem[];
}

export interface ReportRow { label: string; count: number; percentage: number }
export interface TopDoctor { facultyId: string; fullName: string; averageRating: number; reviewCount: number }
export interface ReportsData {
  totalAppointments: number; appointmentsByStatus: ReportRow[]; onlineVsInPerson: ReportRow[];
  consultationTypes: ReportRow[]; topRatedDoctors: TopDoctor[];
}

export interface DoctorRatingSummary { facultyId: string; fullName: string; averageRating: number | null; reviewCount: number }
export interface DoctorReviewItem {
  reviewId: number | string; reviewerName: string; rating: number; comment: string; reviewDate: string;
  studentId?: string; studentName?: string; isAnonymous?: boolean;
}
export interface DoctorReviewsData extends DoctorRatingSummary { reviews: DoctorReviewItem[] }

// الباك ما يستخدم session: كل طلب أدمن لازم يحمل admin_id (في الرابط لـ GET وفي الـ body لـ POST)
const withAdminId = (url: string) =>
  url + (url.includes('?') ? '&' : '?') + 'admin_id=' + encodeURIComponent(getAdminId());

async function request<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, init);
  try {
    return JSON.parse(await res.text());
  } catch {
    return { success: false, message: 'Server error', data: null };
  }
}

function get<T>(url: string) {
  return request<T>(withAdminId(url));
}

function post<T>(url: string, body: object, withId = true) {
  return request<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(withId ? { admin_id: getAdminId(), ...body } : body),
  });
}

export const adminApi = {
  login: (username: string, password: string) =>
    post<AdminLoginStartData>(ADMIN_ENDPOINTS.login, { username, password }, false),
  verifyLogin: (adminId: string, code: string) =>
    post<AdminLoginData>(ADMIN_ENDPOINTS.verifyLogin, { admin_id: adminId, code }, false),
  logout: () => post<null>(ADMIN_ENDPOINTS.logout, {}, false),
  getUsers: () => get<ApiUser[]>(ADMIN_ENDPOINTS.getUsers),

  deleteUser: (userId: string, role: UserRoleApi) =>
    post<{ userId: string; role: string }>(ADMIN_ENDPOINTS.deleteUser, { userId, role }),
  updateUserStatus: (userId: string, role: UserRoleApi, accountStatus: AccountStatus) =>
    post<{ userId: string; role: string; accountStatus: string }>(ADMIN_ENDPOINTS.updateUserStatus, { userId, role, accountStatus }),
  getAppointments: (status?: AppointmentStatusApi) =>
    get<ApiAppointment[]>(status ? ADMIN_ENDPOINTS.getAppointments + '?status=' + status : ADMIN_ENDPOINTS.getAppointments),
  getDashboard: () => get<DashboardData>(ADMIN_ENDPOINTS.getDashboard),
  getReports: () => get<ReportsData>(ADMIN_ENDPOINTS.getReports),
  getReviews: () => get<DoctorRatingSummary[]>(ADMIN_ENDPOINTS.getReviews),
  getDoctorReviews: (facultyId: string) =>
    get<DoctorReviewsData>(ADMIN_ENDPOINTS.getReviews + '?faculty_id=' + facultyId),
  deleteReview: (reviewId: number | string) =>
    post<{ reviewId: number }>(ADMIN_ENDPOINTS.deleteReview, { reviewId }),
};