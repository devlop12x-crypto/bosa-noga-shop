/**
 * Нормализует российский номер к виду +7XXXXXXXXXX (как в примере из задания).
 * Принимает «8 (912) 345-67-89», «+7 912 345 67 89», «9123456789».
 * null — номер не распознан.
 */
export const normalizeRuPhone = (raw: string): string | null => {
  if (/[^\d\s()+-]/.test(raw)) return null;
  if (raw.includes('+') && !raw.trim().startsWith('+')) return null;

  const digits = raw.replace(/\D/g, '');

  if (digits.length === 10 && digits.startsWith('9')) return `+7${digits}`;
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `+7${digits.slice(1)}`;
  }
  return null;
};
