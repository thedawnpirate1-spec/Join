/**
 * Returns today's date formatted as YYYY-MM-DD for standard date input [min] attribute.
 */
export function getTodayIsoString(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats a YYYY-MM-DD date string to DD/MM/YYYY.
 */
export function formatDueDate(isoDateString: string): string {
  if (!isoDateString) return '';
  const parts = isoDateString.split('-');
  if (parts.length !== 3) return isoDateString;
  return parts.reverse().join('/');
}
