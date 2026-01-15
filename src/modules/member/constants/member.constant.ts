import { EnumAuthScopeType } from 'lib/nest-auth'
import { FileUtil, StrUtil } from 'lib/nest-core'

export const MEMBER_AUTH_TOKEN = EnumAuthScopeType.MEMBER

export const MEMBER_UPLOAD_IMAGE_PATH = `public/uploads/images/members`
export const MEMBER_UPLOAD_TASK_SIZE = FileUtil.megabytes(50)

export const MEMBER_QUEUE_AUTH = 'MEMBER_QUEUE_AUTH'
export const MEMBER_QUEUE_SEND_REQUEST_OTP = 'MEMBER_QUEUE_SEND_REQUEST_OTP'
export const MEMBER_QUEUE_SEND_RESET_PASSWORD = 'MEMBER_QUEUE_SEND_RESET_PASSWORD'

export const MEMBER_NUMBER_LENGTH = StrUtil.numeric(process.env.AUTH_MEMBER_NUMBER_LENGTH, 4)
