import { db } from '$lib/db/instant'
import { localDb } from '$lib/db/local'
import { networkStore } from '$lib/stores/network.svelte'
import { id } from '@instantdb/core'

// Ürünleri InstantDB'den dinle ve local'e yaz
export function syncProducts(companyId: string) {
  return db.subscribeQuery(
    { products: {} },
    (result) => {
      if (result.error) { console.error('[sync] products:', result.error); return }
      if (!result.data?.products) return

      const products = result.data.products
        .filter((p: any) => p.company_id === companyId)

      localDb.products.bulkPut(
        products.map((p: any) => ({ ...p, _synced: 1, _deleted: 0 }))
      )
    }
  )
}

export function syncCustomers(companyId: string) {
  return db.subscribeQuery(
    { customers: {} },
    (result) => {
      if (result.error || !result.data?.customers) return
      const customers = result.data.customers
        .filter((c: any) => c.company_id === companyId)
      localDb.customers.bulkPut(
        customers.map((c: any) => ({ ...c, _synced: 1, _deleted: 0 }))
      )
    }
  )
}

export function syncOrders(companyId: string) {
  return db.subscribeQuery(
    { orders: { order_items: {} } },
    (result) => {
      if (result.error || !result.data?.orders) return
      const orders = result.data.orders
        .filter((o: any) => o.company_id === companyId)

      localDb.orders.bulkPut(
        orders.map((o: any) => ({ ...o, _synced: 1, _deleted: 0 }))
      )

      const items = orders.flatMap((o: any) => o.order_items ?? [])
      if (items.length > 0) localDb.order_items.bulkPut(items)
    }
  )
}

// Tüm sync aboneliklerini başlat
export function startSync(companyId: string) {
  const unsubs = [
    syncProducts(companyId),
    syncCustomers(companyId),
    syncOrders(companyId),
  ]
  return () => unsubs.forEach(fn => fn())
}

// InstantDB'ye veri yaz (online olunca direkt, offline olunca local'de bekler)
export async function pushProduct(data: any) {
  const recordId = data.id ?? id()
  await db.transact(
    db.tx.products[recordId].update({
      ...data,
      id: recordId,
      updated_at: new Date().toISOString()
    })
  )
  return recordId
}

export async function pushCustomer(data: any) {
  const recordId = data.id ?? id()
  await db.transact(
    db.tx.customers[recordId].update({ ...data, id: recordId })
  )
  return recordId
}

export async function pushOrder(orderData: any, items: any[]) {
  const orderId = orderData.id ?? id()
  
  if (items.length === 0) {
    await db.transact(
      db.tx.orders[orderId].update({ ...orderData, id: orderId })
    )
    return orderId
  }

  const txns: any[] = [
    db.tx.orders[orderId].update({ ...orderData, id: orderId })
  ]
  items.forEach(item => {
    const itemId = item.id ?? id()
    txns.push(
      db.tx.order_items[itemId].update({ ...item, id: itemId, order_id: orderId })
    )
    txns.push(db.tx.orders[orderId].link({ order_items: itemId }))
  })
  await db.transact(txns)
  return orderId
}