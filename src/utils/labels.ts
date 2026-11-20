export const appointmentLabel = (type: string, subtype: string, t: (key: any) => string) => {
  const typeLabel = type === 'Online' ? t('onlineAppointment') : t('inPersonAppointment');
  const subtypeLabel =
    subtype === 'Questions' ? t('optQuestions')
    : subtype === 'Project Discussion' ? t('optProjectDiscussion')
    : t('optOther');
  return `${typeLabel} - ${subtypeLabel}`;
};

// حالة الموعد بعد انتهائه (تأكيد الحضور من الدكتور)
export const attendanceStatus = (status: string): { key: string; tone: 'success' | 'danger' | 'muted' } | null => {
  if (status === 'Completed') return { key: 'attended', tone: 'success' };
  if (status === 'Absent') return { key: 'notAttended', tone: 'danger' };
  if (status === 'Pending Confirmation') return { key: 'pendingAttendance', tone: 'muted' };
  if (status === 'Cancelled') return { key: 'statusCancelled', tone: 'danger' };
  return null;
};