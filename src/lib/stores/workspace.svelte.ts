import { localDb, type LocalWorkspace, type LocalBrand } from '$lib/db/local'
import { liveQuery } from 'dexie'
import { browser } from '$app/environment'

const ACTIVE_WORKSPACE_KEY = 'erp_active_workspace'
const ACTIVE_BRAND_KEY = 'erp_active_brand'

let _activeWorkspaceId = $state<string | null>(
  browser ? localStorage.getItem(ACTIVE_WORKSPACE_KEY) : null
)
let _activeBrandId = $state<string | null>(
  browser ? localStorage.getItem(ACTIVE_BRAND_KEY) : null
)
let _workspaces = $state<LocalWorkspace[]>([])
let _brands = $state<LocalBrand[]>([])

// Workspace listesini canlı dinle
if (browser) {
  liveQuery(() =>
    localDb.workspaces.where('_deleted').equals(0).toArray()
  ).subscribe({
    next: (data) => {
      _workspaces = data ?? []
      // Aktif workspace yoksa ilkini seç
      if (!_activeWorkspaceId && data.length > 0) {
        workspaceStore.setActiveWorkspace(data[0].id)
      }
    }
  })

  liveQuery(() =>
    _activeWorkspaceId
      ? localDb.brands
          .where('workspace_id').equals(_activeWorkspaceId)
          .filter(b => b._deleted === 0)
          .toArray()
      : Promise.resolve([])
  ).subscribe({
    next: (data) => {
      _brands = data ?? []
      if (!_activeBrandId && data.length > 0) {
        workspaceStore.setActiveBrand(data[0].id)
      }
    }
  })
}

export const workspaceStore = {
  get workspaces()        { return _workspaces },
  get brands()            { return _brands },
  get activeWorkspaceId() { return _activeWorkspaceId },
  get activeBrandId()     { return _activeBrandId },

  get activeWorkspace(): LocalWorkspace | null {
    return _workspaces.find(w => w.id === _activeWorkspaceId) ?? null
  },

  get activeBrand(): LocalBrand | null {
    return _brands.find(b => b.id === _activeBrandId) ?? null
  },

  setActiveWorkspace(id: string) {
    _activeWorkspaceId = id
    _activeBrandId = null
    if (browser) {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, id)
      localStorage.removeItem(ACTIVE_BRAND_KEY)
    }
  },

  setActiveBrand(id: string) {
    _activeBrandId = id
    if (browser) localStorage.setItem(ACTIVE_BRAND_KEY, id)
  }
}