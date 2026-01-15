import { EnumMessageLanguage, LocaleUtil } from 'lib/nest-core'
import { EnumAuthAbilityAction, EnumAuthAbilityContext, EnumAuthAbilitySubject } from 'shared/enums'
import { ContextObject, PermissionObject, SubjectName, SubjectObject } from 'shared/interfaces'

export class UserAbilityUtil {
  // cspell:disable
  static getContexts(): ContextObject {
    return {
      [EnumAuthAbilityContext.DASHBOARD]: {
        title: {
          [EnumMessageLanguage.EN]: 'Dashboard',
          [EnumMessageLanguage.VI]: 'Bảng điều khiển',
        },
        subjects: [EnumAuthAbilitySubject.DASHBOARD],
      },

      [EnumAuthAbilityContext.USER_MANAGEMENT]: {
        title: {
          [EnumMessageLanguage.EN]: 'User Management',
          [EnumMessageLanguage.VI]: 'Quản lý người dùng',
        },
        subjects: [EnumAuthAbilitySubject.USER],
      },

      [EnumAuthAbilityContext.MEMBER_MANAGEMENT]: {
        title: {
          [EnumMessageLanguage.EN]: 'Membership',
          [EnumMessageLanguage.VI]: 'Thành viên',
        },
        subjects: [
          EnumAuthAbilitySubject.MEMBER,
          EnumAuthAbilitySubject.TIER_HISTORY,
          EnumAuthAbilitySubject.POINT_HISTORY,
          EnumAuthAbilitySubject.PRODUCT_HISTORY,
          EnumAuthAbilitySubject.NOTIFICATION_HISTORY,
        ],
      },

      [EnumAuthAbilityContext.INVENTORY_MANAGEMENT]: {
        title: {
          [EnumMessageLanguage.EN]: 'Inventory',
          [EnumMessageLanguage.VI]: 'Kho hàng',
        },
        subjects: [
          EnumAuthAbilitySubject.PRODUCT,
          EnumAuthAbilitySubject.PRODUCT_BRAND,
          EnumAuthAbilitySubject.PRODUCT_CATEGORY,
          EnumAuthAbilitySubject.PRODUCT_REVIEW,
        ],
      },

      [EnumAuthAbilityContext.SALE_MANAGEMENT]: {
        title: {
          [EnumMessageLanguage.EN]: 'Sales',
          [EnumMessageLanguage.VI]: 'Bán hàng',
        },
        subjects: [EnumAuthAbilitySubject.ORDER, EnumAuthAbilitySubject.INVOICE],
      },

      [EnumAuthAbilityContext.NOTIFICATION_MANAGEMENT]: {
        title: {
          [EnumMessageLanguage.EN]: 'Notifications',
          [EnumMessageLanguage.VI]: 'Thông báo',
        },
        subjects: [
          EnumAuthAbilitySubject.NOTIFICATION,
          EnumAuthAbilitySubject.PUSH,
          EnumAuthAbilitySubject.PUSH_GROUP,
        ],
      },

      [EnumAuthAbilityContext.SETTING_MANAGEMENT]: {
        title: {
          [EnumMessageLanguage.EN]: 'Settings',
          [EnumMessageLanguage.VI]: 'Cài đặt',
        },
        subjects: [
          EnumAuthAbilitySubject.ROLE,
          EnumAuthAbilitySubject.TIER,
          EnumAuthAbilitySubject.FACT,
          EnumAuthAbilitySubject.COUNTRY,
          EnumAuthAbilitySubject.DISTRICT,
          EnumAuthAbilitySubject.MEDIA,
          EnumAuthAbilitySubject.API_KEY,
          EnumAuthAbilitySubject.APP_VERSION,
        ],
      },
    }
  }

