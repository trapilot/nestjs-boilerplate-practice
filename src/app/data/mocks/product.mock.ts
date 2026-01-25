import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnumProductExpiryType } from '@runtime/prisma-client'
import { EnumMessageLanguage, HelperService, ScheduleMockupBase, StrUtil } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { TProductBrand } from 'modules/product-brand'
import { TProductCategory } from 'modules/product-category'

@Injectable()
export class ProductMock extends ScheduleMockupBase {
  private readonly dateStarted: Date
  private readonly mockupNumbers: number = 100
  private remainNumbers: number = null

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService
  ) {
    super()

    this.dateStarted = this.config.get<Date>('app.startDate')
  }

  async mockup(): Promise<void> {
    const remainNumbers = await this.getRemainNumbers()
    const mockupNumbers = Math.min(this.mockupNumbers, remainNumbers)

    if (mockupNumbers <= 0) {return}

    const lastProduct = await this.prisma.product.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })

    const dateCheck = lastProduct ? lastProduct.createdAt : this.dateStarted

    const categories = await this.getOrCreateCategories()
    const brands = await this.getOrCreateBrands()
    const dateExecute = this.helperService.dateForward(dateCheck, {
      days: this.helperService.randomNumber({ min: 1, max: 2 }),
    })

    for (let i = 0; i < mockupNumbers; i++) {
      const costPrice = this.helperService.randomNumber({ min: 0, max: 1000 })
      const salePoint = this.helperService.randomNumber({ min: 0, max: 500 })
      const stockQty = this.helperService.randomNumber({ min: 100, max: 999 })
      const duePaidDays = this.helperService.randomNumber({ min: 7, max: 90 })
      const code = this.helperService.padZero(i + 1, { length: 8, prefix: 'P' })
      const salePerPerson = 1

      const hasShipment = !this.helperService.randomNumber({ min: 0, max: 1 })
      const hasInventory = !this.helperService.randomNumber({ min: 0, max: 1 })
      const hasExpiration = !this.helperService.randomNumber({ min: 0, max: 1 })
      const hasDuePayment = !this.helperService.randomNumber({ min: 0, max: 1 })
      const hasLimitPerson = !this.helperService.randomNumber({ min: 0, max: 1 })

      let expiryType: EnumProductExpiryType = EnumProductExpiryType.DYNAMIC
      let staticExpiryDate = undefined
      let dynamicExpiryDays = this.helperService.randomNumber({ min: 7, max: 30 })
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
  }

  async mockable(): Promise<boolean> {
    const remainNumbers = await this.getRemainNumbers()
    return remainNumbers > 0
  }

  async getRemainNumbers(): Promise<number> {
    if (this.remainNumbers === null) {
      const limitProducts = StrUtil.numeric(process.env.AUTO_GEN_PRODUCT_NUMB, 0)
      if (limitProducts <= 0) {return 0}

      const totalProducts = await this.prisma.product.count()
      this.remainNumbers = Math.max(0, limitProducts - totalProducts)
    }
    return this.remainNumbers
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
