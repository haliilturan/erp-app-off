<script lang="ts">
  import { inventoryService } from '$lib/modules/inventory/service'
  import { salesService } from '$lib/modules/sales/service'
  import { liveQuery } from 'dexie'

  // Canlı istatistikler
  let stats = $state({
    totalProducts: 0,
    lowStock: 0,
    totalOrders: 0,
    revenue: 0,
    totalCustomers: 0,
    pendingOrders: 0
  })

  $effect(() => {
    const sub = liveQuery(async () => {
      const [products, lowStock, customers, orderStats] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getLowStockProducts(),
        salesService.getCustomers(),
        salesService.getOrderStats()
      ])
      return {
        totalProducts: products.length,
        lowStock: lowStock.length,
        totalCustomers: customers.length,
        totalOrders: orderStats.total,
        revenue: orderStats.revenue,
        pendingOrders: orderStats.confirmed
      }
    }).subscribe({
      next: (data) => { stats = data },
      error: (err) => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  const cards = $derived([
    {
      label: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'indigo',
      href: '/inventory'
    },
    {
      label: 'Düşük Stok',
      value: stats.lowStock,
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      color: 'amber',
      href: '/inventory?filter=lowstock'
    },
    {
      label: 'Toplam Sipariş',
      value: stats.totalOrders,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'blue',
      href: '/sales'
    },
    {
      label: 'Toplam Müşteri',
      value: stats.totalCustomers,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'green',
      href: '/sales/customers'
    },
  ])

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber:  'bg-amber-50 text-amber-600',
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
  }
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="text-2xl font-semibold text-slate-900">Panel</h1>
    <p class="text-sm text-slate-500 mt-1">Genel bakış</p>
  </div>

  <!-- Stat kartları -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {#each cards as card}
      <a href={card.href}
        class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-slate-500">{card.label}</span>
          <div class="w-9 h-9 rounded-lg {colorMap[card.color]} flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={card.icon} />
            </svg>
          </div>
        </div>
        <p class="text-3xl font-semibold text-slate-900">{card.value}</p>
      </a>
    {/each}
  </div>

  <!-- Gelir kartı -->
  <div class="bg-white rounded-xl border border-slate-200 p-5 mb-4">
    <h2 class="text-sm font-medium text-slate-500 mb-1">Toplam Gelir</h2>
    <p class="text-3xl font-semibold text-slate-900">
      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.revenue)}
    </p>
    <p class="text-xs text-slate-400 mt-1">Teslim edilen siparişlerden</p>
  </div>
</div>