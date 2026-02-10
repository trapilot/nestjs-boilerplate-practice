export enum EnumMemberQueue {
  EARN_HIGHEST_PURCHASE_IN_BIRTH = 'member:earn_highest_purchase_in_birth',
  EARN_POINT_FROM_PURCHASE = 'member:earn_point_from_purchase',
  RELEASE_EXPIRY_POINTS = 'member:release_expiry_points',
  RESET_BIRTH_PURCHASE = 'member:reset_birth_purchase',
  RESET_EXPIRY_POINTS = 'member:reset_expiry_points',
  SCAN_EXPIRED = 'member:scan_expired',
  PROCESS_EXPIRED = 'member:process_expired',
  GRANT_WELCOME_REWARD = 'member:grant_welcome_reward',
  TRIGGER_WELCOME_EMAIL = 'member:trigger_welcome_email',
  GENERATE_CODE = 'member:generate_code',
}

export enum EnumMemberEvent {
  CREATED = 'member:created',
  DOWNGRADE = 'member:downgrade',
  RENEWAL = 'member:renewal',
}

export enum EnumMemberActivityAction {
  LOGIN_CREDENTIAL = 'LOGIN_CREDENTIAL',
  LOGIN_GOOGLE = 'LOGIN_GOOGLE',
  LOGIN_APPLE = 'LOGIN_APPLE',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}
