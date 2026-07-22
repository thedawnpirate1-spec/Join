export const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^\+?[0-9 ]{6,20}$/;

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
