<script lang="ts">
  import { liveQuery } from 'dexie'
  import { localDb } from '$lib/db/local'
  import {
    proposalService,
    statusLabels,
    statusColors,
    pipeline,
    type ProposalStatus
  } from '$lib/modules/sales/proposalService'
  import { goto } from '$app/navigation'

  let search     = $state('')
  let filterStatus = $state<ProposalStatus | ''>('')
  let view       = $state<'list' | 'pipeline'>('pipeline')

  let proposals: any[] = $state([])
  let pipelineStats = $state<Record<string, { count: number; total: number }>>({})

  $effect(() => {
    const sub = liveQuery(() =>
      proposalService.getProposals({
        search,
        status: filterStatus || undefined
      })
    ).subscribe({
      next: (data) => { proposals = data ?? [] },
      error: (err)  => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  $effect(() => {
    proposalService.getPipelineStats().then(s => { pipelineStats = s })
  })

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  async function handleStatusChange(id: string, status: ProposalStatus) {
    await proposalService.updateStatus(id, status)
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu teklifi silmek istediğinize emin misiniz?')) return
    await proposalService.deleteProposal(id)
  }

  async function handleConvert(id: string) {
    if (!confirm('Bu teklifi siparişe çevirmek istediğinize emin misiniz?')) return
    try {
      const order = await proposalService.convertToOrder(id)
      goto(`/sales/${order.id}`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  function proposalsByStatus(status: ProposalStatus) {
    return proposals.filter(p => p.status === status)
  }
</script>

<div class="flex flex-col h-full">

  <!-- Başlık -->
  <header class="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200">
    <div class="flex items-center gap-3">
      <h1 class="text-2xl font-semibold text-slate-900">Teklifler</h1>
      <span class="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full">
        {proposals.length} teklif
      </span>
    </div>
    <div class="flex items-center gap-2">
      <!-- Görünüm seçici -->
      <div class="flex items-center bg-slate-100 rounded-lg p-1">
        <button
          type="button"
          onclick={() => view = 'pipeline'}
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            {view === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
        >
          Pipeline
        </button>
        <button
          type="button"
          onclick={() => view = 'list'}
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            {view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
        >
          Liste
        </button>
      </div>
      
       <a href="/sales/proposals/new"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        + Yeni Teklif
      </a>
    </div>
  </header>

  <!-- Arama -->
  <div class="px-8 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
    <div class="flex items-center bg-white border border-slate-200 rounded-lg px-3 flex-1 max-w-sm">
      <svg class="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
      </svg>
      <input
        type="text"
        bind:value={search}
        placeholder="Teklif no, müşteri..."
        aria-label="Teklif ara"
        class="py-2 outline-none bg-transparent text-sm w-full text-slate-700 placeholder-slate-400"
      />
    </div>
    {#if view === 'list'}
      <select
        bind:value={filterStatus}
        aria-label="Durum filtrele"
        class="border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Tüm durumlar</option>
        {#each pipeline as s}
          <option value={s}>{statusLabels[s]}</option>
        {/each}
      </select>
    {/if}
  </div>

  <!-- İçerik -->
  <div class="flex-1 overflow-auto">

    <!-- ── Pipeline görünümü ── -->
    {#if view === 'pipeline'}
      <div class="flex gap-4 p-6 h-full overflow-x-auto">
        {#each pipeline as status}
          {@const colProposals = proposalsByStatus(status)}
          {@const colStats = pipelineStats[status]}

          <div class="flex-shrink-0 w-72 flex flex-col">
            <!-- Kolon başlığı -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-slate-900">{statusLabels[status]}</span>
                <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {colStats?.count ?? 0}
                </span>
              </div>
              {#if colStats?.total}
                <span class="text-xs text-slate-500">
                  {formatCurrency(colStats.total)}
                </span>
              {/if}
            </div>

            <!-- Kartlar -->
            <div class="flex-1 space-y-2 overflow-y-auto">
              {#each colProposals as p (p.id)}
                <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <!-- Numara + tarih -->
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-xs text-slate-500">
                      {p.proposal_no ?? p.id.slice(0, 8)}
                    </span>
                    <span class="text-xs text-slate-400">{formatDate(p.created_at)}</span>
                  </div>

                  <!-- Müşteri -->
                  <p class="font-medium text-slate-900 text-sm mb-1 truncate">
                    {p.customer_name ?? 'Müşteri belirtilmedi'}
                  </p>

                  <!-- Tutar -->
                  <p class="text-lg font-semibold text-slate-900 mb-3">
                    {formatCurrency(p.total)}
                  </p>

                  <!-- Durum badge -->
                  <span class="inline-block text-xs px-2 py-0.5 rounded-full border font-medium mb-3 {statusColors[status as ProposalStatus]}">
                    {statusLabels[status as ProposalStatus]}
                  </span>

                  <!-- Aksiyonlar -->
                  <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                    <a
                      href="/sales/proposals/{p.id}"
                      class="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Detay →
                    </a>
                    <div class="flex items-center gap-1">
                      {#if status !== 'order' && status !== 'rejected'}
                        <!-- Sonraki adıma taşı -->
                        {@const nextIdx = pipeline.indexOf(status as ProposalStatus) + 1}
                        {#if nextIdx < pipeline.length}
                          <button
                            type="button"
                            onclick={() => handleStatusChange(p.id, pipeline[nextIdx])}
                            title="Sonraki aşamaya taşı: {statusLabels[pipeline[nextIdx]]}"
                            class="text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 px-2 py-1 rounded-lg hover:border-indigo-300 transition-colors"
                          >
                            → {statusLabels[pipeline[nextIdx]]}
                          </button>
                        {/if}
                      {/if}
                      {#if status === 'negotiation'}
                        <button
                          type="button"
                          onclick={() => handleConvert(p.id)}
                          class="text-xs text-green-600 hover:text-green-700 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors font-medium"
                        >
                          Siparişe Çevir
                        </button>
                      {/if}
                    </div>
                  </div>
                </div>
              {:else}
                <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <p class="text-sm text-slate-400">Teklif yok</p>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>

    <!-- ── Liste görünümü ── -->
    {:else}
      <div class="px-8 py-4">
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Teklif No</th>
                <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Müşteri</th>
                <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Durum</th>
                <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Geçerlilik</th>
                <th scope="col" class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Tutar</th>
                <th scope="col" class="px-4 py-3"><span class="sr-only">İşlemler</span></th>
              </tr>
            </thead>
            <tbody>
              {#each proposals as p (p.id)}
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3 font-mono text-xs text-slate-500">
                    {p.proposal_no ?? p.id.slice(0, 8)}
                  </td>
                  <td class="px-4 py-3 font-medium text-slate-900">
                    {p.customer_name ?? '-'}
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full border font-medium {statusColors[p.status as ProposalStatus] ?? ''}">
                      {statusLabels[p.status as ProposalStatus] ?? p.status}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-500 text-xs">
                    {p.valid_until ? formatDate(p.valid_until) : '-'}
                  </td>
                  <td class="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(p.total)}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-2">
                      <a href="/sales/proposals/{p.id}"
                        class="text-slate-400 hover:text-indigo-600 transition-colors text-xs border border-slate-200 px-2 py-1 rounded-lg hover:border-indigo-300">
                        Detay
                      </a>
                      {#if p.status === 'negotiation'}
                        <button
                          type="button"
                          onclick={() => handleConvert(p.id)}
                          class="text-xs text-green-600 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">
                          Siparişe Çevir
                        </button>
                      {/if}
                      <button
                        type="button"
                        onclick={() => handleDelete(p.id)}
                        aria-label="Teklifi sil"
                        class="text-slate-400 hover:text-red-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              {:else}
                <tr>
                  <td colspan="6" class="px-4 py-16 text-center">
                    <p class="text-slate-400 mb-2">Teklif bulunamadı</p>
                    <a href="/sales/proposals/new" class="text-indigo-600 text-sm hover:underline">
                      + Yeni teklif oluştur
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

  </div>
</div>