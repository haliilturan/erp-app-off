<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { salesService } from '$lib/modules/sales/service'
  import { liveQuery } from 'dexie'
  import { authStore } from '$lib/stores/auth.svelte'

  let customers = $state<any[]>([])
  let loading   = $state(false)
  let error     = $state('')

  $effect(() => {
    const sub = liveQuery(() => salesService.getCustomers()).subscribe({
      next: (data) => { customers = data ?? [] },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  // URL'den müşteri bilgisini al
  let form = $state({
    customer_id:   $page.url.searchParams.get('customer_id') ?? '',
    customer_name: $page.url.searchParams.get('customer_name') ?? '',
    notes:         '',
    status:        'draft' as const,
    company_id:    authStore.user?.id ?? ''
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!form.name.trim()) { error = 'Müşteri adı zorunludur'; return }
    error   = ''
    loading = true
    try {
      await salesService.createCustomer(form)
      goto('/sales')
    } catch (err: any) {
      error = err.message ?? 'Hata oluştu'
    } finally {
      loading = false
    }
  }
</script>

<div class="p-6 max-w-2xl">
  <div class="flex items-center gap-3 mb-6">
    <a href="/sales/customers" class="text-slate-400 hover:text-slate-600">← Geri</a>
    <h1 class="text-2xl font-semibold text-slate-900">Yeni Müşteri</h1>
  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-6">
    <form onsubmit={handleSubmit} class="space-y-4">
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      {/if}

      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Müşteri Adı *</label>
          <input bind:value={form.name} type="text" required
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">E-posta</label>
          <input bind:value={form.email} type="email"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
          <input bind:value={form.phone} type="tel"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Vergi No</label>
          <input bind:value={form.tax_no} type="text"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Adres</label>
          <input bind:value={form.address} type="text"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Notlar</label>
          <textarea bind:value={form.notes} rows="3"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <a href="/sales/customers"
          class="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">
          İptal
        </a>
        <button type="submit" disabled={loading}
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  </div>
</div>