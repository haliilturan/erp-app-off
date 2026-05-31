<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { liveQuery } from 'dexie'
  import { localDb } from '$lib/db/local'
  import {
    proposalService,
    statusLabels,
    statusColors,
    pipeline,
    type ProposalStatus
  } from '$lib/modules/sales/proposalService'

  // TypeScript'e id'nin kesinlikle string olduğunu belirtiyoruz (string | undefined hatasını çözer)
  const id = $page.params.id as string

  let proposal: any   = $state(null)
  let items: any[]    = $state([])
  let loading         = $state(false)

  $effect(() => {
    const sub = liveQuery(async () => {
      const result = await proposalService.getProposal(id)
      return result
    }).subscribe({
      next: (data) => {
        proposal = data.proposal ?? null
        items    = data.items ?? []
      },
      error: (err) => console.error(err)
    })
    return () => sub.unsubscribe()
  })

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  async function handleStatusChange(status: ProposalStatus) {
    await proposalService.updateStatus(id, status)
  }

  async function handleConvert() {
    if (!confirm('Bu teklifi siparişe çevirmek istediğinize emin misiniz?')) return
    loading = true
    try {
      const order = await proposalService.convertToOrder(id)
      goto(`/sales/${order.id}`)
    } catch (err: any) {
      alert(err.message)
    } finally {
      loading = false
    }
  }

  async function handleDelete() {
    if (!confirm('Bu teklifi silmek istediğinize emin misiniz?')) return
    await proposalService.deleteProposal(id)
    goto('/sales/proposals')
  }

  const currentIdx = $derived(
    proposal ? pipeline.indexOf(proposal.status as ProposalStatus) : -1
  )
</script>

{#if !proposal}
  <div class="p-8 text-center text-slate-400">Yükleniyor...</div>
{:else}
<div class="p-6 max-w-4xl">

  <div class="flex items-start justify-between mb-6">
    <div class="flex items-center gap-3">
      <a href="/sales/proposals" class="text-slate-400 hover:text-slate-600">← Geri</a>
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">
          {proposal.proposal_no ?? proposal.id.slice(0, 8)}
        </h1>
        <p class="text-sm text-slate-500 mt-0.5">
          {proposal.customer_name ?? '-'} · {formatDate(proposal.created_at)}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      {#if proposal.status !== 'order' && proposal.status !== 'rejected'}
        <button
          type="button"
          onclick={handleConvert}
          disabled={loading}
          class="text-sm text-green-600 border border-green-200 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'İşleniyor...' : 'Siparişe Çevir'}
        </button>
      {/if}
      <button
        type="button"
        onclick={handleDelete}
        class="text-sm text-red-500 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
      >
        Sil
      </button>
    </div>
  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-5 mb-5">
    <h2 class="text-xs font-medium text-slate-500 uppercase mb-4">Pipeline durumu</h2>
    <div class="flex items-center gap-1 overflow-x-auto pb-1">
      {#each pipeline as status, idx}
        {@const isCurrent = proposal.status === status}
        {@const isPast    = currentIdx > idx}
        <button
          type="button"
          onclick={() => handleStatusChange(status)}
          class="flex-1 min-w-[80px] py-2 px-3 rounded-lg text-xs font-medium text-center transition-all border
            {isCurrent
              ? statusColors[status] + ' shadow-sm'
              : isPast
                ? 'bg-slate-50 text-slate-400 border-slate-100'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}"
        >
          {statusLabels[status]}
        </button>
        {#if idx < pipeline.length - 1}
          <span class="text-slate-300 flex-shrink-0">›</span>
        {/if}
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-3 gap-5 mb-5">
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <p class="text-xs text-slate-500 mb-1">Toplam Tutar</p>
      <p class="text-2xl font-semibold text-slate-900">{formatCurrency(proposal.total)}</p>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <p class="text-xs text-slate-500 mb-1">Geçerlilik Tarihi</p>
      <p class="text-lg font-medium text-slate-900">
        {proposal.valid_until ? formatDate(proposal.valid_until) : 'Belirtilmedi'}
      </p>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <p class="text-xs text-slate-500 mb-1">Mevcut Durum</p>
      <span class="inline-block text-sm px-3 py-1 rounded-full border font-medium {statusColors[proposal.status as ProposalStatus] ?? ''}">
        {statusLabels[proposal.status as ProposalStatus] ?? proposal.status}
      </span>
    </div>
  </div>

  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
    <div class="px-5 py-4 border-b border-slate-200">
      <h2 class="text-sm font-medium text-slate-700">Teklif kalemleri</h2>
    </div>
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-slate-50 border-b border-slate-200">
          <th scope="col" class="text-left px-4 py-3 text-xs font-medium text-slate-500">Ürün / Hizmet</th>
          <th scope="col" class="text-center px-4 py-3 text-xs font-medium text-slate-500">Miktar</th>
          <th scope="col" class="text-right px-4 py-3 text-xs font-medium text-slate-500">Birim Fiyat</th>
          <th scope="col" class="text-center px-4 py-3 text-xs font-medium text-slate-500">İndirim</th>
          <th scope="col" class="text-right px-4 py-3 text-xs font-medium text-slate-500">Toplam</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item (item.id)}
          <tr class="border-b border-slate-100">
            <td class="px-4 py-3 font-medium text-slate-900">{item.product_name}</td>
            <td class="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
            <td class="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
            <td class="px-4 py-3 text-center text-slate-500">
              {item.discount > 0 ? `%${item.discount}` : '-'}
            </td>
            <td class="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(item.total)}</td>
          </tr>
        {:else}
          <tr>
            <td colspan="5" class="px-4 py-8 text-center text-slate-400">Kalem bulunamadı</td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr class="border-t-2 border-slate-200 bg-slate-50">
          <td colspan="4" class="px-4 py-3 text-right text-sm font-medium text-slate-700">Genel Toplam</td>
          <td class="px-4 py-3 text-right text-lg font-semibold text-slate-900">
            {formatCurrency(proposal.total)}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  {#if proposal.notes}
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h2 class="text-sm font-medium text-slate-700 mb-2">Notlar</h2>
      <p class="text-sm text-slate-600 leading-relaxed">{proposal.notes}</p>
    </div>
  {/if}

</div>
{/if}