// endpoints الأدمن + دوال الاتصال بالباك اند (backend/admin).
// غيّري SERVER_IP لـ IPv4 حق اللابتوب اللي شغال عليه XAMPP (من أمر ipconfig).
// الجوال واللابتوب لازم على نفس الواي فاي، ولو تغيرت الشبكة يتغير الـ IP.
export const SERVER_IP = 'YOUR_IP';
export const BASE_URL = 'http://' + SERVER_IP + '/my_academic_app/backend/admin';

export const ADMIN_ENDPOINTS = {
  login: BASE_URL + '/login.php',
  getUsers: BASE_URL + '/get_users.php',
  addDoctor: BASE_URL + '/add_doctor.php',
  deleteUser: BASE_URL + '/delete_user.php',
  updateUserStatus: BASE_URL + '/update_user_status.php',
  getAppointments: BASE_URL + '/get_appointments.php',
  getDashboard: BASE_URL + '/get_dashboard.php',
  getReports: BASE_URL + '/get_reports.php',
  getReviews: BASE_URL + '/get_reviews.php',
  addUser: BASE_URL + '/add_user.php', // احتياطي، الواجهة الحالية ما تستخدمه
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null; // عند الفشل: success=false و data=null
}

export type UserRoleApi = 'Student' | 'Faculty';
export type AccountStatus = 'Active' | 'Suspended';
export type AppointmentStatusApi = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface AdminLoginData { adminId: string; fullName: string; email: string }
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
  return res.json();
}

function post<T>(url: string, body: object) {
  return request<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const adminApi = {
  login: (email: string, password: string) =>
    post<AdminLoginData>(ADMIN_ENDPOINTS.login, { email, password }),
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