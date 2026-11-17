const KNOWN = [
  'ALL_FIELDS_REQUIRED', 'INVALID_RATING', 'NO_COMPLETED_APPOINTMENT',
  'REVIEW_LIMIT_REACHED', 'REVIEW_MAX_REACHED', 'REVIEW_FAILED',
  'SLOT_FULL', 'SLOT_NOT_FOUND', 'SLOT_AVAILABLE', 'DAY_CLOSED', 'TIME_CONFLICT',
  'CANCEL_TOO_LATE', 'APPOINTMENT_NOT_CANCELLABLE', 'INVALID_CURRENT_PASSWORD',
  'CHAT_NOT_ALLOWED', 'STUDENT_ID_REQUIRED',
  // الدخول والتسجيل (backend/student/login, send_otp, verify, register)
  'LOGIN_FIELDS_REQUIRED', 'INVALID_CREDENTIALS', 'ACCOUNT_NOT_ACTIVE',
  'TOO_MANY_REQUESTS', 'OTP_SEND_FAILED', 'EMAIL_REQUIRED', 'INVALID_UNIVERSITY_EMAIL',
  'VERIFICATION_REQUIRED', 'INVALID_CODE', 'CODE_ALREADY_USED', 'CODE_EXPIRED',
  'INVALID_STUDENT_ID', 'INVALID_EMAIL', 'INVALID_PHONE_FORMAT', 'EMAIL_NOT_VERIFIED',
  'ALREADY_REGISTERED', 'EMAIL_BANNED', 'REGISTER_FAILED', 'STUDENT_NOT_FOUND',
  'NO_PENDING_LOGIN', 'CODE_NOT_SENT', 'MUST_AGREE',
  // الدكتور (backend/Faculty)
  'UNAUTHORIZED', 'FACULTY_NOT_FOUND', 'FACULTY_NOT_ACTIVE', 'APPOINTMENT_NOT_FOUND',
  'CANCEL_FAILED', 'INVALID_DATE', 'PAST_DATE', 'DATE_NOT_CLOSED', 'SCHEDULE_NOT_FOUND',
  'SAVE_FAILED', 'SERVER_MISCONFIGURED',
  'APPOINTMENT_ID_REQUIRED', 'APPOINTMENT_NOT_FOUND', 'BOOKING_FAILED', 'CANCEL_FAILED',
  'FACULTY_ID_REQUIRED', 'FACULTY_NOT_ACTIVE', 'FACULTY_NOT_FOUND',
  'INVALID_APPOINTMENT_TYPE', 'INVALID_CONSULTATION_TYPE',
  'JOIN_FAILED', 'LEAVE_FAILED', 'WAITING_ID_REQUIRED', 'WAITING_NOT_FOUND',
  'MESSAGE_REQUIRED', 'MESSAGE_FAILED', 'FILE_TOO_LARGE', 'INVALID_FILE_TYPE', 'UPLOAD_FAILED',
  'INVALID_FACULTY_EMAIL',
  'MARK_READ_FAILED', 'PASSWORD_CHANGE_FAILED', 'PHONE_ALREADY_USED', 'PHONE_UPDATE_FAILED',
    'INVALID_TIME_RANGE', 'LOCATION_TOO_LONG', 'SCHEDULE_OVERLAP',
];

export const errorKey = (e: unknown) => {
  if (e instanceof TypeError && /network/i.test(e.message)) return 'err_NETWORK';
    if (e instanceof Error && /^HTTP_\d+$/.test(e.message)) return 'err_SERVER_ERROR';
  const code = e instanceof Error ? e.message : '';
  return KNOWN.includes(code) ? `err_${code}` : 'somethingWentWrong';
};

// ملفات الأدمن ترجع نص رسالة (message) وليس كود، فنحوّل الرسائل المعروفة إلى أكواد
const ADMIN_MESSAGES: Record<string, string> = {
  'Username and password are required': 'LOGIN_FIELDS_REQUIRED',
  'Invalid username or password': 'INVALID_CREDENTIALS',
  'Invalid verification code': 'INVALID_CODE',
  'Verification code expired. Please log in again.': 'CODE_EXPIRED',
  'No pending login. Please log in again.': 'NO_PENDING_LOGIN',
  'Failed to send the verification code': 'OTP_SEND_FAILED',
  'Too many attempts. Try again later.': 'TOO_MANY_REQUESTS',
};

export const adminErrorKey = (message?: string | null) => {
  const code = message ? ADMIN_MESSAGES[message] : undefined;
  return code ? `err_${code}` : 'somethingWentWrong';
};

// عدد ثواني الحظر: الطالب يرجّع retry_after_seconds والأدمن retryAfterSeconds
export const retrySeconds = (source: unknown): number => {
  const d = (source as any)?.data;
  const n = Number(d?.retry_after_seconds ?? d?.retryAfterSeconds);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

