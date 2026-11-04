const KNOWN = [
  'ALL_FIELDS_REQUIRED', 'INVALID_RATING', 'NO_COMPLETED_APPOINTMENT',
  'REVIEW_LIMIT_REACHED', 'REVIEW_MAX_REACHED', 'REVIEW_FAILED',
  'SLOT_FULL', 'SLOT_NOT_FOUND', 'SLOT_AVAILABLE', 'DAY_CLOSED', 'TIME_CONFLICT',
  'CANCEL_TOO_LATE', 'APPOINTMENT_NOT_CANCELLABLE', 'INVALID_CURRENT_PASSWORD',
  'CHAT_NOT_ALLOWED', 'STUDENT_ID_REQUIRED',
];

export const errorKey = (e: unknown) => {
  const code = e instanceof Error ? e.message : '';
  return KNOWN.includes(code) ? `err_${code}` : 'somethingWentWrong';
};