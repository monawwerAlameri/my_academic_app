import { router } from 'expo-router';
import { clearSession, getFacultyToken } from './session';

export const SERVER_IP = 'MY_IP';
export const BASE_URL = 'http://' + SERVER_IP + '/my_academic_app/backend';

export class ApiError extends Error {
  code: string;
  data?: any;
  constructor(code: string, data?: any) {
    super(code);
    this.code = code;
    this.data = data;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // الـ token يُرسل لملفات الدكتور فقط
  const token = path.startsWith('/Faculty/') ? getFacultyToken() : '';
  const authHeader: Record<string, string> = token ? { Authorization: 'Bearer ' + token } : {};

  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options.headers as Record<string, string>),
    },
  });

  const json = await res.json();
  if (json.success === false) {
    // الـ token منتهي أو غير موجود: نرجع لشاشة الدخول
    if (json.code === 'UNAUTHORIZED') {
      clearSession();
      router.replace('/login');
    }
    throw new ApiError(json.code ?? json.message ?? 'REQUEST_FAILED', json.data);
  }
  return json as T;
}