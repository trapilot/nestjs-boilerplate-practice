export enum EnumMemberQueue {
  EARN_POINT_FROM_PURCHASE = 'member:earn_point_from_purchase',
  RELEASE_PENDING_POINTS = 'member:release_pending_points',
  SCAN_EXPIRED = 'member:scan_expired',
  PROCESS_EXPIRED = 'member:process_expired',
  GRANT_TIER_REWARD = 'member:grant_tier_reward',
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
