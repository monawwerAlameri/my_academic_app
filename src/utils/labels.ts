export const appointmentLabel = (type: string, subtype: string, t: (key: any) => string) => {
  const typeLabel = type === 'Online' ? t('onlineAppointment') : t('inPersonAppointment');
  const subtypeLabel =
    subtype === 'Questions' ? t('optQuestions')
    : subtype === 'Project Discussion' ? t('optProjectDiscussion')
    : t('optOther');
  return `${typeLabel} - ${subtypeLabel}`;
};