  static getSubjectNames(): SubjectObject {
    return {
      [EnumAuthAbilitySubject.DASHBOARD]: {
        [EnumMessageLanguage.EN]: 'Dashboard',
        [EnumMessageLanguage.VI]: 'Bảng điều khiển',
      },
      [EnumAuthAbilitySubject.SETTING]: {
        [EnumMessageLanguage.EN]: 'Settings',
        [EnumMessageLanguage.VI]: 'Cài đặt',
      },
      [EnumAuthAbilitySubject.MEDIA]: {
        [EnumMessageLanguage.EN]: 'Media',
        [EnumMessageLanguage.VI]: 'Hình Ảnh',
      },
      [EnumAuthAbilitySubject.API_KEY]: {
        [EnumMessageLanguage.EN]: 'Api Keys',
        [EnumMessageLanguage.VI]: 'Api Keys',
      },
      [EnumAuthAbilitySubject.APP_VERSION]: {
        [EnumMessageLanguage.EN]: 'App Versions',
        [EnumMessageLanguage.VI]: 'Phiên bản',
      },
      [EnumAuthAbilitySubject.USER]: {
        [EnumMessageLanguage.EN]: 'Users',
        [EnumMessageLanguage.VI]: 'Người dùng',
      },
      [EnumAuthAbilitySubject.ROLE]: {
        [EnumMessageLanguage.EN]: 'Roles',
        [EnumMessageLanguage.VI]: 'Vai trò',
      },
      [EnumAuthAbilitySubject.PERMISSION]: {
        [EnumMessageLanguage.EN]: 'Permissions',
        [EnumMessageLanguage.VI]: 'Quyền hạn',
      },
      [EnumAuthAbilitySubject.FACT]: {
        [EnumMessageLanguage.EN]: 'Information & Policies',
        [EnumMessageLanguage.VI]: 'Thông tin & Chính sách',
      },
      [EnumAuthAbilitySubject.COUNTRY]: {
        [EnumMessageLanguage.EN]: 'Countries',
        [EnumMessageLanguage.VI]: 'Quốc gia',
      },
      [EnumAuthAbilitySubject.DISTRICT]: {
        [EnumMessageLanguage.EN]: 'Districts',
        [EnumMessageLanguage.VI]: 'Quận/Huyện',
      },
      [EnumAuthAbilitySubject.NOTIFICATION]: {
        [EnumMessageLanguage.EN]: 'Notifications',
        [EnumMessageLanguage.VI]: 'Thông báo',
      },
      [EnumAuthAbilitySubject.PUSH]: {
        [EnumMessageLanguage.EN]: 'Pushes',
        [EnumMessageLanguage.VI]: 'Gửi thông báo',
      },
      [EnumAuthAbilitySubject.PUSH_GROUP]: {
        [EnumMessageLanguage.EN]: 'Push Groups',
        [EnumMessageLanguage.VI]: 'Nhóm thông báo',
      },
      [EnumAuthAbilitySubject.MEMBER]: {
        [EnumMessageLanguage.EN]: 'Members',
        [EnumMessageLanguage.VI]: 'Thành viên',
      },
      [EnumAuthAbilitySubject.TIER_HISTORY]: {
        [EnumMessageLanguage.EN]: 'Member Tiers',
        [EnumMessageLanguage.VI]: 'Cấp độ thành viên',
      },
      [EnumAuthAbilitySubject.POINT_HISTORY]: {
        [EnumMessageLanguage.EN]: 'Member Points',
        [EnumMessageLanguage.VI]: 'Điểm thành viên',
      },
      [EnumAuthAbilitySubject.NOTIFICATION_HISTORY]: {
        [EnumMessageLanguage.EN]: 'Member Notifications',
        [EnumMessageLanguage.VI]: 'Thông báo thành viên',
      },
      [EnumAuthAbilitySubject.PRODUCT_HISTORY]: {
        [EnumMessageLanguage.EN]: 'Member Redemptions',
        [EnumMessageLanguage.VI]: 'Lịch sử đổi quà',
      },
      [EnumAuthAbilitySubject.PRODUCT]: {
        [EnumMessageLanguage.EN]: 'Products',
        [EnumMessageLanguage.VI]: 'Sản phẩm',
      },
      [EnumAuthAbilitySubject.PRODUCT_BRAND]: {
        [EnumMessageLanguage.EN]: 'Brands',
        [EnumMessageLanguage.VI]: 'Thương hiệu',
      },
      [EnumAuthAbilitySubject.PRODUCT_CATEGORY]: {
        [EnumMessageLanguage.EN]: 'Categories',
        [EnumMessageLanguage.VI]: 'Danh mục',
      },
      [EnumAuthAbilitySubject.PRODUCT_REVIEW]: {
        [EnumMessageLanguage.EN]: 'Reviews',
        [EnumMessageLanguage.VI]: 'Đánh giá',
      },
      [EnumAuthAbilitySubject.CART]: {
        [EnumMessageLanguage.EN]: 'Carts',
        [EnumMessageLanguage.VI]: 'Giỏ hàng',
      },
      [EnumAuthAbilitySubject.ORDER]: {
        [EnumMessageLanguage.EN]: 'Orders',
        [EnumMessageLanguage.VI]: 'Đơn hàng',
      },
      [EnumAuthAbilitySubject.INVOICE]: {
        [EnumMessageLanguage.EN]: 'Invoices',
        [EnumMessageLanguage.VI]: 'Hóa đơn',
      },
      [EnumAuthAbilitySubject.TIER]: {
        [EnumMessageLanguage.EN]: 'Tiers',
        [EnumMessageLanguage.VI]: 'Cấp bậc',
      },
    }
  }
  // cspell:enable

