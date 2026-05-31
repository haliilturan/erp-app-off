import { db } from '$lib/db/instant'
import { localDb } from '$lib/db/local'
import { id } from '@instantdb/core'

function clean(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !k.startsWith('_'))
  )
}

// ── Sync functions ──────────────────────────────────

export function syncWorkspaces(userId: string) {
  return db.subscribeQuery({ workspaces: {} }, (result) => {
    if (result.error || !result.data?.workspaces) return
    localDb.workspaces.bulkPut(
      result.data.workspaces
        .filter((w: any) => w.created_by === userId)
        .map((w: any) => ({ ...w, _synced: 1, _deleted: 0 }))
    )
  })
}

export function syncBrands(workspaceId: string) {
  return db.subscribeQuery({ brands: {} }, (result) => {
    if (result.error || !result.data?.brands) return
    localDb.brands.bulkPut(
      result.data.brands
        .filter((b: any) => b.workspace_id === workspaceId)
        .map((b: any) => ({ ...b, _synced: 1, _deleted: 0 }))
    )
  })
}

export function syncProducts(workspaceId: string) {
  return db.subscribeQuery({ products: {} }, (result) => {
    if (result.error || !result.data?.products) return
    localDb.products.bulkPut(
      result.data.products
        .filter((p: any) => p.workspace_id === workspaceId)
        .map((p: any) => ({ ...p, _synced: 1, _deleted: 0 }))
    )
  })
}

export function syncCustomers(workspaceId: string) {
  return db.subscribeQuery({ customers: {} }, (result) => {
    if (result.error || !result.data?.customers) return
    localDb.customers.bulkPut(
      result.data.customers
        .filter((c: any) => c.workspace_id === workspaceId)
        .map((c: any) => ({ ...c, _synced: 1, _deleted: 0 }))
    )
  })
}

export function syncOrders(workspaceId: string) {
  return db.subscribeQuery({ orders: {} }, (result) => {
    if (result.error || !result.data?.orders) return
    localDb.orders.bulkPut(
      result.data.orders
        .filter((o: any) => o.workspace_id === workspaceId)
        .map((o: any) => ({ ...o, _synced: 1, _deleted: 0 }))
    )
  })
}

export function syncProposals(workspaceId: string) {
  return db.subscribeQuery({ proposals: {} }, (result) => {
    if (result.error || !result.data?.proposals) return
    localDb.proposals.bulkPut(
      result.data.proposals
        .filter((p: any) => p.workspace_id === workspaceId)
        .map((p: any) => ({ ...p, _synced: 1, _deleted: 0 }))
    )
  })
}

export function startSync(workspaceId: string, userId: string) {
  const unsubs = [
    syncWorkspaces(userId),
    syncBrands(workspaceId),
    syncProducts(workspaceId),
    syncCustomers(workspaceId),
    syncOrders(workspaceId),
    syncProposals(workspaceId),
  ]
  return () => unsubs.forEach(fn => fn())
}

// ── Push functions ──────────────────────────────────

export async function pushRecord(table: string, data: any) {
  const recordId = data.id ?? id()
  await db.transact(
    (db.tx as any)[table][recordId].update(clean({ ...data, id: recordId }))
  )
  return recordId
}

export async function pushWorkspace(data: any) {
  return pushRecord('workspaces', data)
}

export async function pushBrand(data: any) {
  return pushRecord('brands', data)
}

export async function pushProduct(data: any) {
  return pushRecord('products', data)
}

export async function pushCustomer(data: any) {
  return pushRecord('customers', data)
}

export async function pushOrder(orderData: any, items: any[]) {
  const orderId = orderData.id ?? id()
  const txns: any[] = [
    (db.tx as any).orders[orderId].update(clean({ ...orderData, id: orderId }))
  ]
  items.forEach(item => {
    const itemId = item.id ?? id()
    txns.push(
      (db.tx as any).order_items[itemId].update(
        clean({ ...item, id: itemId, order_id: orderId })
      )
    )
  })
  await db.transact(txns)
  return orderId
}

export async function pushProposal(proposalData: any, items: any[]) {
  const proposalId = proposalData.id ?? id()
  const txns: any[] = [
    (db.tx as any).proposals[proposalId].update(
      clean({ ...proposalData, id: proposalId })
    )
  ]
  items.forEach(item => {
    const itemId = item.id ?? id()
    txns.push(
      (db.tx as any).proposal_items[itemId].update(
        clean({ ...item, id: itemId, proposal_id: proposalId })
      )
    )
  })
  await db.transact(txns)
  return proposalId
}