import { ENUM_MESSAGE_LANGUAGE } from 'lib/nest-core'
import {
  ENUM_AUTH_ABILITY_ACTION,
  ENUM_AUTH_ABILITY_ACTION_MAPPER,
  ENUM_AUTH_ABILITY_CONTEXT,
  ENUM_AUTH_ABILITY_SUBJECT,
} from '../enums'
import { IAuthUserData, IAuthUserRole } from '../interfaces'

// cspell:disable
export class AuthAbilityHelper {
  static getContexts() {
    return {
      [ENUM_AUTH_ABILITY_CONTEXT.DASHBOARD]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Dashboard',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Bảng điều khiển',
        },
        subjects: [ENUM_AUTH_ABILITY_SUBJECT.DASHBOARD],
      },

      [ENUM_AUTH_ABILITY_CONTEXT.USER_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'User Management',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Quản lý người dùng',
        },
        subjects: [ENUM_AUTH_ABILITY_SUBJECT.USER],
      },

      [ENUM_AUTH_ABILITY_CONTEXT.MEMBER_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Membership',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Thành viên',
        },
        subjects: [
          ENUM_AUTH_ABILITY_SUBJECT.MEMBER,
          ENUM_AUTH_ABILITY_SUBJECT.TIER_HISTORY,
          ENUM_AUTH_ABILITY_SUBJECT.POINT_HISTORY,
          ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_HISTORY,
          ENUM_AUTH_ABILITY_SUBJECT.NOTIFICATION_HISTORY,
        ],
      },

      [ENUM_AUTH_ABILITY_CONTEXT.INVENTORY_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Inventory',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Kho hàng',
        },
        subjects: [
          ENUM_AUTH_ABILITY_SUBJECT.PRODUCT,
          ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_BRAND,
          ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_CATEGORY,
          ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_REVIEW,
        ],
      },

      [ENUM_AUTH_ABILITY_CONTEXT.SALE_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Sales',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Bán hàng',
        },
        subjects: [ENUM_AUTH_ABILITY_SUBJECT.ORDER, ENUM_AUTH_ABILITY_SUBJECT.INVOICE],
      },

      [ENUM_AUTH_ABILITY_CONTEXT.NOTIFICATION_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Notifications',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Thông báo',
        },
        subjects: [
          ENUM_AUTH_ABILITY_SUBJECT.NOTIFICATION,
          ENUM_AUTH_ABILITY_SUBJECT.PUSH,
          ENUM_AUTH_ABILITY_SUBJECT.PUSH_GROUP,
        ],
      },

      [ENUM_AUTH_ABILITY_CONTEXT.SETTING_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Settings',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Cài đặt',
        },
        subjects: [
          ENUM_AUTH_ABILITY_SUBJECT.ROLE,
          ENUM_AUTH_ABILITY_SUBJECT.TIER,
          ENUM_AUTH_ABILITY_SUBJECT.FACT,
          ENUM_AUTH_ABILITY_SUBJECT.COUNTRY,
          ENUM_AUTH_ABILITY_SUBJECT.DISTRICT,
          ENUM_AUTH_ABILITY_SUBJECT.MEDIA,
          ENUM_AUTH_ABILITY_SUBJECT.API_KEY,
          ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION,
        ],
      },
    }
  }

  static getSubjectNames() {
    return {
      [ENUM_AUTH_ABILITY_SUBJECT.DASHBOARD]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Dashboard',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Bảng điều khiển',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.SETTING]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Settings',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Cài đặt',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.MEDIA]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Media',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Tệp đa phương tiện',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.API_KEY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Api Keys',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Khóa API',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Api Versions',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Phiên bản API',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.USER]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Users',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Người dùng',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.ROLE]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Roles',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Vai trò',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.PERMISSION]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Permissions',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Quyền hạn',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.FACT]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Information & Policies',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thông tin & Chính sách',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.COUNTRY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Countries',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Quốc gia',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.DISTRICT]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Districts',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Quận/Huyện',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.NOTIFICATION]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Notifications',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thông báo',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.PUSH]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Pushes',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Gửi thông báo',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.PUSH_GROUP]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Push Groups',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Nhóm thông báo',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.MEMBER]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Members',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thành viên',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.TIER_HISTORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Member Tiers',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Cấp độ thành viên',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.POINT_HISTORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Member Points',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Điểm thành viên',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.NOTIFICATION_HISTORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Member Notifications',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thông báo thành viên',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_HISTORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Member Redemptions',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Lịch sử đổi quà',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.PRODUCT]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Products',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Sản phẩm',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_BRAND]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Brands',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thương hiệu',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_CATEGORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Categories',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Danh mục',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.PRODUCT_REVIEW]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Reviews',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Đánh giá',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.CART]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Carts',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Giỏ hàng',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.ORDER]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Orders',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Đơn hàng',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.INVOICE]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Invoices',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Hóa đơn',
      },
      [ENUM_AUTH_ABILITY_SUBJECT.TIER]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Tiers',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Cấp bậc',
      },
    }
  }

  static getSubjects(): string[] {
    return Object.values(ENUM_AUTH_ABILITY_SUBJECT)
  }

  static getSubjectActions(subject: ENUM_AUTH_ABILITY_SUBJECT) {
    const subjectImports = this.getImportablePerms()
    const subjectExports = this.getExportablePerms()
    const subjectCRUDs = this.getCustomActionPerms()

    const actions = subjectCRUDs[subject] || [
      ENUM_AUTH_ABILITY_ACTION.READ,
      ENUM_AUTH_ABILITY_ACTION.CREATE,
      ENUM_AUTH_ABILITY_ACTION.UPDATE,
      ENUM_AUTH_ABILITY_ACTION.DELETE,
    ]

    if (subjectImports.includes(subject)) {
      actions.push(ENUM_AUTH_ABILITY_ACTION.IMPORT)
    }
    if (subjectExports.includes(subject)) {
      actions.push(ENUM_AUTH_ABILITY_ACTION.EXPORT)
    }

    return actions
  }

  static getDisablePerms() {
    return []
  }

  static getImportablePerms() {
    return []
  }

  static getExportablePerms() {
    return []
  }

  static getInvisiblePerms() {
    return [
      ENUM_AUTH_ABILITY_SUBJECT.PERMISSION,
      ENUM_AUTH_ABILITY_SUBJECT.SETTING,
      ENUM_AUTH_ABILITY_SUBJECT.CART,
      ENUM_AUTH_ABILITY_SUBJECT.COUNTRY,
      ENUM_AUTH_ABILITY_SUBJECT.DISTRICT,
      ENUM_AUTH_ABILITY_SUBJECT.PUSH,
    ]
  }

  static getCustomActionPerms() {
    return {
      [ENUM_AUTH_ABILITY_SUBJECT.DASHBOARD]: [ENUM_AUTH_ABILITY_ACTION.READ],
      [ENUM_AUTH_ABILITY_SUBJECT.FACT]: [
        ENUM_AUTH_ABILITY_ACTION.READ,
        ENUM_AUTH_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_AUTH_ABILITY_SUBJECT.CART]: [ENUM_AUTH_ABILITY_ACTION.READ],
      [ENUM_AUTH_ABILITY_SUBJECT.API_KEY]: [
        ENUM_AUTH_ABILITY_ACTION.READ,
        ENUM_AUTH_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_AUTH_ABILITY_SUBJECT.APP_VERSION]: [
        ENUM_AUTH_ABILITY_ACTION.READ,
        ENUM_AUTH_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_AUTH_ABILITY_SUBJECT.TIER]: [
        ENUM_AUTH_ABILITY_ACTION.READ,
        ENUM_AUTH_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_AUTH_ABILITY_SUBJECT.TIER_HISTORY]: [ENUM_AUTH_ABILITY_ACTION.READ],
      [ENUM_AUTH_ABILITY_SUBJECT.POINT_HISTORY]: [ENUM_AUTH_ABILITY_ACTION.READ],
      [ENUM_AUTH_ABILITY_SUBJECT.NOTIFICATION_HISTORY]: [ENUM_AUTH_ABILITY_ACTION.READ],
      [ENUM_AUTH_ABILITY_SUBJECT.ORDER]: [ENUM_AUTH_ABILITY_ACTION.READ],
      [ENUM_AUTH_ABILITY_SUBJECT.INVOICE]: [ENUM_AUTH_ABILITY_ACTION.READ],
      [ENUM_AUTH_ABILITY_SUBJECT.NOTIFICATION]: [
        ENUM_AUTH_ABILITY_ACTION.READ,
        ENUM_AUTH_ABILITY_ACTION.CREATE,
        ENUM_AUTH_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_AUTH_ABILITY_SUBJECT.PUSH]: [
        ENUM_AUTH_ABILITY_ACTION.READ,
        ENUM_AUTH_ABILITY_ACTION.CREATE,
        ENUM_AUTH_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_AUTH_ABILITY_SUBJECT.PUSH_GROUP]: [
        ENUM_AUTH_ABILITY_ACTION.READ,
        ENUM_AUTH_ABILITY_ACTION.CREATE,
        ENUM_AUTH_ABILITY_ACTION.UPDATE,
      ],
    }
  }

  static toActions(bitwise: number = 0): ENUM_AUTH_ABILITY_ACTION[] {
    const actions: ENUM_AUTH_ABILITY_ACTION[] = []
    if (ENUM_AUTH_ABILITY_ACTION_MAPPER.READ & bitwise) {
      actions.push(ENUM_AUTH_ABILITY_ACTION.READ)
    }
    if (ENUM_AUTH_ABILITY_ACTION_MAPPER.CREATE & bitwise) {
      actions.push(ENUM_AUTH_ABILITY_ACTION.CREATE)
    }
    if (ENUM_AUTH_ABILITY_ACTION_MAPPER.UPDATE & bitwise) {
      actions.push(ENUM_AUTH_ABILITY_ACTION.UPDATE)
    }
    if (ENUM_AUTH_ABILITY_ACTION_MAPPER.DELETE & bitwise) {
      actions.push(ENUM_AUTH_ABILITY_ACTION.DELETE)
    }
    if (ENUM_AUTH_ABILITY_ACTION_MAPPER.IMPORT & bitwise) {
      actions.push(ENUM_AUTH_ABILITY_ACTION.IMPORT)
    }
    if (ENUM_AUTH_ABILITY_ACTION_MAPPER.EXPORT & bitwise) {
      actions.push(ENUM_AUTH_ABILITY_ACTION.EXPORT)
    }
    return actions
  }

  static toBitwise(actions: ENUM_AUTH_ABILITY_ACTION[] = []): number {
    let bitwise: number = 0
    for (const action of actions) {
      bitwise += {
        [ENUM_AUTH_ABILITY_ACTION.READ]: ENUM_AUTH_ABILITY_ACTION_MAPPER.READ,
        [ENUM_AUTH_ABILITY_ACTION.CREATE]: ENUM_AUTH_ABILITY_ACTION_MAPPER.CREATE,
        [ENUM_AUTH_ABILITY_ACTION.UPDATE]: ENUM_AUTH_ABILITY_ACTION_MAPPER.UPDATE,
        [ENUM_AUTH_ABILITY_ACTION.DELETE]: ENUM_AUTH_ABILITY_ACTION_MAPPER.DELETE,
        [ENUM_AUTH_ABILITY_ACTION.EXPORT]: ENUM_AUTH_ABILITY_ACTION_MAPPER.EXPORT,
        [ENUM_AUTH_ABILITY_ACTION.IMPORT]: ENUM_AUTH_ABILITY_ACTION_MAPPER.IMPORT,
      }[action]
    }
    return bitwise
  }

  static toSubject(subject: string): any {
    return this.getSubjectNames()[subject]
  }

  static toContext(context: string): any {
    return this.getContexts()[context].title
  }

  static findContext(subject: ENUM_AUTH_ABILITY_SUBJECT): string {
    const contexts = this.getContexts()
    for (const context in contexts) {
      const subjects = contexts[context].subjects
      if (subjects.includes(subject)) {
        return context
      }
    }
    return null
  }

  static toPermission<T = any>(
    subject: ENUM_AUTH_ABILITY_SUBJECT,
    actions: ENUM_AUTH_ABILITY_ACTION[],
    _disables: ENUM_AUTH_ABILITY_SUBJECT[] = [],
    _invisibles: ENUM_AUTH_ABILITY_SUBJECT[] = [],
  ): T {
    return {
      subject: subject.toString(),
      bitwise: this.toBitwise(actions),
      title: this.toSubject(subject),
      context: this.findContext(subject),
      isActive: !_disables.includes(subject),
      isVisible: !_invisibles.includes(subject),
    } as T
  }

  static isGroup(context: string | null): boolean {
    const subjects: ENUM_AUTH_ABILITY_SUBJECT[] = this.getContexts()[context]?.subjects ?? []
    if (subjects.length <= 1) return false

    const _invisibles = this.getInvisiblePerms()
    const _visibles = subjects.filter((s) => !_invisibles.includes(s))
    return _visibles.length > 1
  }

  static toUserRoles(user: IAuthUserData): IAuthUserRole[] {
    const userRoles = (user?.pivotRoles ?? [])
      .map((roles) => roles.role)
      .filter((role) => role.isActive && role.level >= user.level)
    return userRoles
  }

  static toUserRoleIds(user: IAuthUserData): number[] {
    const roleIds = this.toUserRoles(user).map((role) => role.id)
    return roleIds
  }
}
// cspell:enable
