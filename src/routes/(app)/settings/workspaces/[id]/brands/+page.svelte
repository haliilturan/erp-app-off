<script lang="ts">
  import { page } from '$app/stores'
  import { liveQuery } from 'dexie'
  import { localDb } from '$lib/db/local'
  import { workspaceService } from '$lib/modules/workspace/service'
  import { workspaceStore } from '$lib/stores/workspace.svelte'

  const workspaceId = $page.params.id ?? ''

  let brands    = $state<any[]>([])
  let workspace = $state<any>(null)
  let showForm  = $state(false)
  let loading   = $state(false)
  let error     = $state('')

  let form = $state({ name: '', code: '', description: '' })

  $effect(() => {
    localDb.workspaces.get(workspaceId).then(ws => { workspace = ws })

    const sub = liveQuery(() =>
      localDb.brands
        .where('workspace_id').equals(workspaceId)
        .filter(b => b._deleted === 0)
        .toArray()
    ).subscribe({
      next: (data) => { brands = data ?? [] },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!form.name.trim()) { error = 'Marka adı zorunludur'; return }
    error   = ''
    loading = true
    try {
      await workspaceService.createBrand({ ...form, workspace_id: workspaceId })
      form = { name: '', code: '', description: '' }
      showForm = false
    } catch (err: any) {
      error = err.message ?? 'Hata oluştu'
    } finally {
      loading = false
    }
  }

  async function toggleActive(id: string, current: boolean) {
    await workspaceService.updateBrand(id, { is_active: !current })
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu markayı silmek istediğinize emin misiniz?')) return
    await workspaceService.deleteBrand(id)
  }
</script>

<div class="p-6 max-w-3xl">

  <!-- Başlık -->
  <div class="flex items-center gap-3 mb-6">
    <a href="/settings/workspaces" class="text-slate-400 hover:text-slate-600">← Geri</a>
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">
        {workspace?.name ?? '...'} — Markalar
      </h1>
      <p class="text-sm text-slate-500 mt-0.5">{brands.length} marka</p>
    </div>
    <button
      type="button"
      onclick={() => showForm = !showForm}
      class="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
    >
      + Yeni Marka
    </button>
  </div>

  <!-- Form -->
  {#if showForm}
    <div class="bg-white rounded-xl border border-slate-200 p-5 mb-5">
      <form onsubmit={handleSubmit} class="space-y-4" novalidate>
        {#if error}
          <div role="alert" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        {/if}
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="brand-name" class="block text-sm font-medium text-slate-700 mb-1.5">
              Marka Adı *
            </label>
            <input
              id="brand-name"
              bind:value={form.name}
              type="text"
              required
              class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label for="brand-code" class="block text-sm font-medium text-slate-700 mb-1.5">
              Kod
            </label>
            <input
              id="brand-code"
              bind:value={form.code}
              type="text"
              placeholder="ör: MARKA-01"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="col-span-2">
            <label for="brand-desc" class="block text-sm font-medium text-slate-700 mb-1.5">
              Açıklama
            </label>
            <input
              id="brand-desc"
              bind:value={form.description}
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            onclick={() => showForm = false}
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Tablo -->
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-slate-200 bg-slate-50">
          <th scope="col" class="text-left px-4 py-3 font-medium text-slate-600">Marka</th>
          <th scope="col" class="text-left px-4 py-3 font-medium text-slate-600">Kod</th>
          <th scope="col" class="text-left px-4 py-3 font-medium text-slate-600">Açıklama</th>
          <th scope="col" class="text-center px-4 py-3 font-medium text-slate-600">Durum</th>
          <th scope="col" class="px-4 py-3"><span class="sr-only">İşlemler</span></th>
        </tr>
      </thead>
      <tbody>
        {#each brands as b (b.id)}
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">

            <!-- Marka adı -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div
                  aria-hidden="true"
                  class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs"
                >
                  {b.name[0]?.toUpperCase()}
                </div>
                <span class="font-medium text-slate-900">{b.name}</span>
              </div>
            </td>

            <!-- Kod -->
            <td class="px-4 py-3 text-slate-500 font-mono text-xs">{b.code ?? '-'}</td>

            <!-- Açıklama -->
            <td class="px-4 py-3 text-slate-500">{b.description ?? '-'}</td>

            <!-- Durum -->
            <td class="px-4 py-3 text-center">
              <button
                type="button"
                onclick={() => toggleActive(b.id, b.is_active)}
                aria-label="{b.is_active ? 'Pasife al' : 'Aktife al'}: {b.name}"
                class="px-2 py-0.5 rounded-full text-xs font-medium transition-colors
                  {b.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}"
              >
                {b.is_active ? 'Aktif' : 'Pasif'}
              </button>
            </td>

            <!-- İşlemler -->
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                {#if workspaceStore.activeBrandId === b.id}
                  <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                    Aktif marka
                  </span>
                {:else}
                  <button
                    type="button"
                    onclick={() => workspaceStore.setActiveBrand(b.id)}
                    aria-label="{b.name} markasını aktif yap"
                    class="text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Seç
                  </button>
                {/if}
                <button
                  type="button"
                  onclick={() => handleDelete(b.id)}
                  aria-label="{b.name} markasını sil"
                  class="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>

          </tr>
        {:else}
          <tr>
            <td colspan="5" class="px-4 py-12 text-center text-slate-400">
              Henüz marka yok —
              <button
                type="button"
                onclick={() => showForm = true}
                class="text-indigo-600 hover:underline"
              >
                yeni ekle
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

</div>