<script lang="ts">
  import { goto } from '$app/navigation'
  import { authStore } from '$lib/stores/auth.svelte'

  let step = $state<'email' | 'code'>('email')
  let email = $state('')
  let code = $state('')
  let loading = $state(false)
  let error = $state('')

  async function handleSendCode(e: Event) {
    e.preventDefault()
    if (!email.trim()) { error = 'E-posta zorunludur'; return }
    error = ''
    loading = true
    try {
      await authStore.sendMagicLink(email)
      step = 'code'
    } catch (err: any) {
      error = err.message ?? 'Hata oluştu'
    } finally {
      loading = false
    }
  }

  async function handleVerifyCode(e: Event) {
    e.preventDefault()
    if (!code.trim()) { error = 'Kod zorunludur'; return }
    error = ''
    loading = true
    try {
      await authStore.verifyCode(email, code)
      goto('/dashboard')
    } catch (err: any) {
      error = err.message ?? 'Kod hatalı'
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
  <div class="w-full max-w-md">

    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h1 class="text-2xl font-semibold text-slate-900">ERP Sistemi</h1>
      <p class="text-slate-500 mt-1 text-sm">
        {step === 'email' ? 'Giriş yapmak için e-postanızı girin' : 'E-postanıza gelen kodu girin'}
      </p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      {/if}

      {#if step === 'email'}
        <form onsubmit={handleSendCode} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">E-posta</label>
            <input
              type="email"
              bind:value={email}
              required
              placeholder="ornek@sirket.com"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            class="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium
              hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
          </button>
        </form>

      {:else}
        <form onsubmit={handleVerifyCode} class="space-y-4">
          <div class="bg-indigo-50 rounded-lg px-4 py-3 text-sm text-indigo-700 mb-2">
            <span class="font-medium">{email}</span> adresine kod gönderildi
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Doğrulama Kodu</label>
            <input
              type="text"
              bind:value={code}
              required
              placeholder="123456"
              maxlength="6"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-center
                tracking-widest text-lg font-mono focus:outline-none focus:ring-2
                focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            class="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium
              hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Doğrulanıyor...' : 'Giriş Yap'}
          </button>
          <button
            type="button"
            onclick={() => { step = 'email'; error = '' }}
            class="w-full text-slate-500 text-sm hover:text-slate-700 transition-colors"
          >
            Farklı e-posta kullan
          </button>
        </form>
      {/if}

    </div>
  </div>
</div>