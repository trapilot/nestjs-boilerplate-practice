import { Prisma } from '@prisma/client'

const writeNowAllowError = new Prisma.PrismaClientKnownRequestError(
  'Write operations are not allowed on this read-only client.',
  {
    code: 'P2016',
    clientVersion: Prisma.prismaVersion.client,
    meta: {
      details: 'Write operations are not allowed on this read-only client.',
    },
  },
)

export const withReplica = Prisma.defineExtension({
  model: {
    $allModels: {
      /**
       * Disables write methods on the model.
       * When this method is called, it will throw an error.
       */
      async create() {
        throw writeNowAllowError
      },
      async createMany() {
        throw writeNowAllowError
      },
      async update() {
        throw writeNowAllowError
      },
      async updateMany() {
        throw writeNowAllowError
      },
      async delete() {
        throw writeNowAllowError
      },
      async deleteMany() {
        throw writeNowAllowError
      },
      async upsert() {
        throw writeNowAllowError
      },
    },
  },
})
