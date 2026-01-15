import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EnumProductExpiryType } from '@runtime/prisma-client'
import {
  EnumMessageLanguage,
  EnumScopeType,
  HelperService,
  LoggerService,
  OnScope,
  StrUtil,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { TProductBrand } from 'modules/product-brand'
import { TProductCategory } from 'modules/product-category'

@Injectable()
export class ProductMockTask {
  private readonly dateStarted: Date
  private readonly mockupNumbers: number = 100

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly helperService: HelperService
  ) {
    this.dateStarted = this.config.get<Date>('app.startDate')
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    disabled: StrUtil.isNotTrue(process.env.AUTO_GEN_MODE),
  })
  @OnScope(EnumScopeType.CRON, {
    context: 'cron.product_mockup',
    async: true,
  })
  async mockup(): Promise<void> {
    this.logger.log(`${ProductMockTask.name} is running`)

    const remainNumbers = await this.runWithNumbers()
    if (remainNumbers <= 0) {
      this.logger.log(`${ProductMockTask.name} stopped`)
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
      days: this.helperService.randomNumberInRange(1, 2),
    })

    try {
      for (let i = 0; i < mockupNumbers; i++) {
        const costPrice = this.helperService.randomNumberInRange(0, 1000)
        const salePoint = this.helperService.randomNumberInRange(0, 500)
        const stockQty = this.helperService.randomNumberInRange(100, 999)
        const duePaidDays = this.helperService.randomNumberInRange(7, 90)
        const code = this.helperService.padZero(i + 1, 8, 'P')
        const salePerPerson = 1

        const hasShipment = !this.helperService.randomNumberInRange(0, 1)
        const hasInventory = !this.helperService.randomNumberInRange(0, 1)
        const hasExpiration = !this.helperService.randomNumberInRange(0, 1)
        const hasDuePayment = !this.helperService.randomNumberInRange(0, 1)
        const hasLimitPerson = !this.helperService.randomNumberInRange(0, 1)

        let expiryType: EnumProductExpiryType = EnumProductExpiryType.DYNAMIC
        let staticExpiryDate = undefined
        let dynamicExpiryDays = this.helperService.randomNumberInRange(7, 30)
        if (Math.floor(Math.random() * 2)) {
          expiryType = EnumProductExpiryType.STATIC
          staticExpiryDate = this.helperService.dateCreate(new Date(Date.now() + 30000 * 3600), {
            endOfDay: true,
          })
          dynamicExpiryDays = undefined
        }

        const category = categories[Math.floor(Math.random() * categories.length)]
        const brand = brands[Math.floor(Math.random() * brands.length)]

        await this.prisma.product.create({
          data: {
            categoryId: category.id,
            brandId: brand.id,
            name: {
              [EnumMessageLanguage.EN]: `Product No #0${i + 1}`,
              [EnumMessageLanguage.VI]: `Product No #0${i + 1}`,
              [EnumMessageLanguage.HK]: `Product No #0${i + 1}`,
            },
            languages: {
              createMany: {
                data: [
                  {
                    language: EnumMessageLanguage.EN,
                    content: `<p>Product content #0${i + 1}</p>`,
                    termAndCond: `<p>Product term and condition #0${i + 1}</p>`,
                  },
                  {
                    language: EnumMessageLanguage.VI,
                    content: `<p>Product content #0${i + 1}</p>`,
                    termAndCond: `<p>Product term and condition #0${i + 1}</p>`,
                  },
                  {
                    language: EnumMessageLanguage.HK,
                    content: `<p>Product content #0${i + 1}</p>`,
                    termAndCond: `<p>Product term and condition #0${i + 1}</p>`,
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
    } catch (err: unknown) {
      this.logger.error(err)
    } finally {
      this.logger.log(`${ProductMockTask.name} done`)
    }

    return
  }

  private async runWithNumbers(): Promise<number> {
    const limitProducts = StrUtil.numeric(process.env.AUTO_GEN_PRODUCT_NUMB, 0)
    if (limitProducts <= 0) {
      return 0
    }

    const totalProducts = await this.prisma.product.count()
    return limitProducts - totalProducts
  }

  private async getOrCreateCategories(): Promise<TProductCategory[]> {
    const exists = await this.prisma.productCategory.exists()
    if (!exists) {
      await this.prisma.productCategory.createMany({
        data: ['Barber', 'Hair removal', 'Med spa', 'Nails', 'Tanning', 'Braids'].map(name => {
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

  private async getOrCreateBrands(): Promise<TProductBrand[]> {
    const exists = await this.prisma.productBrand.exists()
    if (!exists) {
      const BRANDS = ['L Oreal', 'Unilever', 'Procter & Gamble', 'LVMH', 'Beiersdorf', 'Coty Inc']
      await this.prisma.productBrand.createMany({
        data: BRANDS.map(name => {
          return {
            name: {
              [EnumMessageLanguage.EN]: name,
              [EnumMessageLanguage.VI]: name,
              [EnumMessageLanguage.HK]: name,
            },
            address: `International Airport`,
            latitude: 10.8087479,
            longitude: 106.6733667,
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
