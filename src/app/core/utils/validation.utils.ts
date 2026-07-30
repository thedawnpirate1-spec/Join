/** Letters (incl. accented), apostrophes, spaces and hyphens, min length 2. */
export const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/;
/** Minimal "local@domain.tld" shape check. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Optional leading "+", 6-20 digits/spaces. */
export const PHONE_PATTERN = /^\+?[0-9 ]{6,20}$/;

/** Validates a name field, returning an error message or '' if valid. */
export function validateNameValue(name: string): string {
  const value = name.trim();
  if (!value) {
    return 'Please enter a name.';
  }
  if (!NAME_PATTERN.test(value)) {
    return 'Letters only, at least 2 characters.';
  }
  return '';
}

/** Validates an email field, returning an error message or '' if valid. */
export function validateEmailValue(email: string): string {
  const value = email.trim();
  if (!value) {
    return 'Please enter an email address.';
  }
  if (!EMAIL_PATTERN.test(value)) {
    return 'Please enter a valid email address.';
  }
  return '';
}

/** Validates an optional phone field, returning an error message or '' if valid/empty. */
export function validatePhoneValue(phone: string): string {
  const value = phone.trim();
  if (!value) {
    return '';
  }
  if (!PHONE_PATTERN.test(value)) {
    return 'Please enter a valid phone number.';
  }
  return '';
}
