import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ENUM_PRODUCT_EXPIRY } from '@prisma/client'
import { ENUM_MESSAGE_LANGUAGE, HelperService, NEST_CLI } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner, Option } from 'nest-commander'

@Command({
  name: 'product:seed',
  description: 'Seed products',
})
export class ProductSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {
    super()
  }

  async run(_passedParam: string[], options?: any): Promise<void> {
    this.logger.warn(`${ProductSeedCommand.name} is running...`)

    try {
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=0`
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE products`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE product_reviews`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE product_languages`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE product_brands`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE product_categories`)
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=1`

      const startDate = this.config.get<Date>('app.startDate')
      const dateNow = this.helperService.dateCreate()

      let categories = await this.prisma.productCategory.findMany()
      if (categories.length === 0) {
        await this.prisma.productCategory.createMany({
          data: ['Barber', 'Hair removal', 'Med spa', 'Nails', 'Tanning', 'Braids'].map((name) => {
            return {
              name: {
                [ENUM_MESSAGE_LANGUAGE.EN]: name,
                [ENUM_MESSAGE_LANGUAGE.VI]: name,
                [ENUM_MESSAGE_LANGUAGE.HK]: name,
              },
              createdAt: dateNow,
              updatedAt: dateNow,
            }
          }),
          skipDuplicates: true,
        })
        categories = await this.prisma.productCategory.findMany()
      }

      let brands = await this.prisma.productBrand.findMany()
      if (brands.length === 0) {
        // cspell:disable
        const BRANDS = ['L’Oréal', 'Unilever', 'Procter & Gamble', 'LVMH', 'Beiersdorf', 'Coty Inc']
        // cspell:enable
        await this.prisma.productBrand.createMany({
          data: BRANDS.map((name) => {
            return {
              name: {
                [ENUM_MESSAGE_LANGUAGE.EN]: name,
                [ENUM_MESSAGE_LANGUAGE.VI]: name,
                [ENUM_MESSAGE_LANGUAGE.HK]: name,
              },
              address: faker.location.streetAddress(),
              latitude: faker.location.latitude(),
              longitude: faker.location.longitude(),
              createdAt: dateNow,
              updatedAt: dateNow,
            }
          }),
          skipDuplicates: true,
        })
        brands = await this.prisma.productBrand.findMany()
      }

      await this.prisma.$queryRaw`ALTER TABLE products DISABLE KEYS;`
      // let products: Prisma.ProductUncheckedCreateInput[] = []
      for (let i = 0; i < options.numbers; i++) {
        const costPrice = faker.number.int({ min: 0, max: 10_000 })
        const salePoint = faker.number.int({ min: 0, max: 1_000 })
        const stockQty = faker.number.int({ min: 1, max: 999 })
        const duePaidDays = faker.number.int({ min: 7, max: 90 })
        const code = this.helperService.padZero(i + 1, 8, 'P')
        const salePerPerson = faker.number.int({ min: 1, max: 10 })

        const hasShipment = faker.datatype.boolean()
        const hasInventory = faker.datatype.boolean()
        const hasExpiration = faker.datatype.boolean()
        const hasDuePayment = faker.datatype.boolean()
        const hasLimitPerson = faker.datatype.boolean()

        let expiryType: ENUM_PRODUCT_EXPIRY = ENUM_PRODUCT_EXPIRY.DYNAMIC
        let staticExpiryDate = undefined
        let dynamicExpiryDays = faker.number.int({ min: 7, max: 30 })
        if (Math.floor(Math.random() * 2)) {
          expiryType = ENUM_PRODUCT_EXPIRY.STATIC
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
              [ENUM_MESSAGE_LANGUAGE.EN]: faker.commerce.productName(),
              [ENUM_MESSAGE_LANGUAGE.VI]: faker.commerce.productName(),
              [ENUM_MESSAGE_LANGUAGE.HK]: faker.commerce.productName(),
            },
            languages: {
              createMany: {
                data: [
                  {
                    language: ENUM_MESSAGE_LANGUAGE.EN,
                    content: `<p>${faker.lorem.paragraphs(5, '<br/>\n')}</p>`,
                    termAndCond: `<p>${faker.lorem.sentences(5, '<br/>\n')}</p>`,
                  },
                  {
                    language: ENUM_MESSAGE_LANGUAGE.VI,
                    content: `<p>${faker.lorem.paragraphs(5, '<br/>\n')}</p>`,
                    termAndCond: `<p>${faker.lorem.sentences(5, '<br/>\n')}</p>`,
                  },
                  {
                    language: ENUM_MESSAGE_LANGUAGE.HK,
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
            createdAt: startDate,
            updatedAt: startDate,
          },
        })

        // if (products.length === 500 || i === options.numbers - 1) {
        //   await this.prisma.$executeRaw(PrismaUtil.buildBulkInsert(products, tableName))
        //   products = []
        // }
      }
    } catch (err: any) {
      throw new Error(err.message)
    } finally {
      // await this.prisma.$queryRaw`ALTER TABLE ${Prisma.raw(tableName)} ENABLE KEYS;`
    }

    return
  }

  @Option({
    flags: '-i, --numbers [number]',
    description: 'Number of products to generate',
    required: true,
  })
  parseNumber(val: string): number {
    return Number(val)
  }
}
