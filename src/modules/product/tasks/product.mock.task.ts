import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EnumProductExpiryType } from '@runtime/prisma-client'
import {
  EnumMessageLanguage,
  EnumScopeType,
  HelperService,
  LoggerService,
  ScopeAsync,
  StrUtil,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'

@Injectable()
export class ProductMockTask {
  private readonly dateStarted: Date
  private readonly mockupNumbers: number = 100

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly helperService: HelperService,
  ) {
    this.dateStarted = this.config.get<Date>('app.startDate')
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    disabled: StrUtil.isNotTrue(process.env.AUTO_GEN_MODE),
  })
  @ScopeAsync(EnumScopeType.CRON, {
    context: 'cron.product_mockup',
  })
  async mockup(): Promise<void> {
    this.logger.log(`${ProductMockTask.name} is running`)

    const remainNumbers = await this.runWithNumbers()
    if (remainNumbers <= 0) {
      this.logger.warn(`${ProductMockTask.name} stopped`)
      return
    }

    const mockupNumbers = Math.min(this.mockupNumbers, remainNumbers)
    const lastProduct = await this.prisma.product.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })

    const dateCheck = lastProduct ? lastProduct.createdAt : this.dateStarted

    const categories = await this.getOrCreateCategories()
    const brands = await this.getOrCreateBrands()
    const dateExecute = this.helperService.dateForward(dateCheck, {
      days: faker.number.int({ min: 1, max: 2 }),
    })

    try {
      for (let i = 0; i < mockupNumbers; i++) {
        const costPrice = faker.number.int({ min: 0, max: 1000 })
        const salePoint = faker.number.int({ min: 0, max: 500 })
        const stockQty = faker.number.int({ min: 100, max: 999 })
        const duePaidDays = faker.number.int({ min: 7, max: 90 })
        const code = this.helperService.padZero(i + 1, 8, 'P')
        const salePerPerson = faker.number.int({ min: 1, max: 10 })

        const hasShipment = faker.datatype.boolean()
        const hasInventory = faker.datatype.boolean()
        const hasExpiration = faker.datatype.boolean()
        const hasDuePayment = faker.datatype.boolean()
        const hasLimitPerson = faker.datatype.boolean()

        let expiryType: EnumProductExpiryType = EnumProductExpiryType.DYNAMIC
        let staticExpiryDate = undefined
        let dynamicExpiryDays = faker.number.int({ min: 7, max: 30 })
        if (Math.floor(Math.random() * 2)) {
          expiryType = EnumProductExpiryType.STATIC
          staticExpiryDate = this.helperService.dateCreate(faker.date.future(), { endOfDay: true })
          dynamicExpiryDays = undefined
        }

        const category = categories[Math.floor(Math.random() * categories.length)]
        const brand = brands[Math.floor(Math.random() * brands.length)]

        await this.prisma.product.create({
          data: {
            categoryId: category.id,
            brandId: brand.id,
            name: {
              [EnumMessageLanguage.EN]: faker.commerce.productName(),
              [EnumMessageLanguage.VI]: faker.commerce.productName(),
              [EnumMessageLanguage.HK]: faker.commerce.productName(),
            },
            languages: {
              createMany: {
                data: [
                  {
                    language: EnumMessageLanguage.EN,
                    content: `<p>${faker.lorem.paragraphs(5, '<br/>\n')}</p>`,
                    termAndCond: `<p>${faker.lorem.sentences(5, '<br/>\n')}</p>`,
                  },
                  {
                    language: EnumMessageLanguage.VI,
                    content: `<p>${faker.lorem.paragraphs(5, '<br/>\n')}</p>`,
                    termAndCond: `<p>${faker.lorem.sentences(5, '<br/>\n')}</p>`,
                  },
                  {
                    language: EnumMessageLanguage.HK,
                    content: `<p>${faker.lorem.paragraphs(5, '<br/>\n')}</p>`,
                    termAndCond: `<p>${faker.lorem.sentences(5, '<br/>\n')}</p>`,
                  },
                ],
                skipDuplicates: true,
              },
            },
            sku: code,
            costPrice,
            salePoint,
            salePrice: costPrice * 1.5,
            hasShipment,
            hasInventory,
            hasExpiration,
            hasLimitPerson,
            hasDuePayment,
            duePaidDays: hasDuePayment ? duePaidDays : undefined,
            expiryType: hasExpiration ? expiryType : undefined,
            staticExpiryDate: hasExpiration ? staticExpiryDate : undefined,
            dynamicExpiryDays: hasExpiration ? dynamicExpiryDays : undefined,
            stockQty: hasInventory ? stockQty : undefined,
            salePerPerson: hasLimitPerson ? salePerPerson : undefined,
            createdAt: dateExecute,
            updatedAt: dateExecute,
          },
        })
      }
    } catch (err: any) {
      this.logger.error(err)
    } finally {
      this.logger.warn(`${ProductMockTask.name} done`)
    }

    return
  }

  private async runWithNumbers(): Promise<number> {
    const limitProducts = StrUtil.numeric(process.env.AUTO_GEN_PRODUCT_NUMB, 0)
    if (limitProducts <= 0) return 0

    const totalProducts = await this.prisma.product.count()
    return limitProducts - totalProducts
  }

  private async getOrCreateCategories() {
    const exists = await this.prisma.productCategory.exists()
    if (!exists) {
      await this.prisma.productCategory.createMany({
        data: ['Barber', 'Hair removal', 'Med spa', 'Nails', 'Tanning', 'Braids'].map((name) => {
          return {
            name: {
              [EnumMessageLanguage.EN]: name,
              [EnumMessageLanguage.VI]: name,
              [EnumMessageLanguage.HK]: name,
            },
            createdAt: this.dateStarted,
            updatedAt: this.dateStarted,
          }
        }),
        skipDuplicates: true,
      })
    }

    return await this.prisma.productCategory.findMany()
  }

  private async getOrCreateBrands() {
    const exists = await this.prisma.productBrand.exists()
    if (!exists) {
      const BRANDS = ['L Oreal', 'Unilever', 'Procter & Gamble', 'LVMH', 'Beiersdorf', 'Coty Inc']
      await this.prisma.productBrand.createMany({
        data: BRANDS.map((name) => {
          return {
            name: {
              [EnumMessageLanguage.EN]: name,
              [EnumMessageLanguage.VI]: name,
              [EnumMessageLanguage.HK]: name,
            },
            address: faker.location.streetAddress(),
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
            createdAt: this.dateStarted,
            updatedAt: this.dateStarted,
          }
        }),
        skipDuplicates: true,
      })
    }

    return await this.prisma.productBrand.findMany()
  }
}
