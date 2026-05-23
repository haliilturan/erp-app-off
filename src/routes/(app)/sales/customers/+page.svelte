<script lang="ts">
  import { liveQuery } from 'dexie'
  import { salesService } from '$lib/modules/sales/service'

  let search    = $state('')
  let customers = $state<any[]>([])

  $effect(() => {
    const sub = liveQuery(() => salesService.getCustomers(search)).subscribe({
      next: (data) => { customers = data ?? [] },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">Müşteriler</h1>
      <p class="text-sm text-slate-500 mt-1">{customers.length} müşteri</p>
    </div>
    <a href="/sales/customers/new"
      class="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
      + Yeni Müşteri
    </a>
  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-4 mb-5">
    <input type="text" bind:value={search} placeholder="Müşteri ara..."
      class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
  </div>

  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-slate-200 bg-slate-50">
          <th class="text-left px-4 py-3 font-medium text-slate-600">Ad</th>
          <th class="text-left px-4 py-3 font-medium text-slate-600">E-posta</th>
          <th class="text-left px-4 py-3 font-medium text-slate-600">Telefon</th>
          <th class="text-left px-4 py-3 font-medium text-slate-600">Vergi No</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {#each customers as c (c.id)}
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 font-medium text-slate-900">{c.name}</td>
            <td class="px-4 py-3 text-slate-500">{c.email ?? '-'}</td>
            <td class="px-4 py-3 text-slate-500">{c.phone ?? '-'}</td>
            <td class="px-4 py-3 text-slate-500">{c.tax_no ?? '-'}</td>
            <td class="px-4 py-3 text-right">
              <a href="/sales/new?customer_id={c.id}&customer_name={c.name}"
                class="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                Sipariş Oluştur
              </a>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="5" class="px-4 py-12 text-center text-slate-400">
              Müşteri bulunamadı —
              <a href="/sales/customers/new" class="text-indigo-600 hover:underline">yeni ekle</a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>