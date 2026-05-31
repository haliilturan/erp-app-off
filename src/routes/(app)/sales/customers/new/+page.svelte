<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { salesService } from '$lib/modules/sales/service'
  import { authStore } from '$lib/stores/auth.svelte'
  import { workspaceStore } from '$lib/stores/workspace.svelte'

  let form = $state({
    customer_name: $page.url.searchParams.get('customer_name') ?? '',
    email:         '',
    phone:         '',
    tax_no:        '',
    address:       '',
    industry:      '',
    country:       '',
    notes:         ''
  })

  let error   = $state('')
  let loading = $state(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!form.customer_name.trim()) { error = 'Müşteri adı zorunludur'; return }
    error   = ''
    loading = true
    try {
      await salesService.createCustomer({
        name:         form.customer_name,
        email:        form.email     || null,
        phone:        form.phone     || null,
        tax_no:       form.tax_no    || null,
        address:      form.address   || null,
        industry:     form.industry  || null,
        country:      form.country   || null,
        notes:        form.notes     || null,
        workspace_id: workspaceStore.activeWorkspaceId ?? authStore.user?.id ?? ''
      })
      goto('/sales/customers')
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
    <form onsubmit={handleSubmit} class="space-y-4" novalidate>
      {#if error}
        <div role="alert" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      {/if}

      <div class="grid grid-cols-2 gap-4">

        <div class="col-span-2">
          <label for="customer-name" class="block text-sm font-medium text-slate-700 mb-1.5">
            Müşteri Adı *
          </label>
          <input
            id="customer-name"
            bind:value={form.customer_name}
            type="text"
            required
            autocomplete="organization"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="customer-email" class="block text-sm font-medium text-slate-700 mb-1.5">E-posta</label>
          <input
            id="customer-email"
            bind:value={form.email}
            type="email"
            autocomplete="email"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="customer-phone" class="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
          <input
            id="customer-phone"
            bind:value={form.phone}
            type="tel"
            autocomplete="tel"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="customer-taxno" class="block text-sm font-medium text-slate-700 mb-1.5">Vergi No</label>
          <input
            id="customer-taxno"
            bind:value={form.tax_no}
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="customer-address" class="block text-sm font-medium text-slate-700 mb-1.5">Adres</label>
          <input
            id="customer-address"
            bind:value={form.address}
            type="text"
            autocomplete="street-address"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="customer-industry" class="block text-sm font-medium text-slate-700 mb-1.5">Sektör</label>
          <input
            id="customer-industry"
            bind:value={form.industry}
            type="text"
            placeholder="ör: Tekstil, İnşaat..."
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="customer-country" class="block text-sm font-medium text-slate-700 mb-1.5">Ülke</label>
          <input
            id="customer-country"
            bind:value={form.country}
            type="text"
            placeholder="ör: Türkiye"
            autocomplete="country-name"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="col-span-2">
          <label for="customer-notes" class="block text-sm font-medium text-slate-700 mb-1.5">Notlar</label>
          <textarea
            id="customer-notes"
            bind:value={form.notes}
            rows="3"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          ></textarea>
        </div>

      </div>

      <div class="flex justify-end gap-3 pt-2">
        
          <a href="/sales/customers"
          class="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          İptal
        </a>
        <button
          type="submit"
          disabled={loading}
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  </div>
</div>