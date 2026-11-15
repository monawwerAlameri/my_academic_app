
import { BASE_URL } from './api';

const ADMIN_URL = BASE_URL + '/admin';

export const ADMIN_ENDPOINTS = {
  login: ADMIN_URL + '/login.php',
  verifyLogin: ADMIN_URL + '/verify_login.php',
  logout: ADMIN_URL + '/logout.php',
  getUsers: ADMIN_URL + '/get_users.php',
  addDoctor: ADMIN_URL + '/add_doctor.php',
  deleteUser: ADMIN_URL + '/delete_user.php',
  updateUserStatus: ADMIN_URL + '/update_user_status.php',
  getAppointments: ADMIN_URL + '/get_appointments.php',
  getDashboard: ADMIN_URL + '/get_dashboard.php',
  getReports: ADMIN_URL + '/get_reports.php',
  getReviews: ADMIN_URL + '/get_reviews.php',
  addUser: ADMIN_URL + '/add_user.php',
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
export interface AdminLoginStartData { email: string; expiresInSeconds: number; devCode?: string }
export interface ApiUser { userId: string; fullName: string; email: string; phoneNumber: string; role: string; accountStatus: string }
export interface AddDoctorData { facultyId: string; fullName: string; department: string; email: string; temporaryPassword: string }
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
export interface DoctorReviewItem { reviewId: number | string; reviewerName: string; rating: number; comment: string; reviewDate: string }
export interface DoctorReviewsData extends DoctorRatingSummary { reviews: DoctorReviewItem[] }

async function request<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
   const res = await fetch(url, { credentials: 'include', ...init });
  try {
    return JSON.parse(await res.text());
  } catch {
    return { success: false, message: 'Server error', data: null };
  }
}

function post<T>(url: string, body: object) {
  return request<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const adminApi = {
  login: (username: string, password: string) =>
    post<AdminLoginStartData>(ADMIN_ENDPOINTS.login, { username, password }),
  verifyLogin: (code: string) =>
    post<AdminLoginData>(ADMIN_ENDPOINTS.verifyLogin, { code }),
  logout: () => post<null>(ADMIN_ENDPOINTS.logout, {}),
  getUsers: () => request<ApiUser[]>(ADMIN_ENDPOINTS.getUsers),

  addDoctor: (fullName: string, email: string, department: string) =>
    post<AddDoctorData>(ADMIN_ENDPOINTS.addDoctor, { fullName, email, department }),
  deleteUser: (userId: string, role: UserRoleApi) =>
    post<{ userId: string; role: string }>(ADMIN_ENDPOINTS.deleteUser, { userId, role }),
  updateUserStatus: (userId: string, role: UserRoleApi, accountStatus: AccountStatus) =>
    post<{ userId: string; role: string; accountStatus: string }>(ADMIN_ENDPOINTS.updateUserStatus, { userId, role, accountStatus }),
  getAppointments: (status?: AppointmentStatusApi) =>
    request<ApiAppointment[]>(status ? ADMIN_ENDPOINTS.
        getAppointments + '?status=' + status : ADMIN_ENDPOINTS.getAppointments),
  getDashboard: () => request<DashboardData>(ADMIN_ENDPOINTS.getDashboard),
  getReports: () => request<ReportsData>(ADMIN_ENDPOINTS.getReports),
  getReviews: () => request<DoctorRatingSummary[]>(ADMIN_ENDPOINTS.getReviews),
  getDoctorReviews: (facultyId: string) =>
    request<DoctorReviewsData>(ADMIN_ENDPOINTS.getReviews + '?faculty_id=' + facultyId),
};

