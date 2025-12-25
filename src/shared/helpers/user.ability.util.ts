import { ENUM_MESSAGE_LANGUAGE, LocaleUtil } from 'lib/nest-core'
import {
  ENUM_APP_ABILITY_ACTION,
  ENUM_APP_ABILITY_CONTEXT,
  ENUM_APP_ABILITY_SUBJECT,
} from 'shared/enums'

// cspell:disable
export class UserAbilityUtil {
  static getContexts() {
    return {
      [ENUM_APP_ABILITY_CONTEXT.DASHBOARD]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Dashboard',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Bảng điều khiển',
        },
        subjects: [ENUM_APP_ABILITY_SUBJECT.DASHBOARD],
      },

      [ENUM_APP_ABILITY_CONTEXT.USER_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'User Management',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Quản lý người dùng',
        },
        subjects: [ENUM_APP_ABILITY_SUBJECT.USER],
      },

      [ENUM_APP_ABILITY_CONTEXT.MEMBER_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Membership',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Thành viên',
        },
        subjects: [
          ENUM_APP_ABILITY_SUBJECT.MEMBER,
          ENUM_APP_ABILITY_SUBJECT.TIER_HISTORY,
          ENUM_APP_ABILITY_SUBJECT.POINT_HISTORY,
          ENUM_APP_ABILITY_SUBJECT.PRODUCT_HISTORY,
          ENUM_APP_ABILITY_SUBJECT.NOTIFICATION_HISTORY,
        ],
      },

      [ENUM_APP_ABILITY_CONTEXT.INVENTORY_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Inventory',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Kho hàng',
        },
        subjects: [
          ENUM_APP_ABILITY_SUBJECT.PRODUCT,
          ENUM_APP_ABILITY_SUBJECT.PRODUCT_BRAND,
          ENUM_APP_ABILITY_SUBJECT.PRODUCT_CATEGORY,
          ENUM_APP_ABILITY_SUBJECT.PRODUCT_REVIEW,
        ],
      },

      [ENUM_APP_ABILITY_CONTEXT.SALE_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Sales',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Bán hàng',
        },
        subjects: [ENUM_APP_ABILITY_SUBJECT.ORDER, ENUM_APP_ABILITY_SUBJECT.INVOICE],
      },

      [ENUM_APP_ABILITY_CONTEXT.NOTIFICATION_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Notifications',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Thông báo',
        },
        subjects: [
          ENUM_APP_ABILITY_SUBJECT.NOTIFICATION,
          ENUM_APP_ABILITY_SUBJECT.PUSH,
          ENUM_APP_ABILITY_SUBJECT.PUSH_GROUP,
        ],
      },

      [ENUM_APP_ABILITY_CONTEXT.SETTING_MANAGEMENT]: {
        title: {
          [ENUM_MESSAGE_LANGUAGE.EN]: 'Settings',
          [ENUM_MESSAGE_LANGUAGE.VI]: 'Cài đặt',
        },
        subjects: [
          ENUM_APP_ABILITY_SUBJECT.ROLE,
          ENUM_APP_ABILITY_SUBJECT.TIER,
          ENUM_APP_ABILITY_SUBJECT.FACT,
          ENUM_APP_ABILITY_SUBJECT.COUNTRY,
          ENUM_APP_ABILITY_SUBJECT.DISTRICT,
          ENUM_APP_ABILITY_SUBJECT.MEDIA,
          ENUM_APP_ABILITY_SUBJECT.API_KEY,
          ENUM_APP_ABILITY_SUBJECT.APP_VERSION,
        ],
      },
    }
  }

  static getSubjectNames() {
    return {
      [ENUM_APP_ABILITY_SUBJECT.DASHBOARD]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Dashboard',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Bảng điều khiển',
      },
      [ENUM_APP_ABILITY_SUBJECT.SETTING]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Settings',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Cài đặt',
      },
      [ENUM_APP_ABILITY_SUBJECT.MEDIA]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Media',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Hình Ảnh',
      },
      [ENUM_APP_ABILITY_SUBJECT.API_KEY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Api Keys',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Api Keys',
      },
      [ENUM_APP_ABILITY_SUBJECT.APP_VERSION]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'App Versions',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Phiên bản',
      },
      [ENUM_APP_ABILITY_SUBJECT.USER]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Users',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Người dùng',
      },
      [ENUM_APP_ABILITY_SUBJECT.ROLE]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Roles',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Vai trò',
      },
      [ENUM_APP_ABILITY_SUBJECT.PERMISSION]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Permissions',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Quyền hạn',
      },
      [ENUM_APP_ABILITY_SUBJECT.FACT]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Information & Policies',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thông tin & Chính sách',
      },
      [ENUM_APP_ABILITY_SUBJECT.COUNTRY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Countries',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Quốc gia',
      },
      [ENUM_APP_ABILITY_SUBJECT.DISTRICT]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Districts',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Quận/Huyện',
      },
      [ENUM_APP_ABILITY_SUBJECT.NOTIFICATION]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Notifications',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thông báo',
      },
      [ENUM_APP_ABILITY_SUBJECT.PUSH]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Pushes',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Gửi thông báo',
      },
      [ENUM_APP_ABILITY_SUBJECT.PUSH_GROUP]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Push Groups',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Nhóm thông báo',
      },
      [ENUM_APP_ABILITY_SUBJECT.MEMBER]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Members',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thành viên',
      },
      [ENUM_APP_ABILITY_SUBJECT.TIER_HISTORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Member Tiers',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Cấp độ thành viên',
      },
      [ENUM_APP_ABILITY_SUBJECT.POINT_HISTORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Member Points',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Điểm thành viên',
      },
      [ENUM_APP_ABILITY_SUBJECT.NOTIFICATION_HISTORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Member Notifications',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thông báo thành viên',
      },
      [ENUM_APP_ABILITY_SUBJECT.PRODUCT_HISTORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Member Redemptions',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Lịch sử đổi quà',
      },
      [ENUM_APP_ABILITY_SUBJECT.PRODUCT]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Products',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Sản phẩm',
      },
      [ENUM_APP_ABILITY_SUBJECT.PRODUCT_BRAND]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Brands',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Thương hiệu',
      },
      [ENUM_APP_ABILITY_SUBJECT.PRODUCT_CATEGORY]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Categories',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Danh mục',
      },
      [ENUM_APP_ABILITY_SUBJECT.PRODUCT_REVIEW]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Reviews',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Đánh giá',
      },
      [ENUM_APP_ABILITY_SUBJECT.CART]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Carts',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Giỏ hàng',
      },
      [ENUM_APP_ABILITY_SUBJECT.ORDER]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Orders',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Đơn hàng',
      },
      [ENUM_APP_ABILITY_SUBJECT.INVOICE]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Invoices',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Hóa đơn',
      },
      [ENUM_APP_ABILITY_SUBJECT.TIER]: {
        [ENUM_MESSAGE_LANGUAGE.EN]: 'Tiers',
        [ENUM_MESSAGE_LANGUAGE.VI]: 'Cấp bậc',
      },
    }
  }

  static getSubjects(): string[] {
    return Object.values(ENUM_APP_ABILITY_SUBJECT)
  }

  static getSubjectActions(subject: ENUM_APP_ABILITY_SUBJECT) {
    const subjectImports = this.getImportablePerms()
    const subjectExports = this.getExportablePerms()
    const subjectCRUDs = this.getCustomActionPerms()

    const actions = subjectCRUDs[subject] || [
      ENUM_APP_ABILITY_ACTION.READ,
      ENUM_APP_ABILITY_ACTION.CREATE,
      ENUM_APP_ABILITY_ACTION.UPDATE,
      ENUM_APP_ABILITY_ACTION.DELETE,
    ]

    if (subjectImports.includes(subject)) {
      actions.push(ENUM_APP_ABILITY_ACTION.IMPORT)
    }
    if (subjectExports.includes(subject)) {
      actions.push(ENUM_APP_ABILITY_ACTION.EXPORT)
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
      ENUM_APP_ABILITY_SUBJECT.PERMISSION,
      ENUM_APP_ABILITY_SUBJECT.SETTING,
      ENUM_APP_ABILITY_SUBJECT.CART,
      ENUM_APP_ABILITY_SUBJECT.COUNTRY,
      ENUM_APP_ABILITY_SUBJECT.DISTRICT,
      ENUM_APP_ABILITY_SUBJECT.PUSH,
    ]
  }

  static getCustomActionPerms() {
    return {
      [ENUM_APP_ABILITY_SUBJECT.DASHBOARD]: [ENUM_APP_ABILITY_ACTION.READ],
      [ENUM_APP_ABILITY_SUBJECT.FACT]: [
        ENUM_APP_ABILITY_ACTION.READ,
        ENUM_APP_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_APP_ABILITY_SUBJECT.CART]: [ENUM_APP_ABILITY_ACTION.READ],
      [ENUM_APP_ABILITY_SUBJECT.API_KEY]: [
        ENUM_APP_ABILITY_ACTION.READ,
        ENUM_APP_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_APP_ABILITY_SUBJECT.APP_VERSION]: [
        ENUM_APP_ABILITY_ACTION.READ,
        ENUM_APP_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_APP_ABILITY_SUBJECT.TIER]: [
        ENUM_APP_ABILITY_ACTION.READ,
        ENUM_APP_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_APP_ABILITY_SUBJECT.TIER_HISTORY]: [ENUM_APP_ABILITY_ACTION.READ],
      [ENUM_APP_ABILITY_SUBJECT.POINT_HISTORY]: [ENUM_APP_ABILITY_ACTION.READ],
      [ENUM_APP_ABILITY_SUBJECT.NOTIFICATION_HISTORY]: [ENUM_APP_ABILITY_ACTION.READ],
      [ENUM_APP_ABILITY_SUBJECT.ORDER]: [ENUM_APP_ABILITY_ACTION.READ],
      [ENUM_APP_ABILITY_SUBJECT.INVOICE]: [ENUM_APP_ABILITY_ACTION.READ],
      [ENUM_APP_ABILITY_SUBJECT.NOTIFICATION]: [
        ENUM_APP_ABILITY_ACTION.READ,
        ENUM_APP_ABILITY_ACTION.CREATE,
        ENUM_APP_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_APP_ABILITY_SUBJECT.PUSH]: [
        ENUM_APP_ABILITY_ACTION.READ,
        ENUM_APP_ABILITY_ACTION.CREATE,
        ENUM_APP_ABILITY_ACTION.UPDATE,
      ],
      [ENUM_APP_ABILITY_SUBJECT.PUSH_GROUP]: [
        ENUM_APP_ABILITY_ACTION.READ,
        ENUM_APP_ABILITY_ACTION.CREATE,
        ENUM_APP_ABILITY_ACTION.UPDATE,
      ],
    }
  }

  static toActions(bitwise: number = 0): ENUM_APP_ABILITY_ACTION[] {
    return Object.values(ENUM_APP_ABILITY_ACTION).filter(
      (_, index) => (bitwise & (1 << index)) !== 0,
    )
  }

  static toBitwise(actions: ENUM_APP_ABILITY_ACTION[] = []): number {
    const allActions = Object.values(ENUM_APP_ABILITY_ACTION)

    return actions.reduce((bitwise, action) => {
      const index = allActions.indexOf(action)
      if (index === -1) return bitwise
      return bitwise | (1 << index)
    }, 0)
  }

  static toSubject(subject: string): any {
    return this.getSubjectNames()[subject]
  }

  static toContext(context: string, language?: string): string {
    const jsonTitle = this.getContexts()[context]?.title || {}
    return LocaleUtil.parseValue(jsonTitle, language)
  }

  static findContext(subject: ENUM_APP_ABILITY_SUBJECT): string {
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
    subject: ENUM_APP_ABILITY_SUBJECT,
    actions: ENUM_APP_ABILITY_ACTION[],
    _disables: ENUM_APP_ABILITY_SUBJECT[] = [],
    _invisibles: ENUM_APP_ABILITY_SUBJECT[] = [],
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
}
// cspell:enable
