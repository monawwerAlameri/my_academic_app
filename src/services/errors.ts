const KNOWN = ['ALL_FIELDS_REQUIRED', 'INVALID_RATING', 'NO_COMPLETED_APPOINTMENT', 'REVIEW_LIMIT_REACHED', 'REVIEW_FAILED'];

export const errorKey = (e: unknown) => {
  const code = e instanceof Error ? e.message : '';
  return KNOWN.includes(code) ? `err_${code}` : 'somethingWentWrong';
};