import { localDb, type LocalWorkspace, type LocalBrand } from '$lib/db/local'
import { pushWorkspace, pushBrand } from '$lib/sync/instantSync'
import { authStore } from '$lib/stores/auth.svelte'
import { workspaceStore } from '$lib/stores/workspace.svelte'

function newId() { return crypto.randomUUID() }
function now()   { return new Date().toISOString() }

export const workspaceService = {

  async getWorkspaces() {
    return localDb.workspaces.where('_deleted').equals(0).toArray()
  },

  async createWorkspace(data: { name: string; slug: string; description?: string }) {
    const workspace: LocalWorkspace = {
      id:          newId(),
      name:        data.name,
      slug:        data.slug.toLowerCase().replace(/\s+/g, '-'),
      description: data.description ?? null,
      created_by:  authStore.user?.id ?? null,
      created_at:  now(),
      updated_at:  now(),
      _synced:     0,
      _deleted:    0
    }
    await localDb.workspaces.add(workspace)
    try {
      await pushWorkspace(workspace)
      await localDb.workspaces.update(workspace.id, { _synced: 1 })
    } catch {}
    return workspace
  },

  async updateWorkspace(id: string, data: Partial<LocalWorkspace>) {
    const changes = { ...data, updated_at: now(), _synced: 0 as const }
    await localDb.workspaces.update(id, changes)
    try {
      await pushWorkspace({ id, ...changes })
      await localDb.workspaces.update(id, { _synced: 1 })
    } catch {}
  },

  async deleteWorkspace(id: string) {
    await localDb.workspaces.update(id, { _deleted: 1, _synced: 0 })
    try { await pushWorkspace({ id, _deleted: 1 }) } catch {}
  },

  // ── Brands ──────────────────────────────────────

  async getBrands(workspaceId?: string) {
    const wsId = workspaceId ?? workspaceStore.activeWorkspaceId ?? ''
    return localDb.brands
      .where('workspace_id').equals(wsId)
      .filter(b => b._deleted === 0)
      .toArray()
  },

  async createBrand(data: {
    name: string
    code?: string
    description?: string
    logo_url?: string
    workspace_id?: string
  }) {
    const wsId = data.workspace_id ?? workspaceStore.activeWorkspaceId ?? ''
    const brand: LocalBrand = {
      id:           newId(),
      workspace_id: wsId,
      name:         data.name,
      code:         data.code ?? null,
      description:  data.description ?? null,
      logo_url:     data.logo_url ?? null,
      is_active:    true,
      created_by:   authStore.user?.id ?? null,
      created_at:   now(),
      updated_at:   now(),
      _synced:      0,
      _deleted:     0
    }
    await localDb.brands.add(brand)
    try {
      await pushBrand(brand)
      await localDb.brands.update(brand.id, { _synced: 1 })
    } catch {}
    return brand
  },

  async updateBrand(id: string, data: Partial<LocalBrand>) {
    const changes = { ...data, updated_at: now(), _synced: 0 as const }
    await localDb.brands.update(id, changes)
    try {
      await pushBrand({ id, ...changes })
      await localDb.brands.update(id, { _synced: 1 })
    } catch {}
  },

  async deleteBrand(id: string) {
    await localDb.brands.update(id, { _deleted: 1, _synced: 0 })
    try { await pushBrand({ id, _deleted: 1 }) } catch {}
  }
}