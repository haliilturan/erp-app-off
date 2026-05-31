<script lang="ts">
  import { liveQuery } from 'dexie'
  import { salesService } from '$lib/modules/sales/service'

  let search   = $state('')
  let industry = $state('')
  let country  = $state('')
  let pg       = $state(1)
  const perPage = 10

  let customers: any[] = $state([])
  let stats = $state({ total: 0, industries: [] as string[], countries: [] as string[] })

  $effect(() => {
    const sub = liveQuery(() =>
      salesService.getCustomers({ search, industry, country })
    ).subscribe({
      next: (data) => { customers = data ?? []; pg = 1 },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  $effect(() => {
    salesService.getCustomerStats().then(s => { stats = s })
  })

  const paginated  = $derived(customers.slice((pg - 1) * perPage, pg * perPage))
  const totalPages = $derived(Math.ceil(customers.length / perPage))

  function initials(name: string) {
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  }

  const avatarColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-amber-500', 'bg-rose-500',  'bg-teal-500'
  ]

  function avatarColor(name: string) {
    return avatarColors[name.charCodeAt(0) % avatarColors.length]
  }
</script>

<div class="flex flex-col h-full">

  <!-- Başlık -->
  <header class="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200">
    <div class="flex items-center gap-3">
      <h1 class="text-2xl font-semibold text-slate-900">Müşteriler</h1>
      <span class="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full">
        {customers.length} müşteri
      </span>
    </div>
    <a href="/sales/customers/new"
      class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
      + Yeni Müşteri
    </a>
  </header>

  <!-- Filtreler -->
  <div class="px-8 py-4 bg-slate-50 border-b border-slate-200">
    <div class="flex items-center gap-3 mb-3 flex-wrap">

      <div class="flex items-center bg-white border border-slate-200 rounded-lg px-3 flex-1 min-w-[200px] max-w-xs">
        <svg class="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input
          type="text"
          bind:value={search}
          placeholder="Müşteri, e-posta, telefon..."
          aria-label="Müşteri ara"
          class="py-2 outline-none bg-transparent text-sm w-full text-slate-700 placeholder-slate-400"
        />
      </div>

      <select
        bind:value={industry}
        aria-label="Sektör filtrele"
        class="border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Tüm Sektörler</option>
        {#each stats.industries as ind}
          <option value={ind}>{ind}</option>
        {/each}
      </select>

      <select
        bind:value={country}
        aria-label="Ülke filtrele"
        class="border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Tüm Ülkeler</option>
        {#each stats.countries as c}
          <option value={c}>{c}</option>
        {/each}
      </select>
    </div>

    <!-- Aktif filtreler -->
    {#if search || industry || country}
      <div class="flex items-center gap-2 flex-wrap">
        {#if search}
          <span class="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full">
            Arama: <strong class="text-slate-900 ml-1">{search}</strong>
            <button type="button" onclick={() => search = ''} aria-label="Arama filtresini kaldır" class="text-slate-400 hover:text-slate-600 ml-1">✕</button>
          </span>
        {/if}
        {#if industry}
          <span class="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full">
            Sektör: <strong class="text-slate-900 ml-1">{industry}</strong>
            <button type="button" onclick={() => industry = ''} aria-label="Sektör filtresini kaldır" class="text-slate-400 hover:text-slate-600 ml-1">✕</button>
          </span>
        {/if}
        {#if country}
          <span class="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full">
            Ülke: <strong class="text-slate-900 ml-1">{country}</strong>
            <button type="button" onclick={() => country = ''} aria-label="Ülke filtresini kaldır" class="text-slate-400 hover:text-slate-600 ml-1">✕</button>
          </span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Tablo -->
  <div class="flex-1 overflow-auto px-8 py-4">
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Müşteri</th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Telefon</th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Vergi No</th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Sektör</th>
            <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Ülke</th>
            <th scope="col" class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Sync</th>
            <th scope="col" class="px-4 py-3"><span class="sr-only">İşlemler</span></th>
          </tr>
        </thead>
        <tbody>
          {#each paginated as c (c.id)}
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full {avatarColor(c.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    aria-hidden="true"
                  >
                    {initials(c.name)}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{c.name}</p>
                    {#if c.email}
                      <p class="text-xs text-slate-500">{c.email}</p>
                    {/if}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600">{c.phone ?? '-'}</td>
              <td class="px-4 py-3 font-mono text-xs text-slate-500">{c.tax_no ?? '-'}</td>
              <td class="px-4 py-3">
                {#if c.industry}
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">{c.industry}</span>
                {:else}
                  <span class="text-slate-300">-</span>
                {/if}
              </td>
              <td class="px-4 py-3 text-slate-600">{c.country ?? '-'}</td>
              <td class="px-4 py-3 text-center">
                {#if c._synced === 1}
                  <span class="text-green-500 text-xs" title="Senkronize" aria-label="Senkronize">✓</span>
                {:else}
                  <span class="text-orange-400 text-xs" title="Bekliyor" aria-label="Senkronize bekliyor">⏳</span>
                {/if}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  
                   <a href="/sales/customers/{c.id}"
                    aria-label="{c.name} detayını görüntüle"
                    class="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  
                    <a href="/sales/new?customer_id={c.id}&customer_name={encodeURIComponent(c.name)}"
                    class="text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Sipariş
                  </a>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="px-4 py-16 text-center">
                <p class="text-slate-400 mb-2">Müşteri bulunamadı</p>
                <a href="/sales/customers/new" class="text-indigo-600 text-sm hover:underline">
                  + Yeni müşteri ekle
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Pagination -->
  {#if totalPages > 1}
    <footer class="flex items-center justify-between px-8 py-4 bg-white border-t border-slate-200">
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <span>Gösterilen:</span>
        <strong class="text-slate-900">{Math.min((pg - 1) * perPage + 1, customers.length)} - {Math.min(pg * perPage, customers.length)}</strong>
        <span>/ {customers.length}</span>
      </div>
      <nav aria-label="Sayfalama" class="flex items-center gap-1">
        <button
          type="button"
          onclick={() => pg = Math.max(1, pg - 1)}
          disabled={pg === 1}
          aria-label="Önceki sayfa"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >‹</button>

        {#each Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1) as p}
          <button
            type="button"
            onclick={() => pg = p}
            aria-label="Sayfa {p}"
            aria-current={pg === p ? 'page' : undefined}
            class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors
              {pg === p ? 'bg-slate-100 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-100'}"
          >
            {p}
          </button>
        {/each}

        {#if totalPages > 5}
          <span class="text-slate-400 px-1" aria-hidden="true">...</span>
          <button
            type="button"
            onclick={() => pg = totalPages}
            aria-label="Son sayfa {totalPages}"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {totalPages}
          </button>
        {/if}

        <button
          type="button"
          onclick={() => pg = Math.min(totalPages, pg + 1)}
          disabled={pg === totalPages}
          aria-label="Sonraki sayfa"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >›</button>
      </nav>
    </footer>
  {/if}

</div>