import { Prisma } from '@runtime/prisma-client'
import {
  EnumAuthAbilityAction,
  EnumAuthAbilityContext,
  EnumAuthAbilitySubject,
} from 'app/enums/user.enum'
import { IAuthAbilityDataContext, IAuthAbilityDataTitle } from 'lib/nest-auth'
import { AppUtil, EnumAppLanguage, IMessageField, ScopeContext, StrUtil } from 'lib/nest-core'

// cspell:disable
export class UserAbilityUtil {
  static get contexts(): { [context: string]: IAuthAbilityDataContext } {
    return {
      [EnumAuthAbilityContext.DASHBOARD]: {
        title: {
          [EnumAppLanguage.EN]: 'Dashboard',
          [EnumAppLanguage.VI]: 'Bảng điều khiển',
        },
        subjects: [EnumAuthAbilitySubject.DASHBOARD],
      },

      [EnumAuthAbilityContext.USER_MANAGEMENT]: {
        title: {
          [EnumAppLanguage.EN]: 'User Management',
          [EnumAppLanguage.VI]: 'Quản lý người dùng',
        },
        subjects: [EnumAuthAbilitySubject.USER],
      },

      [EnumAuthAbilityContext.MEMBER_MANAGEMENT]: {
        title: {
          [EnumAppLanguage.EN]: 'Membership',
          [EnumAppLanguage.VI]: 'Thành viên',
        },
        subjects: [
          EnumAuthAbilitySubject.MEMBER,
          EnumAuthAbilitySubject.MEMBER_TIER,
          EnumAuthAbilitySubject.MEMBER_POINT,
          EnumAuthAbilitySubject.MEMBER_REDEMPTION,
          EnumAuthAbilitySubject.MEMBER_NOTIFICATION,
        ],
      },

      [EnumAuthAbilityContext.CATALOG_MANAGEMENT]: {
        title: {
          [EnumAppLanguage.EN]: 'Catalog',
          [EnumAppLanguage.VI]: 'Danh mục',
        },
        subjects: [
          EnumAuthAbilitySubject.PRODUCT,
          EnumAuthAbilitySubject.PRODUCT_BRAND,
          EnumAuthAbilitySubject.PRODUCT_CATEGORY,
          EnumAuthAbilitySubject.PRODUCT_REVIEW,
        ],
      },

      [EnumAuthAbilityContext.SALES_MANAGEMENT]: {
        title: {
          [EnumAppLanguage.EN]: 'Sales',
          [EnumAppLanguage.VI]: 'Bán hàng',
        },
        subjects: [EnumAuthAbilitySubject.ORDER, EnumAuthAbilitySubject.INVOICE],
      },

      [EnumAuthAbilityContext.MARKETING_MANAGEMENT]: {
        title: {
          [EnumAppLanguage.EN]: 'Marketing',
          [EnumAppLanguage.VI]: 'Tiếp thị',
        },
        subjects: [
          EnumAuthAbilitySubject.NOTIFICATION,
          EnumAuthAbilitySubject.PUSH,
          EnumAuthAbilitySubject.PUSH_GROUP,
        ],
      },

      [EnumAuthAbilityContext.LOCATION_MANAGEMENT]: {
        title: {
          [EnumAppLanguage.EN]: 'Location',
          [EnumAppLanguage.VI]: 'Địa chỉ',
        },
        subjects: [EnumAuthAbilitySubject.COUNTRY, EnumAuthAbilitySubject.DISTRICT],
      },

      [EnumAuthAbilityContext.MEDIA_MANAGEMENT]: {
        title: {
          [EnumAppLanguage.EN]: 'Media',
          [EnumAppLanguage.VI]: 'Hình ảnh',
        },
        subjects: [EnumAuthAbilitySubject.MEDIA],
      },

      [EnumAuthAbilityContext.SETTING_MANAGEMENT]: {
        title: {
          [EnumAppLanguage.EN]: 'Settings',
          [EnumAppLanguage.VI]: 'Cài đặt',
        },
        subjects: [
          EnumAuthAbilitySubject.ROLE,
          EnumAuthAbilitySubject.TIER,
          EnumAuthAbilitySubject.PAGE,
          EnumAuthAbilitySubject.API_KEY,
          EnumAuthAbilitySubject.APP_VERSION,
          EnumAuthAbilitySubject.POINT_SCHEMA,
        ],
      },
    }
  }

