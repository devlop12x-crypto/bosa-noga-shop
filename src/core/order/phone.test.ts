import { describe, expect, it } from 'vitest';
import { normalizeRuPhone } from './phone';

describe('normalizeRuPhone', () => {
  it.each([
    ['+7 912 345-67-89', '+79123456789'],
    ['8 (912) 345-67-89', '+79123456789'],
    ['79123456789', '+79123456789'],
    ['9123456789', '+79123456789'],
    ['  +7(912)3456789 ', '+79123456789'],
  ])('%s → %s', (raw, expected) => {
    expect(normalizeRuPhone(raw)).toBe(expected);
  });

  it.each([
    '',
    '12345',
    '+1 212 555 0100',
    '8912345678',
    'телефон',
    '7912+3456789',
    '+7912345678901',
  ])('отклоняет %s', (raw) => {
    expect(normalizeRuPhone(raw)).toBeNull();
  });
});
