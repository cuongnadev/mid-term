export {
  fold,
  initials,
  isBlank,
  matchesQuery,
  normalizeMultiline,
  normalizeText,
  slugify,
  toNfc,
  truncate,
} from './text';

export { hashPassword, verifyPassword } from './hash';

export {
  isValidEmail,
  MAX_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validateEmail,
  validateFullName,
  validatePassword,
} from './validate';

export {
  evaluatePasswordStrength,
  generateCryptoStrongPassword,
  type PasswordCriteria,
  type PasswordStrengthLevel,
  type PasswordStrengthResult,
  type PasswordStrengthTone,
} from './passwordStrength';

export { alertDialog, confirmDialog, type ConfirmOptions } from './dialog';

export {
  pickAndCompressImage,
  type ImagePickSource,
  type PickImageOutcome,
} from './imagePicker';