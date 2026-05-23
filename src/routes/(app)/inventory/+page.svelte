<script lang="ts">
  import { liveQuery } from 'dexie'
  import { inventoryService } from '$lib/modules/inventory/service'

  let search   = $state('')
  let category = $state('')
  let lowStock = $state(false)
  let products = $state<any[]>([])

  $effect(() => {
    const sub = liveQuery(() =>
      inventoryService.getProducts({ search, category, lowStock: lowStock || undefined })
    ).subscribe({
      next: (data) => { products = data ?? [] },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  async function handleDelete(id: string) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    await inventoryService.deleteProduct(id)
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)
  }
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">Stok Yönetimi</h1>
      <p class="text-sm text-slate-500 mt-1">{products.length} ürün</p>
    </div>
    <a href="/inventory/new"
      class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Yeni Ürün
    </a>
  </div>

  <!-- Filtreler -->
  <div class="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex flex-wrap gap-3">
    <input type="text" bind:value={search} placeholder="Ürün ara..."
      class="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-300 text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    <input type="text" bind:value={category} placeholder="Kategori..."
      class="w-40 px-3 py-2 rounded-lg border border-slate-300 text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
      <input type="checkbox" bind:checked={lowStock} class="rounded" />
      Düşük stok
    </label>
  </div>

  <!-- Tablo -->
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-slate-200 bg-slate-50">
          <th class="text-left px-4 py-3 font-medium text-slate-600">Ürün</th>
          <th class="text-left px-4 py-3 font-medium text-slate-600">SKU</th>
          <th class="text-left px-4 py-3 font-medium text-slate-600">Kategori</th>
          <th class="text-right px-4 py-3 font-medium text-slate-600">Stok</th>
          <th class="text-right px-4 py-3 font-medium text-slate-600">Fiyat</th>
          <th class="text-center px-4 py-3 font-medium text-slate-600">Sync</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {#each products as p (p.id)}
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3">
              <a href="/inventory/{p.id}" class="font-medium text-slate-900 hover:text-indigo-600">
                {p.name}
              </a>
              {#if !p.is_active}
                <span class="ml-2 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Pasif</span>
              {/if}
            </td>
            <td class="px-4 py-3 text-slate-500 font-mono text-xs">{p.sku ?? '-'}</td>
            <td class="px-4 py-3">
              {#if p.category}
                <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{p.category}</span>
              {:else}
                <span class="text-slate-300">-</span>
              {/if}
            </td>
            <td class="px-4 py-3 text-right">
              <span class="font-medium {p.stock <= p.min_stock ? 'text-red-600' : 'text-slate-900'}">
                {p.stock}
              </span>
              <span class="text-slate-400 text-xs ml-1">{p.unit}</span>
              {#if p.stock <= p.min_stock}
                <span class="ml-1 text-xs text-red-500">⚠</span>
              {/if}
            </td>
            <td class="px-4 py-3 text-right font-medium">{formatCurrency(p.price)}</td>
            <td class="px-4 py-3 text-center">
              {#if p._synced === 1}
                <span class="text-green-500 text-xs" title="Senkronize">✓</span>
              {:else}
                <span class="text-orange-400 text-xs" title="Bekliyor">⏳</span>
              {/if}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <a href="/inventory/{p.id}"
                  class="text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </a>
                <button onclick={() => handleDelete(p.id)}
                  class="text-slate-400 hover:text-red-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="7" class="px-4 py-12 text-center text-slate-400">
              Ürün bulunamadı
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>