import Dexie, { type Table } from 'dexie'

export interface LocalProduct {
  id: string
  company_id: string
  name: string
  sku: string | null
  description: string | null
  category: string | null
  unit: string
  price: number
  cost: number
  stock: number
  min_stock: number
  is_active: boolean
  created_at: string
  updated_at: string
  _synced: 0 | 1
  _deleted: 0 | 1
}

export interface LocalCustomer {
  id: string
  company_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  tax_no: string | null
  notes: string | null
  created_at: string
  updated_at: string
  _synced: 0 | 1
  _deleted: 0 | 1
}

export interface LocalOrder {
  id: string
  company_id: string
  customer_id: string | null
  customer_name: string | null
  order_no: string | null
  status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  notes: string | null
  created_at: string
  updated_at: string
  _synced: 0 | 1
  _deleted: 0 | 1
}

export interface LocalOrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export interface LocalStockMovement {
  id: string
  company_id: string
  product_id: string
  product_name: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  note: string | null
  created_at: string
  _synced: 0 | 1
}

class ErpDatabase extends Dexie {
  products!:         Table<LocalProduct>
  customers!:        Table<LocalCustomer>
  orders!:           Table<LocalOrder>
  order_items!:      Table<LocalOrderItem>
  stock_movements!:  Table<LocalStockMovement>

  constructor() {
    super('erp_db_v1')
    this.version(1).stores({
      products:        'id, company_id, sku, category, _synced, _deleted, updated_at',
      customers:       'id, company_id, email, _synced, _deleted',
      orders:          'id, company_id, customer_id, status, _synced, _deleted, created_at',
      order_items:     'id, order_id, product_id',
      stock_movements: 'id, company_id, product_id, type, created_at, _synced'
    })
  }
}

export const localDb = new ErpDatabase()