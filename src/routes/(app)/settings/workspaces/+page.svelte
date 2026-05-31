<script lang="ts">
  import { liveQuery } from 'dexie'
  import { localDb } from '$lib/db/local'
  import { workspaceService } from '$lib/modules/workspace/service'
  import { workspaceStore } from '$lib/stores/workspace.svelte'
  import { goto } from '$app/navigation'

  let workspaces = $state<any[]>([])
  let showForm = $state(false)
  let loading  = $state(false)
  let error    = $state('')

  let form = $state({ name: '', slug: '', description: '' })

  $effect(() => {
    const sub = liveQuery(() =>
      localDb.workspaces.where('_deleted').equals(0).toArray()
    ).subscribe({
      next: (data) => { workspaces = data ?? [] },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  function onNameInput() {
    form.slug = form.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!form.name.trim()) { error = 'Çalışma alanı adı zorunludur'; return }
    error   = ''
    loading = true
    try {
      const ws = await workspaceService.createWorkspace(form)
      workspaceStore.setActiveWorkspace(ws.id)
      form = { name: '', slug: '', description: '' }
      showForm = false
    } catch (err: any) {
      error = err.message ?? 'Hata oluştu'
    } finally {
      loading = false
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu çalışma alanını silmek istediğinize emin misiniz?')) return
    await workspaceService.deleteWorkspace(id)
  }
</script>

<div class="p-6 max-w-3xl">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">Çalışma Alanları</h1>
      <p class="text-sm text-slate-500 mt-1">{workspaces.length} çalışma alanı</p>
    </div>
    <button
      onclick={() => showForm = !showForm}
      class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
    >
      + Yeni Çalışma Alanı
    </button>
  </div>

  <!-- Form -->
  {#if showForm}
    <div class="bg-white rounded-xl border border-slate-200 p-5 mb-5">
      <h2 class="text-sm font-medium text-slate-700 mb-4">Yeni çalışma alanı</h2>
      <form onsubmit={handleSubmit} class="space-y-4">
        {#if error}
          <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        {/if}
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Ad *</label>
            <input bind:value={form.name} oninput={onNameInput} type="text" required
              class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Slug</label>
            <input bind:value={form.slug} type="text"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Açıklama</label>
            <input bind:value={form.description} type="text"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button type="button" onclick={() => showForm = false}
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
            İptal
          </button>
          <button type="submit" disabled={loading}
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Liste -->
  <div class="space-y-3">
    {#each workspaces as ws (ws.id)}
      <div class="bg-white rounded-xl border-2 p-4 flex items-center justify-between transition-all
        {workspaceStore.activeWorkspaceId === ws.id ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200'}">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {ws.name[0]?.toUpperCase()}
          </div>
          <div>
            <p class="font-medium text-slate-900">{ws.name}</p>
            <p class="text-xs text-slate-400 font-mono">{ws.slug}</p>
            {#if ws.description}
              <p class="text-xs text-slate-500 mt-0.5">{ws.description}</p>
            {/if}
          </div>
        </div>
        <div class="flex items-center gap-2">
          {#if workspaceStore.activeWorkspaceId === ws.id}
            <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Aktif</span>
          {:else}
            <button
              onclick={() => workspaceStore.setActiveWorkspace(ws.id)}
              class="text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Seç
            </button>
          {/if}
          <a href="/settings/workspaces/{ws.id}/brands"
            class="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            Markalar
          </a>
          <button onclick={() => handleDelete(ws.id)}
            class="text-slate-400 hover:text-red-500 transition-colors text-xs">✕</button>
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        Henüz çalışma alanı yok —
        <button onclick={() => showForm = true} class="text-indigo-600 hover:underline">yeni oluştur</button>
      </div>
    {/each}
  </div>
</div>