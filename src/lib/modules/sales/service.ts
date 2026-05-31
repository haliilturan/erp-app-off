import { localDb, type LocalOrder, type LocalOrderItem, type LocalCustomer } from '$lib/db/local'
import { pushOrder, pushCustomer } from '$lib/sync/instantSync'

function newId() { return crypto.randomUUID() }
function now()   { return new Date().toISOString() }

export const salesService = {

  async getOrders(filters?: { status?: string; search?: string }) {
    let results = await localDb.orders
      .where('_deleted').equals(0)
      .toArray()

    if (filters?.status) {
      results = results.filter(o => o.status === filters.status)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(o =>
        o.order_no?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q)
      )
    }
    return results.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },

  async getOrder(id: string) {
    const order = await localDb.orders.get(id)
    const items = await localDb.order_items.where('order_id').equals(id).toArray()
    return { order, items }
  },

  async createOrder(
    orderData: Omit<LocalOrder, 'id' | 'created_at' | 'updated_at' | '_synced' | '_deleted'>,
    items: Omit<LocalOrderItem, 'id'>[]
  ) {
    const order: LocalOrder = {
      id:         newId(),
      created_at: now(),
      updated_at: now(),
      _synced:    0,
      _deleted:   0,
      ...orderData
    }
    const orderItems: LocalOrderItem[] = items.map(item => ({
      ...item,
      id:       newId(),
      order_id: order.id
    }))

    await localDb.orders.add(order)
    if (orderItems.length > 0) await localDb.order_items.bulkAdd(orderItems)

    try {
      await pushOrder(order, orderItems)
      await localDb.orders.update(order.id, { _synced: 1 })
    } catch {}

    return order
  },

  async updateOrderStatus(id: string, status: LocalOrder['status']) {
    await localDb.orders.update(id, { status, updated_at: now(), _synced: 0 })
    try { await pushOrder({ id, status, updated_at: now() }, []) } catch {}
  },

  async getCustomers(filters?: {
    search?:   string
    industry?: string
    country?:  string
  }) {
    let results = await localDb.customers
      .where('_deleted').equals(0)
      .toArray()

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.tax_no?.toLowerCase().includes(q)
      )
    }
    if (filters?.industry) {
      results = results.filter(c => c.industry === filters.industry)
    }
    if (filters?.country) {
      results = results.filter(c => c.country === filters.country)
    }

    return results.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
  },

  async getCustomerStats() {
    const all = await localDb.customers.where('_deleted').equals(0).toArray()
    const industries = [...new Set(
      all.map(c => c.industry).filter((v): v is string => v !== null && v !== undefined)
    )]
    const countries = [...new Set(
      all.map(c => c.country).filter((v): v is string => v !== null && v !== undefined)
    )]
    return { total: all.length, industries, countries }
  },

  async createCustomer(data: {
    name:        string
    email?:      string | null
    phone?:      string | null
    address?:    string | null
    tax_no?:     string | null
    industry?:   string | null
    country?:    string | null
    notes?:      string | null
    workspace_id?: string
  }) {
    const customer: LocalCustomer = {
      id:           newId(),
      workspace_id: data.workspace_id ?? '',
      name:         data.name,
      email:        data.email ?? null,
      phone:        data.phone ?? null,
      address:      data.address ?? null,
      tax_no:       data.tax_no ?? null,
      industry:     data.industry ?? null,
      country:      data.country ?? null,
      notes:        data.notes ?? null,
      created_at:   now(),
      updated_at:   now(),
      _synced:      0,
      _deleted:     0
    }
    await localDb.customers.add(customer)
    try {
      await pushCustomer(customer)
      await localDb.customers.update(customer.id, { _synced: 1 })
    } catch {}
    return customer
  },

  async getOrderStats() {
    const orders = await localDb.orders.where('_deleted').equals(0).toArray()
    return {
      total:     orders.length,
      draft:     orders.filter(o => o.status === 'draft').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped:   orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      pending:   orders.filter(o => o.status === 'confirmed').length,
      revenue:   orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0)
    }
  }
}