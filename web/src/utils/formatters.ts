import { format } from 'date-fns';

/**
 * Safely extracts a floating point number from various possible formats:
 * - A raw number (e.g. 14.8)
 * - An object with a 'value' property (e.g. { value: 14.8, unit: 'degrees' })
 * - A numeric string (e.g. "14.8")
 * Returns null if cannot be converted.
 */
export function extractNumericValue(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'object') {
    if ('value' in val) {
      const inner = val.value;
      if (typeof inner === 'number') return isNaN(inner) ? null : inner;
      const parsed = parseFloat(String(inner));
      return isNaN(parsed) ? null : parsed;
    }
    if ('median' in val) {
      const inner = val.median;
      if (typeof inner === 'number') return isNaN(inner) ? null : inner;
      const parsed = parseFloat(String(inner));
      return isNaN(parsed) ? null : parsed;
    }
  }
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? null : parsed;
}

/**
 * Safely formats a date without throwing RangeError on invalid inputs.
 */
export function safeFormatDate(dateVal: any, formatString = 'MMM dd, yyyy • HH:mm'): string {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return format(d, formatString);
  } catch {
    return String(dateVal);
  }
}
