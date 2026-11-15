// يحسب وقت الموعد بتوقيت الرياض (+03:00) مثل الباك، بغض النظر عن توقيت الجهاز
export const riyadhMs = (date: string, time: string): number => {
  const t = (time ?? '').length === 5 ? time + ':00' : time;
  return new Date(date + 'T' + t + '+03:00').getTime();
};