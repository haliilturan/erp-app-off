<script lang="ts">
  import { liveQuery } from 'dexie'
  import { salesService } from '$lib/modules/sales/service'

  let search  = $state('')
  let status  = $state('')
  let orders: any[] = $state([])

  $effect(() => {
    const sub = liveQuery(() =>
      salesService.getOrders({ search, status: status || undefined })
    ).subscribe({
      next: (data) => { orders = data ?? [] },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  const statusLabels: Record<string, string> = {
    draft:     'Taslak',
    confirmed: 'Onaylandı',
    shipped:   'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal'
  }

  const statusColors: Record<string, string> = {
    draft:     'bg-slate-100 text-slate-600',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped:   'bg-amber-100 text-amber-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('tr-TR')
  }
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">Satış & Siparişler</h1>
      <p class="text-sm text-slate-500 mt-1">{orders.length} sipariş</p>
    </div>
    <div class="flex items-center gap-2">
      <a href="/sales/customers"
        class="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
        Müşteriler
      </a>
      <a href="/sales/new"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
        + Yeni Sipariş
      </a>
    </div>
  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex flex-wrap gap-3">
    <input type="text" bind:value={search} placeholder="Sipariş veya müşteri ara..."
      class="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    <select bind:value={status}
      class="w-44 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
      <option value="">Tüm durumlar</option>
      <option value="draft">Taslak</option>
      <option value="confirmed">Onaylandı</option>
      <option value="shipped">Kargoda</option>
      <option value="delivered">Teslim Edildi</option>
      <option value="cancelled">İptal</option>
    </select>
  </div>

  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-slate-200 bg-slate-50">
          <th class="text-left px-4 py-3 font-medium text-slate-600">Sipariş No</th>
          <th class="text-left px-4 py-3 font-medium text-slate-600">Müşteri</th>
          <th class="text-left px-4 py-3 font-medium text-slate-600">Tarih</th>
          <th class="text-left px-4 py-3 font-medium text-slate-600">Durum</th>
          <th class="text-right px-4 py-3 font-medium text-slate-600">Tutar</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {#each orders as o (o.id)}
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 font-mono text-xs text-slate-500">{o.order_no ?? o.id.slice(0,8)}</td>
            <td class="px-4 py-3 font-medium text-slate-900">{o.customer_name ?? '-'}</td>
            <td class="px-4 py-3 text-slate-500">{formatDate(o.created_at)}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium {statusColors[o.status] ?? ''}">
                {statusLabels[o.status] ?? o.status}
              </span>
            </td>
            <td class="px-4 py-3 text-right font-medium">{formatCurrency(o.total)}</td>
            <td class="px-4 py-3 text-right">
              <a href="/sales/{o.id}" class="text-slate-400 hover:text-indigo-600 text-xs">Detay</a>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="6" class="px-4 py-12 text-center text-slate-400">
              Henüz sipariş yok —
              <a href="/sales/new" class="text-indigo-600 hover:underline">yeni ekle</a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>