<script lang="ts">
  import { salesService } from '$lib/modules/sales/service'
  import { liveQuery } from 'dexie'

  let stats = $state({ revenue: 0, totalOrders: 0, delivered: 0, pending: 0 })

  $effect(() => {
    const sub = liveQuery(() => salesService.getOrderStats()).subscribe({
      next: (data) => { stats = data },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)
  }
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="text-2xl font-semibold text-slate-900">Finans</h1>
    <p class="text-sm text-slate-500 mt-1">Gelir ve sipariş özeti</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <p class="text-sm text-slate-500 mb-1">Toplam Gelir</p>
      <p class="text-3xl font-semibold text-green-600">{formatCurrency(stats.revenue)}</p>
      <p class="text-xs text-slate-400 mt-1">Teslim edilen siparişler</p>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <p class="text-sm text-slate-500 mb-1">Toplam Sipariş</p>
      <p class="text-3xl font-semibold text-slate-900">{stats.totalOrders}</p>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <p class="text-sm text-slate-500 mb-1">Bekleyen</p>
      <p class="text-3xl font-semibold text-amber-600">{stats.pending}</p>
      <p class="text-xs text-slate-400 mt-1">Onaylanan siparişler</p>
    </div>
  </div>

  <div class="mt-6 bg-white rounded-xl border border-slate-200 p-6">
    <p class="text-slate-400 text-sm text-center py-8">Detaylı finans modülü yakında eklenecek</p>
  </div>
</div>