  static get subjects(): { [subject: string]: IAuthAbilityDataTitle } {
    return {
      [EnumAuthAbilitySubject.DASHBOARD]: {
        [EnumAppLanguage.EN]: 'Dashboard',
        [EnumAppLanguage.VI]: 'Bảng điều khiển',
      },
      [EnumAuthAbilitySubject.SETTING]: {
        [EnumAppLanguage.EN]: 'Settings',
        [EnumAppLanguage.VI]: 'Cài đặt',
      },
      [EnumAuthAbilitySubject.MEDIA]: {
        [EnumAppLanguage.EN]: 'Media',
        [EnumAppLanguage.VI]: 'Hình Ảnh',
      },
      [EnumAuthAbilitySubject.API_KEY]: {
        [EnumAppLanguage.EN]: 'Api Keys',
        [EnumAppLanguage.VI]: 'Api Keys',
      },
      [EnumAuthAbilitySubject.APP_VERSION]: {
        [EnumAppLanguage.EN]: 'App Versions',
        [EnumAppLanguage.VI]: 'Phiên bản',
      },
      [EnumAuthAbilitySubject.USER]: {
        [EnumAppLanguage.EN]: 'Users',
        [EnumAppLanguage.VI]: 'Người dùng',
      },
      [EnumAuthAbilitySubject.ROLE]: {
        [EnumAppLanguage.EN]: 'Roles',
        [EnumAppLanguage.VI]: 'Vai trò',
      },
      [EnumAuthAbilitySubject.PERMISSION]: {
        [EnumAppLanguage.EN]: 'Permissions',
        [EnumAppLanguage.VI]: 'Quyền hạn',
      },
      [EnumAuthAbilitySubject.PAGE]: {
        [EnumAppLanguage.EN]: 'Information & Policies',
        [EnumAppLanguage.VI]: 'Thông tin & Chính sách',
      },
      [EnumAuthAbilitySubject.COUNTRY]: {
        [EnumAppLanguage.EN]: 'Countries',
        [EnumAppLanguage.VI]: 'Quốc gia',
      },
      [EnumAuthAbilitySubject.DISTRICT]: {
        [EnumAppLanguage.EN]: 'Districts',
        [EnumAppLanguage.VI]: 'Quận/Huyện',
      },
      [EnumAuthAbilitySubject.NOTIFICATION]: {
        [EnumAppLanguage.EN]: 'Campaigns',
        [EnumAppLanguage.VI]: 'Chiến dịch',
      },
      [EnumAuthAbilitySubject.PUSH]: {
        [EnumAppLanguage.EN]: 'Pushes',
        [EnumAppLanguage.VI]: 'Gửi thông báo',
      },
      [EnumAuthAbilitySubject.PUSH_GROUP]: {
        [EnumAppLanguage.EN]: 'Push Groups',
        [EnumAppLanguage.VI]: 'Nhóm thông báo',
      },
      [EnumAuthAbilitySubject.MEMBER]: {
        [EnumAppLanguage.EN]: 'Members',
        [EnumAppLanguage.VI]: 'Thành viên',
      },
      [EnumAuthAbilitySubject.MEMBER_TIER]: {
        [EnumAppLanguage.EN]: 'Member Tiers',
        [EnumAppLanguage.VI]: 'Cấp độ thành viên',
      },
      [EnumAuthAbilitySubject.MEMBER_POINT]: {
        [EnumAppLanguage.EN]: 'Member Points',
        [EnumAppLanguage.VI]: 'Điểm thành viên',
      },
      [EnumAuthAbilitySubject.MEMBER_NOTIFICATION]: {
        [EnumAppLanguage.EN]: 'Member Notifications',
        [EnumAppLanguage.VI]: 'Thông báo thành viên',
      },
      [EnumAuthAbilitySubject.MEMBER_REDEMPTION]: {
        [EnumAppLanguage.EN]: 'Member Redemptions',
        [EnumAppLanguage.VI]: 'Lịch sử đổi quà',
      },
      [EnumAuthAbilitySubject.MEMBER_PUSH]: {
        [EnumAppLanguage.EN]: 'Member Pushes',
        [EnumAppLanguage.VI]: 'Lịch sử gửi tin',
      },
      [EnumAuthAbilitySubject.PRODUCT]: {
        [EnumAppLanguage.EN]: 'Products',
        [EnumAppLanguage.VI]: 'Sản phẩm',
      },
      [EnumAuthAbilitySubject.PRODUCT_BRAND]: {
        [EnumAppLanguage.EN]: 'Brands',
        [EnumAppLanguage.VI]: 'Thương hiệu',
      },
      [EnumAuthAbilitySubject.PRODUCT_CATEGORY]: {
        [EnumAppLanguage.EN]: 'Categories',
        [EnumAppLanguage.VI]: 'Danh mục',
      },
      [EnumAuthAbilitySubject.PRODUCT_REVIEW]: {
        [EnumAppLanguage.EN]: 'Reviews',
        [EnumAppLanguage.VI]: 'Đánh giá',
      },
      [EnumAuthAbilitySubject.CART]: {
        [EnumAppLanguage.EN]: 'Carts',
        [EnumAppLanguage.VI]: 'Giỏ hàng',
      },
      [EnumAuthAbilitySubject.ORDER]: {
        [EnumAppLanguage.EN]: 'Orders',
        [EnumAppLanguage.VI]: 'Đơn hàng',
      },
      [EnumAuthAbilitySubject.INVOICE]: {
        [EnumAppLanguage.EN]: 'Invoices',
        [EnumAppLanguage.VI]: 'Hóa đơn',
      },
      [EnumAuthAbilitySubject.PAYMENT]: {
        [EnumAppLanguage.EN]: 'Payments',
        [EnumAppLanguage.VI]: 'Thanh toán',
      },
      [EnumAuthAbilitySubject.TIER]: {
        [EnumAppLanguage.EN]: 'Tiers',
        [EnumAppLanguage.VI]: 'Cấp bậc',
      },
      [EnumAuthAbilitySubject.POINT_SCHEMA]: {
        [EnumAppLanguage.EN]: 'Point Schemas',
        [EnumAppLanguage.VI]: 'Sơ đồ điểm',
      },
    }
  }

