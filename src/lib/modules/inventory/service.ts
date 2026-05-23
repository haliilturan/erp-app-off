import { localDb, type LocalProduct } from '$lib/db/local'
import { pushProduct } from '$lib/sync/instantSync'
import { networkStore } from '$lib/stores/network.svelte'

function newId() {
  return crypto.randomUUID()
}

export const inventoryService = {

  async getProducts(filters?: { search?: string; category?: string; lowStock?: boolean }) {
    let results = await localDb.products
      .where('_deleted').equals(0)
      .toArray()

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      )
    }
    if (filters?.category) {
      results = results.filter(p => p.category === filters.category)
    }
    if (filters?.lowStock) {
      results = results.filter(p => p.stock <= p.min_stock)
    }
    return results.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
  },

  async getProduct(id: string) {
    return localDb.products.get(id)
  },

  async createProduct(data: Omit<LocalProduct, 'id' | 'created_at' | 'updated_at' | '_synced' | '_deleted'>) {
    const now = new Date().toISOString()
    const product: LocalProduct = {
      id:         newId(),
      created_at: now,
      updated_at: now,
      _synced:    0,
      _deleted:   0,
      ...data
    }
    // Önce local'e yaz (optimistic)
    await localDb.products.add(product)
    // Sonra InstantDB'ye gönder
    try {
      await pushProduct(product)
      await localDb.products.update(product.id, { _synced: 1 })
    } catch {
      // Offline — local'de 0 kalır, sonra sync olur
    }
    return product
  },

  async updateProduct(id: string, data: Partial<LocalProduct>) {
    const now = new Date().toISOString()
    const changes = { ...data, updated_at: now, _synced: 0 as const }
    await localDb.products.update(id, changes)
    try {
      await pushProduct({ id, ...changes })
      await localDb.products.update(id, { _synced: 1 })
    } catch {}
  },

  async deleteProduct(id: string) {
    await localDb.products.update(id, { _deleted: 1, _synced: 0 })
    try {
      await pushProduct({ id, _deleted: 1 })
    } catch {}
  },

  async adjustStock(id: string, quantity: number, note: string) {
    const product = await localDb.products.get(id)
    if (!product) throw new Error('Ürün bulunamadı')
    const newStock = product.stock + quantity
    if (newStock < 0) throw new Error('Stok yetersiz')
    await this.updateProduct(id, { stock: newStock })
  },

  async getCategories() {
    const all = await localDb.products.where('_deleted').equals(0).toArray()
    return [...new Set(all.map(p => p.category).filter(Boolean))] as string[]
  },

  async getLowStockProducts() {
    const all = await localDb.products.where('_deleted').equals(0).toArray()
    return all.filter(p => p.stock <= p.min_stock)
  }
}