export enum EnumMemberQueue {
  SCAN_EXPIRED = 'member:scan:expired',
  SCAN_PENDING_POINTS = 'member:scan:pending_points',
  SCAN_EARN_POINTS = 'member:scan:earn_points',
  SCAN_OVER_DUE_INVOICES = 'member:scan:over_due_invoices',
  PROC_EXPIRED = 'member:proc:expired',
  PROC_PENDING_POINTS = 'member:proc:pending_points',
  PROC_EARN_POINTS = 'member:proc:earn_points',
  PROC_GRANT_TIER_REWARD = 'member:proc:grant_tier_reward',
  PROC_EMAIL_WELCOME = 'member:proc:email_welcome',
  PROC_GENERATE_CODE = 'member:proc:generate_code',
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
