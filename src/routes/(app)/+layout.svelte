<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { authStore } from '$lib/stores/auth.svelte'
  import { networkStore } from '$lib/stores/network.svelte'
  import { startSync } from '$lib/sync/instantSync'

  $effect(() => {
    if (!authStore.loading && !authStore.isLoggedIn) {
      goto('/login')
    }
  })

  $effect(() => {
    if (!authStore.isLoggedIn) return
    const companyId = authStore.user?.id ?? ''
    const stop = startSync(companyId)
    return stop
  })

  const navItems = [
    { href: '/dashboard', label: 'Panel'   },
    { href: '/inventory', label: 'Stok'    },
    { href: '/sales',     label: 'Satış'   },
    { href: '/finance',   label: 'Finans'  },
    { href: '/settings',  label: 'Ayarlar' },
  ]

  function isActive(href: string) {
    return $page.url.pathname.startsWith(href)
  }

  function navClass(href: string) {
    const base = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors'
    const active = 'bg-indigo-50 text-indigo-700'
    const passive = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    return base + ' ' + (isActive(href) ? active : passive)
  }
</script>

<div class="flex h-screen bg-slate-50 overflow-hidden">

  <aside class="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">

    <div class="h-16 flex items-center px-6 border-b border-slate-200">
      <span class="font-semibold text-slate-900 text-lg">ERP</span>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {#each navItems as item}
        <a href={item.href} class={navClass(item.href)}>
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="px-4 py-3 border-t border-slate-200">
      {#if !networkStore.online}
        <div class="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          Çevrimdışı mod
        </div>
      {:else if networkStore.syncing}
        <div class="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
          <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Senkronize ediliyor...
        </div>
      {:else}
        <div class="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
          <span class="w-2 h-2 rounded-full bg-green-400"></span>
          Senkronize
        </div>
      {/if}
    </div>

    <div class="px-4 py-4 border-t border-slate-200">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
          {authStore.user?.email?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-900 truncate">{authStore.user?.email ?? ''}</p>
        </div>
        <button
          onclick={() => { authStore.signOut(); goto('/login') }}
          class="text-slate-400 hover:text-slate-600 transition-colors text-xs"
        >
          Çıkış
        </button>
      </div>
    </div>

  </aside>

  <main class="flex-1 overflow-auto">
    <slot />
  </main>

</div>