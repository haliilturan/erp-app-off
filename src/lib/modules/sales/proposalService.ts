import { localDb, type LocalProposal, type LocalProposalItem } from '$lib/db/local'
import { pushProposal } from '$lib/sync/instantSync'
import { workspaceStore } from '$lib/stores/workspace.svelte'
import { authStore } from '$lib/stores/auth.svelte'

function newId() { return crypto.randomUUID() }
function now()   { return new Date().toISOString() }

export type ProposalStatus = 'offer' | 'dialogue' | 'negotiation' | 'on_hold' | 'rejected' | 'order'

export const statusLabels: Record<ProposalStatus, string> = {
  offer:       'Teklif',
  dialogue:    'Görüşme',
  negotiation: 'Müzakere',
  on_hold:     'Beklemede',
  rejected:    'Reddedildi',
  order:       'Siparişe Döndü'
}

export const statusColors: Record<ProposalStatus, string> = {
  offer:       'bg-blue-50 text-blue-700 border-blue-200',
  dialogue:    'bg-violet-50 text-violet-700 border-violet-200',
  negotiation: 'bg-amber-50 text-amber-700 border-amber-200',
  on_hold:     'bg-slate-100 text-slate-600 border-slate-200',
  rejected:    'bg-red-50 text-red-700 border-red-200',
  order:       'bg-green-50 text-green-700 border-green-200'
}

// Pipeline sırası
export const pipeline: ProposalStatus[] = [
  'offer', 'dialogue', 'negotiation', 'on_hold', 'rejected', 'order'
]

export const proposalService = {

  async getProposals(filters?: {
    search?:      string
    status?:      ProposalStatus
    customer_id?: string
  }) {
    let results = await localDb.proposals
      .where('_deleted').equals(0)
      .toArray()

    if (filters?.status) {
      results = results.filter(p => p.status === filters.status)
    }
    if (filters?.customer_id) {
      results = results.filter(p => p.customer_id === filters.customer_id)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(p =>
        p.proposal_no?.toLowerCase().includes(q) ||
        p.customer_name?.toLowerCase().includes(q)
      )
    }
    return results.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },

  async getProposal(id: string) {
    const proposal = await localDb.proposals.get(id)
    const items    = await localDb.proposal_items
      .where('proposal_id').equals(id).toArray()
    return { proposal, items }
  },

  async createProposal(
    data: Omit<LocalProposal, 'id' | 'created_at' | 'updated_at' | '_synced' | '_deleted'>,
    items: Omit<LocalProposalItem, 'id' | 'proposal_id'>[]
  ) {
    const proposal: LocalProposal = {
      id:          newId(),
      created_at:  now(),
      updated_at:  now(),
      _synced:     0,
      _deleted:    0,
      ...data
    }
    const proposalItems: LocalProposalItem[] = items.map(item => ({
      ...item,
      id:          newId(),
      proposal_id: proposal.id
    }))

    await localDb.proposals.add(proposal)
    if (proposalItems.length > 0) {
      await localDb.proposal_items.bulkAdd(proposalItems)
    }

    try {
      await pushProposal(proposal, proposalItems)
      await localDb.proposals.update(proposal.id, { _synced: 1 })
    } catch {}

    return proposal
  },

  async updateStatus(id: string, status: ProposalStatus) {
    await localDb.proposals.update(id, {
      status,
      updated_at: now(),
      _synced:    0
    })
    try {
      await pushProposal({ id, status, updated_at: now() }, [])
      await localDb.proposals.update(id, { _synced: 1 })
    } catch {}
  },

  async updateProposal(id: string, data: Partial<LocalProposal>) {
    const changes = { ...data, updated_at: now(), _synced: 0 as const }
    await localDb.proposals.update(id, changes)
    try {
      await pushProposal({ id, ...changes }, [])
      await localDb.proposals.update(id, { _synced: 1 })
    } catch {}
  },

  async deleteProposal(id: string) {
    await localDb.proposals.update(id, { _deleted: 1, _synced: 0 })
    try { await pushProposal({ id, _deleted: 1 }, []) } catch {}
  },

  // Pipeline istatistikleri
  async getPipelineStats() {
    const all = await localDb.proposals.where('_deleted').equals(0).toArray()
    const stats: Record<string, { count: number; total: number }> = {}
    for (const status of pipeline) {
      const filtered = all.filter(p => p.status === status)
      stats[status] = {
        count: filtered.length,
        total: filtered.reduce((s, p) => s + p.total, 0)
      }
    }
    return stats
  },

  // Teklifi siparişe çevir
  async convertToOrder(proposalId: string) {
    const { proposal, items } = await this.getProposal(proposalId)
    if (!proposal) throw new Error('Teklif bulunamadı')

    // Önce teklif durumunu güncelle
    await this.updateStatus(proposalId, 'order')

    // Sipariş oluştur
    const { salesService } = await import('./service')
    const order = await salesService.createOrder(
      {
        workspace_id:  proposal.workspace_id,
        brand_id:      proposal.brand_id,
        customer_id:   proposal.customer_id,
        customer_name: proposal.customer_name,
        order_no:      'SIP-' + Date.now().toString().slice(-6),
        status:        'confirmed',
        total:         proposal.total,
        notes:         `Teklif ${proposal.proposal_no} üzerinden oluşturuldu`,
        created_by:    proposal.created_by
      },
      items.map(i => ({
        order_id:     '',
        product_id:   i.product_id,
        product_name: i.product_name,
        quantity:     i.quantity,
        unit_price:   i.unit_price,
        total:        i.total
      }))
    )
    return order
  }
}