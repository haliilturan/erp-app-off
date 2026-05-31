<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { liveQuery } from 'dexie'
  import { localDb } from '$lib/db/local'
  import { proposalService, pipeline, statusLabels } from '$lib/modules/sales/proposalService'
  import { authStore } from '$lib/stores/auth.svelte'
  import { workspaceStore } from '$lib/stores/workspace.svelte'

  let customers: any[] = $state([])
  let loading  = $state(false)
  let error    = $state('')

  $effect(() => {
    const sub = liveQuery(() =>
      localDb.customers.where('_deleted').equals(0).toArray()
    ).subscribe({
      next: (data) => { customers = data ?? [] },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  let form = $state({
    customer_id:   $page.url.searchParams.get('customer_id') ?? '',
    customer_name: $page.url.searchParams.get('customer_name') ?? '',
    status:        'offer' as typeof pipeline[number],
    valid_until:   '',
    notes:         ''
  })

  let items = $state([
    { product_id: null as string | null, product_name: '', quantity: 1, unit_price: 0, discount: 0, total: 0 }
  ])

  function addItem() {
    items = [...items, { product_id: null, product_name: '', quantity: 1, unit_price: 0, discount: 0, total: 0 }]
  }

  function removeItem(i: number) {
    if (items.length === 1) return
    items = items.filter((_, idx) => idx !== i)
  }

  function updateItem(i: number, field: string, value: any) {
    items = items.map((item, idx) => {
      if (idx !== i) return item
      const updated = { ...item, [field]: value }
      const discountedPrice = updated.unit_price * (1 - updated.discount / 100)
      updated.total = Math.round(updated.quantity * discountedPrice * 100) / 100
      return updated
    })
  }

  const grandTotal = $derived(
    Math.round(items.reduce((sum, i) => sum + i.total, 0) * 100) / 100
  )

  function onCustomerChange(e: Event) {
    const id = (e.target as HTMLSelectElement).value
    const customer = customers.find(c => c.id === id)
    form.customer_id   = id
    form.customer_name = customer?.name ?? ''
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!form.customer_name.trim()) { error = 'Müşteri zorunludur'; return }
    if (items.some(i => !i.product_name.trim())) { error = 'Tüm kalemlerin ürün adı olmalıdır'; return }

    error   = ''
    loading = true
    try {
      await proposalService.createProposal(
        {
          workspace_id:  workspaceStore.activeWorkspaceId ?? '',
          brand_id:      workspaceStore.activeBrandId ?? null,
          customer_id:   form.customer_id || null,
          customer_name: form.customer_name,
          proposal_no:   'TKL-' + Date.now().toString().slice(-6),
          status:        form.status,
          total:         grandTotal,
          valid_until:   form.valid_until || null,
          notes:         form.notes || null,
          created_by:    authStore.user?.id ?? null
        },
        items.map(i => ({
          product_id:   i.product_id,
          product_name: i.product_name,
          quantity:     i.quantity,
          unit_price:   i.unit_price,
          discount:     i.discount,
          total:        i.total
        }))
      )
      goto('/sales/proposals')
    } catch (err: any) {
      error = err.message ?? 'Hata oluştu'
    } finally {
      loading = false
    }
  }
</script>

<div class="p-6 max-w-3xl">
  <div class="flex items-center gap-3 mb-6">
    <a href="/sales/proposals" class="text-slate-400 hover:text-slate-600">← Geri</a>
    <h1 class="text-2xl font-semibold text-slate-900">Yeni Teklif</h1>
  </div>

  <form onsubmit={handleSubmit} class="space-y-5" novalidate>
    {#if error}
      <div role="alert" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
    {/if}

    <!-- Müşteri & Durum -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h2 class="text-sm font-medium text-slate-700 mb-4">Genel bilgiler</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="proposal-customer" class="block text-sm font-medium text-slate-700 mb-1.5">
            Kayıtlı müşteri seç
          </label>
          <select
            id="proposal-customer"
            onchange={onCustomerChange}
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Seç --</option>
            {#each customers as c}
              <option value={c.id} selected={c.id === form.customer_id}>{c.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="proposal-customer-name" class="block text-sm font-medium text-slate-700 mb-1.5">
            Müşteri adı *
          </label>
          <input
            id="proposal-customer-name"
            bind:value={form.customer_name}
            type="text"
            required
            placeholder="Listede yoksa buraya yaz"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label for="proposal-status" class="block text-sm font-medium text-slate-700 mb-1.5">
            Başlangıç durumu
          </label>
          <select
            id="proposal-status"
            bind:value={form.status}
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {#each pipeline as s}
              <option value={s}>{statusLabels[s]}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="proposal-valid" class="block text-sm font-medium text-slate-700 mb-1.5">
            Geçerlilik tarihi
          </label>
          <input
            id="proposal-valid"
            bind:value={form.valid_until}
            type="date"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>

    <!-- Kalemler -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-medium text-slate-700">Teklif kalemleri</h2>
        <button
          type="button"
          onclick={addItem}
          class="text-xs text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          + Kalem ekle
        </button>
      </div>

      <div class="space-y-3">
        <!-- Başlık satırı -->
        <div class="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1">
          <span class="col-span-4">Ürün / Hizmet</span>
          <span class="col-span-2 text-center">Miktar</span>
          <span class="col-span-2 text-center">Birim Fiyat</span>
          <span class="col-span-2 text-center">İndirim %</span>
          <span class="col-span-1 text-right">Toplam</span>
          <span class="col-span-1"></span>
        </div>

        {#each items as item, i}
          <div class="grid grid-cols-12 gap-2 items-center">
            <div class="col-span-4">
              <input
                value={item.product_name}
                oninput={(e) => updateItem(i, 'product_name', (e.target as HTMLInputElement).value)}
                placeholder="Ürün adı"
                aria-label="Kalem {i + 1} ürün adı"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div class="col-span-2">
              <input
                type="number" min="1"
                value={item.quantity}
                oninput={(e) => updateItem(i, 'quantity', Number((e.target as HTMLInputElement).value))}
                aria-label="Kalem {i + 1} miktar"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div class="col-span-2">
              <input
                type="number" min="0" step="0.01"
                value={item.unit_price}
                oninput={(e) => updateItem(i, 'unit_price', Number((e.target as HTMLInputElement).value))}
                aria-label="Kalem {i + 1} birim fiyat"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div class="col-span-2">
              <input
                type="number" min="0" max="100" step="0.1"
                value={item.discount}
                oninput={(e) => updateItem(i, 'discount', Number((e.target as HTMLInputElement).value))}
                aria-label="Kalem {i + 1} indirim yüzdesi"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div class="col-span-1 text-right text-sm font-medium text-slate-900 pr-1">
              {new Intl.NumberFormat('tr-TR').format(item.total)}
            </div>
            <div class="col-span-1 flex justify-center">
              <button
                type="button"
                onclick={() => removeItem(i)}
                disabled={items.length === 1}
                aria-label="Kalemi kaldır"
                class="text-slate-300 hover:text-red-500 transition-colors disabled:cursor-not-allowed"
              >✕</button>
            </div>
          </div>
        {/each}
      </div>

      <!-- Toplam -->
      <div class="flex justify-end mt-5 pt-4 border-t border-slate-100">
        <div class="text-right">
          <span class="text-sm text-slate-500 mr-4">Genel Toplam</span>
          <span class="text-2xl font-semibold text-slate-900">
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(grandTotal)}
          </span>
        </div>
      </div>
    </div>

    <!-- Notlar -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <label for="proposal-notes" class="block text-sm font-medium text-slate-700 mb-2">Notlar</label>
      <textarea
        id="proposal-notes"
        bind:value={form.notes}
        rows="3"
        placeholder="Teklif notları..."
        class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      ></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <a href="/sales/proposals"
        class="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
        İptal
      </a>
      <button type="submit" disabled={loading}
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {loading ? 'Kaydediliyor...' : 'Teklifi Kaydet'}
      </button>
    </div>
  </form>
</div>