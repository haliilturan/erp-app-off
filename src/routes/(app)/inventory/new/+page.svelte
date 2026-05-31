<script lang="ts">
  import { goto } from '$app/navigation'
  import { inventoryService } from '$lib/modules/inventory/service'
  import { workspaceStore } from '$lib/stores/workspace.svelte'

  let form = $state({
    name:         '',
    sku:          '',
    description:  '',
    category:     '',
    unit:         'adet',
    price:        0,
    cost:         0,
    stock:        0,
    min_stock:    0,
    is_active:    true,
    workspace_id: workspaceStore.activeWorkspaceId ?? '',
    brand_id:     workspaceStore.activeBrandId ?? null
  })

  let error   = $state('')
  let loading = $state(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!form.name.trim()) { error = 'Ürün adı zorunludur'; return }
    error   = ''
    loading = true
    try {
      await inventoryService.createProduct(form)
      goto('/inventory')
    } catch (err: any) {
      error = err.message ?? 'Hata oluştu'
    } finally {
      loading = false
    }
  }
</script>

<div class="p-6 max-w-2xl">
  <div class="flex items-center gap-3 mb-6">
    <a href="/inventory" class="text-slate-400 hover:text-slate-600" aria-label="Geri">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
      </svg>
    </a>
    <h1 class="text-2xl font-semibold text-slate-900">Yeni Ürün</h1>
  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-6">
    <form onsubmit={handleSubmit} class="space-y-5" novalidate>
      {#if error}
        <div role="alert" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      {/if}

      <div class="grid grid-cols-2 gap-4">

        <div class="col-span-2">
          <label for="product-name" class="block text-sm font-medium text-slate-700 mb-1.5">Ürün Adı *</label>
          <input
            id="product-name"
            bind:value={form.name}
            type="text"
            required
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="product-sku" class="block text-sm font-medium text-slate-700 mb-1.5">SKU / Barkod</label>
          <input
            id="product-sku"
            bind:value={form.sku}
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="product-category" class="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
          <input
            id="product-category"
            bind:value={form.category}
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="product-unit" class="block text-sm font-medium text-slate-700 mb-1.5">Birim</label>
          <select
            id="product-unit"
            bind:value={form.unit}
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="adet">Adet</option>
            <option value="kg">Kilogram</option>
            <option value="lt">Litre</option>
            <option value="mt">Metre</option>
            <option value="kutu">Kutu</option>
          </select>
        </div>

        <div>
          <label for="product-price" class="block text-sm font-medium text-slate-700 mb-1.5">Satış Fiyatı (₺)</label>
          <input
            id="product-price"
            bind:value={form.price}
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="product-cost" class="block text-sm font-medium text-slate-700 mb-1.5">Maliyet (₺)</label>
          <input
            id="product-cost"
            bind:value={form.cost}
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="product-stock" class="block text-sm font-medium text-slate-700 mb-1.5">Başlangıç Stoku</label>
          <input
            id="product-stock"
            bind:value={form.stock}
            type="number"
            min="0"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="product-minstock" class="block text-sm font-medium text-slate-700 mb-1.5">Minimum Stok</label>
          <input
            id="product-minstock"
            bind:value={form.min_stock}
            type="number"
            min="0"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="col-span-2">
          <label for="product-desc" class="block text-sm font-medium text-slate-700 mb-1.5">Açıklama</label>
          <textarea
            id="product-desc"
            bind:value={form.description}
            rows="3"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          ></textarea>
        </div>

      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        
         <a href="/inventory"
          class="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          İptal
        </a>
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
</div>