import { ArrUtil } from 'lib/nest-core'
import { PrismaContext } from '../helpers'
import { IPrismaClientConfigOptions, IPrismaLoggerHooks } from '../interfaces'
import { PrismaUtil } from '../utils'
import { PrismaClusterManager } from './prisma.cluster.manager'

export class PrismaTenantManager {
  private tenantClusters = new Map<string, PrismaClusterManager>()

  constructor(
    private readonly tenantConfigs: IPrismaClientConfigOptions[],
    private readonly loggerHooks: IPrismaLoggerHooks,
  ) {}

  async pick(): Promise<PrismaClusterManager> {
    let ctx = PrismaContext.getStore()
    if (!ctx) throw new Error('Tenant context is missing')

    let clusterManager = this.tenantClusters.get(ctx.tenantId)
    if (!clusterManager) {
      const tenant = ArrUtil.find<IPrismaClientConfigOptions>(this.tenantConfigs, {
        field: 'key',
        value: ctx.tenantId,
      })
      if (!tenant) throw new Error('Tenant options do not config yet')

      const { writer, readers } = PrismaUtil.setupClient(tenant.provider, {
        writeUrl: tenant.master,
        readUrls: tenant?.slaves ?? [],
        replication: tenant?.replication ?? false,
        loggerHooks: this.loggerHooks,
      })

      clusterManager = new PrismaClusterManager(writer, readers)

      await clusterManager.connect()
      this.tenantClusters.set(ctx.tenantId, clusterManager)
    }
    return clusterManager
  }

  async disconnect() {
    await Promise.all(
      Array.from(this.tenantClusters.values()).map((clusterManager) => clusterManager.disconnect()),
    )
  }
}