  private static getInvisiblePerms(): EnumAuthAbilitySubject[] {
    return [
      EnumAuthAbilitySubject.PERMISSION,
      EnumAuthAbilitySubject.SETTING,
      EnumAuthAbilitySubject.CART,
      EnumAuthAbilitySubject.COUNTRY,
      EnumAuthAbilitySubject.DISTRICT,
      EnumAuthAbilitySubject.PUSH,
      EnumAuthAbilitySubject.POINT_SCHEMA,
    ]
  }

  private static getDisablePerms(): EnumAuthAbilitySubject[] {
    return []
  }

  private static getImportablePerms(): EnumAuthAbilitySubject[] {
    return []
  }

  private static getExportablePerms(): EnumAuthAbilitySubject[] {
    return []
  }

  private static getCustomActionPerms(): Record<string, EnumAuthAbilityAction[]> {
    return {
      [EnumAuthAbilitySubject.DASHBOARD]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.PAGE]: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
      [EnumAuthAbilitySubject.CART]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.API_KEY]: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
      [EnumAuthAbilitySubject.APP_VERSION]: [
        EnumAuthAbilityAction.READ,
        EnumAuthAbilityAction.UPDATE,
      ],
      [EnumAuthAbilitySubject.POINT_SCHEMA]: [
        EnumAuthAbilityAction.READ,
        EnumAuthAbilityAction.UPDATE,
      ],
      [EnumAuthAbilitySubject.TIER]: [EnumAuthAbilityAction.READ, EnumAuthAbilityAction.UPDATE],
      [EnumAuthAbilitySubject.MEMBER_TIER]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.MEMBER_POINT]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.MEMBER_NOTIFICATION]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.ORDER]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.INVOICE]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.PAYMENT]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.NOTIFICATION]: [
        EnumAuthAbilityAction.READ,
        EnumAuthAbilityAction.CREATE,
        EnumAuthAbilityAction.UPDATE,
      ],
      [EnumAuthAbilitySubject.PUSH]: [EnumAuthAbilityAction.READ],
      [EnumAuthAbilitySubject.PUSH_GROUP]: [
        EnumAuthAbilityAction.READ,
        EnumAuthAbilityAction.CREATE,
        EnumAuthAbilityAction.UPDATE,
      ],
    }
  }

  private static getSubjectActions(subject: EnumAuthAbilitySubject): EnumAuthAbilityAction[] {
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

  private static getSubjectContext(subject: EnumAuthAbilitySubject): string {
    for (const context in this.contexts) {
      const subjects = this.contexts[context].subjects
      if (subjects.includes(subject)) {
        return context
      }
    }
    return null
  }

  private static getSubjectPath(subject: EnumAuthAbilitySubject): string {
    return StrUtil.kebabCase(subject)
  }

  static getFullPermData(): Prisma.PermissionUncheckedCreateInput[] {
    const _disables = UserAbilityUtil.getDisablePerms()
    const _invisibles = UserAbilityUtil.getInvisiblePerms()

    const permissions: Prisma.PermissionUncheckedCreateInput[] = []
    Object.values(EnumAuthAbilitySubject).forEach(subject => {
      const actions = UserAbilityUtil.getSubjectActions(subject)
      permissions.push({
        subject,
        path: UserAbilityUtil.getSubjectPath(subject),
        title: this.subjects[subject],
        context: UserAbilityUtil.getSubjectContext(subject),
        bitwise: UserAbilityUtil.map2Bitwise(actions),
        isActive: !_disables.includes(subject),
        isVisible: !_invisibles.includes(subject),
      })
    })
    return permissions
  }

  static map2Actions(bitwise: number = 0): EnumAuthAbilityAction[] {
    return Object.values(EnumAuthAbilityAction).filter((_, index) => (bitwise & (1 << index)) !== 0)
  }

  static map2Bitwise(actions: EnumAuthAbilityAction[] = []): number {
    const allActions = Object.values(EnumAuthAbilityAction)

    return actions.reduce((bitwise, action) => {
      const index = allActions.indexOf(action)
      if (index === -1) {
        return bitwise
      }
      return bitwise | (1 << index)
    }, 0)
  }

  static getSubjectOrder(subject: string): number {
    let sorting = 10
    for (const context in this.contexts) {
      const subjects = this.contexts[context].subjects
      if (subjects.includes(subject)) {
        const index = subjects.indexOf(subject)
        return sorting + index
      }
      sorting += 10
    }
    return sorting
  }

  static getContextTitle(context: string): string {
    return AppUtil.getMessageValue(this.contexts[context]?.title, {
      language: ScopeContext.getReqLang(),
      fallbackValue: '',
    })
  }

  static getPermTitle(title: Prisma.JsonValue): string {
    return AppUtil.getMessageValue(title as unknown as IMessageField<string>, {
      language: ScopeContext.getReqLang(),
      fallbackValue: '',
    })
  }
}

// cspell:enable
