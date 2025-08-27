import { ContextId, ContextIdFactory, ContextIdStrategy, HostComponentInfo } from '@nestjs/core'
import { IRequestApp } from '../interfaces'

const tenants = new Map<string, ContextId>()

export class AggregateByTenantContextIdStrategy implements ContextIdStrategy {
  attach(contextId: ContextId, request: IRequestApp) {
    const tenantId = request.headers['x-tenant-id'] as string

    let tenantSubTreeId: ContextId
    if (tenants.has(tenantId)) {
      tenantSubTreeId = tenants.get(tenantId)
    } else {
      tenantSubTreeId = ContextIdFactory.create()
      tenants.set(tenantId, tenantSubTreeId)
    }

    return {
      resolve: (info: HostComponentInfo) => (info.isTreeDurable ? tenantSubTreeId : contextId),
      payload: { tenantId },
    }
  }
}
