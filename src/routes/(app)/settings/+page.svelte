<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte'
  import { goto } from '$app/navigation'
</script>

<div class="p-6 max-w-2xl">
  <div class="mb-6">
    <h1 class="text-2xl font-semibold text-slate-900">Ayarlar</h1>
  </div>

  <div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">

    <div class="p-5">
      <h2 class="text-sm font-medium text-slate-700 mb-3">Hesap Bilgileri</h2>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
          {authStore.user?.email?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p class="font-medium text-slate-900">{authStore.user?.email ?? ''}</p>
          <p class="text-sm text-slate-400">InstantDB ile giriş yapıldı</p>
        </div>
      </div>
    </div>

    <div class="p-5">
      <h2 class="text-sm font-medium text-slate-700 mb-3">Uygulama</h2>
      <div class="space-y-2 text-sm text-slate-600">
        <div class="flex justify-between">
          <span>Versiyon</span>
          <span class="text-slate-400">1.0.0</span>
        </div>
        <div class="flex justify-between">
          <span>Veritabanı</span>
          <span class="text-slate-400">InstantDB</span>
        </div>
        <div class="flex justify-between">
          <span>Offline desteği</span>
          <span class="text-green-600">Aktif</span>
        </div>
      </div>
    </div>

    <div class="p-5">
      <button
        onclick={() => { authStore.signOut(); goto('/login') }}
        class="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
      >
        Çıkış Yap
      </button>
    </div>

  </div>
</div>