  static getSubjects(): string[] {
    return Object.values(EnumAuthAbilitySubject)
  }

  static getSubjectActions(subject: EnumAuthAbilitySubject): EnumAuthAbilityAction[] {
    const subjectImports = this.getImportablePerms()
    const subjectExports = this.getExportablePerms()
    const subjectCRUDs = this.getCustomActionPerms()

    const actions = subjectCRUDs[subject] || [
      EnumAuthAbilityAction.READ,
      EnumAuthAbilityAction.CREATE,
      EnumAuthAbilityAction.UPDATE,
      EnumAuthAbilityAction.DELETE,
    ]

    if (subjectImports.includes(subject)) {
      actions.push(EnumAuthAbilityAction.IMPORT)
    }
    if (subjectExports.includes(subject)) {
      actions.push(EnumAuthAbilityAction.EXPORT)
    }

    return actions
  }

  static getDisablePerms(): EnumAuthAbilitySubject[] {
    return []
  }

  static getImportablePerms(): EnumAuthAbilitySubject[] {
    return []
  }

  static getExportablePerms(): EnumAuthAbilitySubject[] {
    return []
  }

  static getInvisiblePerms(): EnumAuthAbilitySubject[] {
    return [
      EnumAuthAbilitySubject.PERMISSION,
      EnumAuthAbilitySubject.SETTING,
      EnumAuthAbilitySubject.CART,
      EnumAuthAbilitySubject.COUNTRY,
      EnumAuthAbilitySubject.DISTRICT,
      EnumAuthAbilitySubject.PUSH,
    ]
  }

  static getCustomActionPerms(): Record<string, EnumAuthAbilityAction[]> {
    return {
      [EnumAuthAbilitySubject.DASHBOARD]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.FACT]: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
      [EnumAuthAbilitySubject.CART]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.API_KEY]: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
      [EnumAuthAbilitySubject.APP_VERSION]: [
        EnumAuthAbilityAction.READ,
        EnumAuthAbilityAction.UPDATE,
      ],
      [EnumAuthAbilitySubject.TIER]: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
      [EnumAuthAbilitySubject.TIER_HISTORY]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.POINT_HISTORY]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.NOTIFICATION_HISTORY]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.ORDER]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.INVOICE]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.NOTIFICATION]: [
        EnumAuthAbilityAction.READ,
        EnumAuthAbilityAction.CREATE,
        EnumAuthAbilityAction.UPDATE,
      ],
      [EnumAuthAbilitySubject.PUSH]: [
        EnumAuthAbilityAction.READ,
        EnumAuthAbilityAction.CREATE,
        EnumAuthAbilityAction.UPDATE,
      ],
      [EnumAuthAbilitySubject.PUSH_GROUP]: [
        EnumAuthAbilityAction.READ,
        EnumAuthAbilityAction.CREATE,
        EnumAuthAbilityAction.UPDATE,
      ],
    }
  }

  static toActions(bitwise: number = 0): EnumAuthAbilityAction[] {
    return Object.values(EnumAuthAbilityAction).filter((_, index) => (bitwise & (1 << index)) !== 0)
  }

  static toBitwise(actions: EnumAuthAbilityAction[] = []): number {
    const allActions = Object.values(EnumAuthAbilityAction)

    return actions.reduce((bitwise, action) => {
      const index = allActions.indexOf(action)
      if (index === -1) {
        return bitwise
      }
      return bitwise | (1 << index)
    }, 0)
  }

  static toSubject(subject: string): SubjectName {
    return this.getSubjectNames()[subject]
  }

  static toContext(context: string, language?: string): string {
    const jsonTitle = this.getContexts()[context]?.title || {}
    return LocaleUtil.parseValue(jsonTitle, language)
  }

  static findContext(subject: EnumAuthAbilitySubject): string {
    const contexts = this.getContexts()
    for (const context in contexts) {
      const subjects = contexts[context].subjects
      if (subjects.includes(subject)) {
        return context
      }
    }
    return null
  }

  static toPermission(
    subject: EnumAuthAbilitySubject,
    actions: EnumAuthAbilityAction[],
    _disables: EnumAuthAbilitySubject[] = [],
    _invisibles: EnumAuthAbilitySubject[] = []
  ): PermissionObject {
    return {
      subject: subject.toString(),
      bitwise: this.toBitwise(actions),
      title: this.toSubject(subject),
      context: this.findContext(subject),
      isActive: !_disables.includes(subject),
      isVisible: !_invisibles.includes(subject),
    }
  }
}
