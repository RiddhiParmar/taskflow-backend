export const USER_ERROR_CONST = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_TOKEN: 'INVALID_TOKEN',
  RESET_PASSWORD_TOKEN_EXPIRED: 'RESET_PASSWORD_TOKEN_EXPIRED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  OLD_PASSWORD_NOT_MATCH: 'OLD_PASSWORD_NOT_MATCH',
  NEW_PASSWORD_MATCH_WITH_OLD: 'NEW_PASSWORD_MATCH_WITH_OLD',
  TOKEN_MISSING: 'TOKEN_MISSING',
  MALICIOUS_TOKEN: 'MALICIOUS_TOKEN',
  EMAIL_ALREADY_EXIST: 'EMAIL_ALREADY_EXIST',
};
export const USER_ERROR_MESSAGE = {
  USER_NOT_FOUND: 'User not found or disable',
  INVALID_TOKEN: 'Token is not valid',
  RESET_PASSWORD_TOKEN_EXPIRED:
    'Reset password token is expired please try again',
  NEW_PASSWORD_MATCH_WITH_OLD: 'New password same as old password',
  OLD_PASSWORD_NOT_MATCH: 'Old password does not match with current password',
  INVALID_PASSWORD: 'Password does not match',
  TOKEN_MISSING: 'Token missing in header',
  MALICIOUS_TOKEN: 'Malicious token found',
  EMAIL_ALREADY_EXIST:
    'Email address already taken please use another email address',
};
