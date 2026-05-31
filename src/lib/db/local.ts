import Dexie, { type Table } from 'dexie'

export interface LocalWorkspace {
  id: string
  name: string
  slug: string
  description: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  _synced: 0 | 1
  _deleted: 0 | 1
}

export interface LocalBrand {
  id: string
  workspace_id: string
  name: string
  code: string | null
  description: string | null
  logo_url: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  _synced: 0 | 1
  _deleted: 0 | 1
}

export interface LocalProduct {
  id: string
  workspace_id: string
  brand_id: string | null
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
  workspace_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  tax_no: string | null
  country: string | null
  industry: string | null
  notes: string | null
  created_at: string
  updated_at: string
  _synced: 0 | 1
  _deleted: 0 | 1
}

export interface LocalOrder {
  id: string
  workspace_id: string
  brand_id: string | null
  customer_id: string | null
  customer_name: string | null
  order_no: string | null
  status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  _synced: 0 | 1
  _deleted: 0 | 1
}

export interface LocalOrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export interface LocalProposal {
  id: string
  workspace_id: string
  brand_id: string | null
  customer_id: string | null
  customer_name: string | null
  proposal_no: string | null
  status: 'offer' | 'dialogue' | 'negotiation' | 'on_hold' | 'rejected' | 'order'
  total: number
  valid_until: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  _synced: 0 | 1
  _deleted: 0 | 1
}

export interface LocalProposalItem {
  id: string
  proposal_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  discount: number
  total: number
}

export interface LocalStockMovement {
  id: string
  workspace_id: string
  product_id: string
  product_name: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  note: string | null
  created_by: string | null
  created_at: string
  _synced: 0 | 1
}

class ErpDatabase extends Dexie {
  workspaces!:      Table<LocalWorkspace>
  brands!:          Table<LocalBrand>
  products!:        Table<LocalProduct>
  customers!:       Table<LocalCustomer>
  orders!:          Table<LocalOrder>
  order_items!:     Table<LocalOrderItem>
  proposals!:       Table<LocalProposal>
  proposal_items!:  Table<LocalProposalItem>
  stock_movements!: Table<LocalStockMovement>

  constructor() {
    super('erp_db_v2')
    this.version(1).stores({
      workspaces:      'id, slug, _synced, _deleted',
      brands:          'id, workspace_id, name, _synced, _deleted',
      products:        'id, workspace_id, brand_id, sku, category, _synced, _deleted, updated_at',
      customers:       'id, workspace_id, email, industry, country, _synced, _deleted',
      orders:          'id, workspace_id, brand_id, customer_id, status, _synced, _deleted, created_at',
      order_items:     'id, order_id, product_id',
      proposals:       'id, workspace_id, brand_id, customer_id, status, _synced, _deleted, created_at',
      proposal_items:  'id, proposal_id, product_id',
      stock_movements: 'id, workspace_id, product_id, type, created_at, _synced'
    })
  }
}

export const localDb = new ErpDatabase()