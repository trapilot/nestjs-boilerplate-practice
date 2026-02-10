import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnumExpiryType } from '@runtime/prisma-client'
import { EnumAppLanguage, HelperService, ScheduleMockupBase, StrUtil } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { TProductBrand } from 'modules/product-brand/interfaces/product-brand.interface'
import { TProductCategory } from 'modules/product-category/interfaces/product-category.interface'

@Injectable()
export class ProductMock extends ScheduleMockupBase {
  private readonly dateStarted: Date
  private readonly mockupNumbers: number = 100

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {
    super()

    this.dateStarted = this.config.get<Date>('app.startDate')
  }

  async mockup(): Promise<void> {
    const remainNumbers = await this.getRemainNumbers()
    const mockupNumbers = Math.min(this.mockupNumbers, remainNumbers)

    if (mockupNumbers <= 0) {
      return
    }

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
      const salePoint = this.helperService.randomNumber({ min: 0, max: 5 })
      const stockQty = this.helperService.randomNumber({ min: 100, max: 999 })
      const duePaidDays = this.helperService.randomNumber({ min: 7, max: 90 })
      const code = this.helperService.padZero(i + 1, { length: 8, prefix: 'P' })
      const salePerPerson = 1

      const hasShipment = !this.helperService.randomNumber({ min: 0, max: 1 })
      const hasInventory = !this.helperService.randomNumber({ min: 0, max: 1 })
      const hasExpiration = !this.helperService.randomNumber({ min: 0, max: 1 })
      const hasDuePayment = !this.helperService.randomNumber({ min: 0, max: 1 })
      const hasLimitPerson = !this.helperService.randomNumber({ min: 0, max: 1 })

      let expiryType: EnumExpiryType = EnumExpiryType.DYNAMIC
      let staticExpiryDate = undefined
      let dynamicExpiryDays = this.helperService.randomNumber({ min: 7, max: 30 })
      if (Math.floor(Math.random() * 2)) {
        expiryType = EnumExpiryType.STATIC
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
            [EnumAppLanguage.EN]: `Product No #0${i + 1}`,
            [EnumAppLanguage.VI]: `Product No #0${i + 1}`,
            [EnumAppLanguage.HK]: `Product No #0${i + 1}`,
          },
          languages: {
            createMany: {
              data: [
                {
                  language: EnumAppLanguage.EN,
                  content: `<p>Product content #0${i + 1}</p>`,
                  termAndCond: `<p>Product term and condition #0${i + 1}</p>`,
                },
                {
                  language: EnumAppLanguage.VI,
                  content: `<p>Product content #0${i + 1}</p>`,
                  termAndCond: `<p>Product term and condition #0${i + 1}</p>`,
                },
                {
                  language: EnumAppLanguage.HK,
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
    const limitProducts = StrUtil.numeric(process.env.AUTO_GEN_PRODUCT_NUMB, 0)
    if (limitProducts <= 0) {
      return 0
    }

    const totalProducts = await this.prisma.product.count()
    return Math.max(0, limitProducts - totalProducts)
  }

  private async getOrCreateCategories(): Promise<TProductCategory[]> {
    const exists = await this.prisma.productCategory.exists()
    if (!exists) {
      await this.prisma.productCategory.createMany({
        data: ['Barber', 'Hair removal', 'Med spa', 'Nails', 'Tanning', 'Braids'].map(name => {
          return {
            name: {
              [EnumAppLanguage.EN]: name,
              [EnumAppLanguage.VI]: name,
              [EnumAppLanguage.HK]: name,
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
              [EnumAppLanguage.EN]: name,
              [EnumAppLanguage.VI]: name,
              [EnumAppLanguage.HK]: name,
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
