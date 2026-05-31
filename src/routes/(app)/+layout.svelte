<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { authStore } from '$lib/stores/auth.svelte'
  import { networkStore } from '$lib/stores/network.svelte'
  import { startSync } from '$lib/sync/instantSync'
  import { workspaceStore } from '$lib/stores/workspace.svelte'

  $effect(() => {
    if (!authStore.loading && !authStore.isLoggedIn) {
      goto('/login')
    }
  })

  $effect(() => {
    if (!authStore.isLoggedIn) return
    const wsId = workspaceStore.activeWorkspaceId ?? authStore.user?.id ?? ''
    const stop = startSync(wsId, authStore.user?.id ?? '')
    return stop
  })

  let { children } = $props()

  let isCollapsed  = $state(false)
  let isMobileOpen = $state(false)
  let isMobile     = $state(false)
  let openMenus    = $state<string[]>([])
  let showUserMenu = $state(false)

  function checkMobile() {
    isMobile = window.innerWidth <= 768
    if (!isMobile) isMobileOpen = false
  }

  $effect(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  })

  $effect(() => {
    function handleOutside(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest('.user-dropdown')
      if (!el) showUserMenu = false
    }
    document.addEventListener('click', handleOutside)
    return () => document.removeEventListener('click', handleOutside)
  })

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Ana Sayfa',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      href: '/dashboard'
    },
    {
      key: 'personel',
      label: 'Personel',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      children: [
        { key: 'personel-list', label: 'Personel Listele', href: '/personel' },
      ]
    },
    {
      key: 'stok',
      label: 'Stok',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      children: [
        { key: 'stok-list',        label: 'Stok Kart Listele', href: '/inventory' },
        { key: 'stok-hareketleri', label: 'Stok Hareketleri',  href: '/inventory/hareketler' },
        {
          key: 'stok-rapor', label: 'Stok Raporları',
          children: [
            { key: 'stok-status',           label: 'Genel Stok Durumu', href: '/inventory/stok-durumu' },
            { key: 'warehouse-stok-status', label: 'Depo Stok Durumu',  href: '/inventory/depo-stok-durumu' },
          ]
        },
        {
          key: 'stok-fis', label: 'Stok Fiş İşlemleri',
          children: [
            { key: 'stok-fis-giris', label: 'Giriş Listele', href: '/inventory/fis/giris' },
            { key: 'stok-fis-cikis', label: 'Çıkış Listele', href: '/inventory/fis/cikis' },
          ]
        },
      ]
    },
    {
      key: 'musteri-tedarikci',
      label: 'Müşteriler/Tedarikçiler',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      children: [
        { key: 'musteriler', label: 'Müşteri Listele', href: '/sales/customers' },
      ]
    },
    {
      key: 'odeme-tahsilat',
      label: 'Ödemeler/Tahsilatlar',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      children: [
        { key: 'payment-listele',  label: 'Tüm Ödemeler', href: '/finance/payments' },
        { key: 'kasa-listele',     label: 'Nakit',        href: '/finance/kasa' },
        { key: 'banka-listele',    label: 'Banka',        href: '/finance/banka' },
        { key: 'cekler-listele',   label: 'Çekler',       href: '/finance/cekler' },
        { key: 'senetler-listele', label: 'Senetler',     href: '/finance/senetler' },
      ]
    },
    {
      key: 'fatura',
      label: 'Fatura',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      children: [
        {
          key: 'giden-fatura', label: 'Giden Fatura',
          children: [
            { key: 'giden-fatura-listele', label: 'Giden Fatura Listele', href: '/fatura/giden' },
            { key: 'giden-fatura-taslak',  label: 'Taslaklar',            href: '/fatura/giden/taslak' },
          ]
        },
        {
          key: 'gelen-fatura', label: 'Gelen Fatura',
          children: [
            { key: 'gelen-fatura-listele', label: 'Gelen Fatura Listele', href: '/fatura/gelen' },
          ]
        },
      ]
    },
    {
      key: 'siparis',
      label: 'Satış Yönetim',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      children: [
        {
          key: 'teklifler', label: 'Teklifler',
          children: [
            { key: 'teklifler-listele', label: 'Teklif Listele', href: '/sales/proposals' },
            { key: 'teklifler-ekle',    label: 'Yeni Teklif',    href: '/sales/proposals/new' },
          ]
        },
        {
          key: 'siparisler', label: 'Sipariş',
          children: [
            { key: 'siparisler-listele', label: 'Sipariş Listele', href: '/sales' },
            { key: 'siparisler-ekle',    label: 'Sipariş Ekle',    href: '/sales/new' },
          ]
        },
      ]
    },
    {
      key: 'magazalar',
      label: 'Mağazalar',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      children: [
        { key: 'magazalar-listele', label: 'Mağaza Listele', href: '/magazalar' },
      ]
    },
    {
      key: 'depo',
      label: 'Depo',
      icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
      children: [
        { key: 'depo-listele', label: 'Depo Listele', href: '/depolar' },
      ]
    },
    {
      key: 'mesajlar',
      label: 'Mesajlar',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      children: [
        { key: 'email',         label: 'E-posta',     href: '/mesajlar/email' },
        { key: 'mesajlar-chat', label: 'Mesajlar',    href: '/mesajlar/chat' },
        { key: 'bildirimler',   label: 'Bildirimler', href: '/mesajlar/bildirimler' },
      ]
    },
    {
      key: 'yardim',
      label: 'Yardım & Destek',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      href: '/yardim'
    },
    {
      key: 'ayarlar',
      label: 'Sistem Ayarları',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      href: '/settings'
    },
  ]

  function isActive(item: any): boolean {
    if (item.href && $page.url.pathname.startsWith(item.href) && item.href !== '/') return true
    if (item.href === '/dashboard' && $page.url.pathname === '/dashboard') return true
    if (item.children) return item.children.some((c: any) => isActive(c))
    return false
  }

  function toggleMenu(key: string) {
    if (openMenus.includes(key)) {
      openMenus = openMenus.filter(k => k !== key)
    } else {
      openMenus = [...openMenus, key]
    }
  }

  function isMenuOpen(key: string) {
    return openMenus.includes(key)
  }

  function handleNavClick(item: any) {
    if (item.href) {
      goto(item.href)
      if (isMobile) isMobileOpen = false
    } else if (item.children) {
      toggleMenu(item.key)
    }
  }

  const userInitials = $derived(
    (authStore.user?.email?.[0] ?? 'K').toUpperCase()
  )
</script>

<!-- Mobile overlay -->
{#if isMobileOpen}
  <button
    type="button"
    aria-label="Menüyü kapat"
    onclick={() => isMobileOpen = false}
    class="fixed inset-0 bg-black/50 z-[999] lg:hidden w-full border-0 cursor-default"
  ></button>
{/if}

<div class="flex h-screen overflow-hidden bg-[#f8fafc]">

  <!-- ══ SIDEBAR ══ -->
  <aside
    class="sidebar fixed left-0 top-0 h-full z-[1000] flex flex-col transition-all duration-300"
    style="width:{isMobile ? (isMobileOpen ? '260px' : '0px') : (isCollapsed ? '80px' : '260px')};"
  >

    <!-- Logo -->
    <div class="logo-area flex items-center justify-between p-5 border-b border-[#1e293b] flex-shrink-0">
      <button
        type="button"
        aria-label="Ana sayfaya git"
        onclick={() => goto('/dashboard')}
        class="flex items-center gap-3 overflow-hidden bg-transparent border-0 cursor-pointer p-0"
      >
        <div class="logo-icon flex-shrink-0 flex items-center justify-center text-white font-bold" style="background:#3b82f6;">H</div>
        {#if !isCollapsed || isMobile}
          <span class="font-bold text-white text-lg whitespace-nowrap">HLL INT.</span>
        {/if}
      </button>

      {#if isMobile}
        <button
          type="button"
          aria-label="Menüyü kapat"
          onclick={() => isMobileOpen = false}
          class="text-[#94a3b8] hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
        >✕</button>
      {:else}
        <button
          type="button"
          aria-label={isCollapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          onclick={() => isCollapsed = !isCollapsed}
          class="text-[#94a3b8] hover:text-white transition-colors flex-shrink-0 ml-2 border border-[#1e293b] rounded p-1 bg-transparent cursor-pointer"
        >
          {isCollapsed ? '›' : '‹'}
        </button>
      {/if}
    </div>

    <!-- Nav -->
    <nav class="nav-menu flex-1 py-4 overflow-y-auto overflow-x-hidden" aria-label="Ana menü">
      {#each menuItems as item}
        {@const active = isActive(item)}
        <div>
          <button
            type="button"
            onclick={() => handleNavClick(item)}
            aria-expanded={item.children ? isMenuOpen(item.key) : undefined}
            aria-label={item.label}
            class="nav-item w-full {active ? 'active' : ''} {isCollapsed && !isMobile ? 'justify-center' : ''}"
          >
            <div class="flex items-center gap-3">
              <svg class="flex-shrink-0 w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={item.icon} />
              </svg>
              {#if !isCollapsed || isMobile}
                <span class="whitespace-nowrap overflow-hidden text-ellipsis font-medium">{item.label}</span>
              {/if}
            </div>
            {#if (!isCollapsed || isMobile) && item.children}
              <span aria-hidden="true" class="text-[10px] transition-transform duration-200" style="transform:{isMenuOpen(item.key) ? 'rotate(180deg)' : 'rotate(0deg)'}">▼</span>
            {/if}
          </button>

          {#if item.children && isMenuOpen(item.key) && (!isCollapsed || isMobile)}
            <div class="ml-4 mt-1 pl-3 mb-2 border-l-2 border-[#1e293b] flex flex-col gap-1">
              {#each item.children as child}
                {@const childActive = isActive(child)}
                <button
                  type="button"
                  onclick={() => handleNavClick(child)}
                  aria-expanded={child.children ? isMenuOpen(child.key) : undefined}
                  aria-label={child.label}
                  class="nav-sub-item w-full text-left {childActive ? 'active' : ''}"
                >
                  <span class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{child.label}</span>
                  {#if child.children}
                    <span aria-hidden="true" class="text-[9px] transition-transform duration-200" style="transform:{isMenuOpen(child.key) ? 'rotate(180deg)' : 'rotate(0deg)'}">▼</span>
                  {/if}
                </button>

                {#if child.children && isMenuOpen(child.key)}
                  <div class="ml-4 mt-1 pl-3 mb-1 border-l border-[#1e293b] flex flex-col gap-1">
                    {#each child.children as grandchild}
                      {@const gcActive = isActive(grandchild)}
                      <button
                        type="button"
                        onclick={() => handleNavClick(grandchild)}
                        aria-label={grandchild.label}
                        class="nav-sub-item text-xs w-full text-left {gcActive ? 'active' : ''}"
                      >
                        {grandchild.label}
                      </button>
                    {/each}
                  </div>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/each}
      <hr class="nav-divider" aria-hidden="true" />
    </nav>
  </aside>

  <!-- ══ MAIN ══ -->
  <div
    class="flex flex-col flex-1 min-h-screen transition-all duration-300"
    style="margin-left:{isMobile ? '0' : (isCollapsed ? '80px' : '260px')};"
  >

    <!-- Topbar -->
    <header
      class="fixed top-0 right-0 z-[999] flex items-center justify-between px-5 border-b"
      style="height:60px; background:#fff; border-color:#e2e8f0; left:{isMobile ? '0' : (isCollapsed ? '80px' : '260px')}; transition:left 0.3s ease;"
    >
      <!-- Sol -->
      <div class="flex items-center gap-3">
        {#if isMobile}
          <button
            type="button"
            aria-label="Menüyü aç"
            onclick={() => isMobileOpen = !isMobileOpen}
            class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 transition-all"
          >☰</button>
        {:else}
          <button
            type="button"
            aria-label="Ana sayfaya git"
            onclick={() => goto('/dashboard')}
            class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        {/if}
      </div>

      <!-- Orta — Workspace -->
      <div class="flex items-center gap-2 text-sm">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
          <span class="w-2 h-2 rounded-full bg-indigo-500" aria-hidden="true"></span>
          <span class="text-slate-700 font-medium text-xs">
            {workspaceStore.activeWorkspace?.name ?? 'Çalışma alanı seç'}
          </span>
          {#if workspaceStore.activeBrand}
            <span class="text-slate-400 text-xs" aria-hidden="true">›</span>
            <span class="text-slate-600 text-xs font-medium">{workspaceStore.activeBrand.name}</span>
          {/if}
          
           <a href="/settings/workspaces"
            aria-label="Çalışma alanı ayarlarına git"
            class="ml-1 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Sağ -->
      <div class="flex items-center gap-3">

        <!-- Sync durumu -->
        {#if !networkStore.online}
          <div class="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 font-medium" role="status">
            <span class="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true"></span> Çevrimdışı
          </div>
        {:else if networkStore.syncing}
          <div class="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 font-medium" role="status">
            <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse" aria-hidden="true"></span> Senkronize ediliyor...
          </div>
        {:else}
          <div class="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 font-medium" role="status">
            <span class="w-2 h-2 rounded-full bg-green-500" aria-hidden="true"></span> Senkronize
          </div>
        {/if}

        <!-- Kullanıcı dropdown -->
        <div class="user-dropdown relative">
          <button
            type="button"
            aria-label="Kullanıcı menüsü"
            aria-expanded={showUserMenu}
            onclick={(e) => { e.stopPropagation(); showUserMenu = !showUserMenu }}
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-sm"
          >
            <div class="w-8 h-8 rounded-full bg-[#cbd5e1] flex items-center justify-center text-slate-700 font-bold text-sm" aria-hidden="true">
              {userInitials}
            </div>
            {#if !isMobile}
              <div class="text-left">
                <div class="text-[13px] font-semibold text-slate-800 leading-tight">{authStore.user?.email?.split('@')[0] ?? 'Kullanıcı'}</div>
                <div class="text-[10px] text-slate-500 leading-tight">{authStore.user?.email ?? ''}</div>
              </div>
            {/if}
            <span aria-hidden="true" class="text-slate-400 text-xs" style="transform:{showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'}; transition:transform 0.2s; display:inline-block">▼</span>
          </button>

          {#if showUserMenu}
            <div  
            role="menu"
              aria-label="Kullanıcı seçenekleri"
              class="absolute right-0 top-12 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] overflow-hidden"
              onclick={(e) => e.stopPropagation()}
            >
              <div class="p-5 text-white" style="background:#0f172a">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg border border-white/20" aria-hidden="true">
                    {userInitials}
                  </div>
                  <div>
                    <div class="font-semibold">{authStore.user?.email?.split('@')[0] ?? 'Kullanıcı'}</div>
                    <div class="text-xs text-slate-400 mt-0.5">{authStore.user?.email ?? ''}</div>
                  </div>
                </div>
              </div>

              <div class="py-2" role="none">
                
                <a  href="/settings"
                  role="menuitem"
                  onclick={() => showUserMenu = false}
                  class="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#3b82f6] border-l-[3px] border-transparent hover:border-[#3b82f6] transition-all"
                >
                  <span aria-hidden="true">⚙️</span> Sistem Ayarları
                </a>
                
                <a href="/yardim"
                  role="menuitem"
                  onclick={() => showUserMenu = false}
                  class="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#3b82f6] border-l-[3px] border-transparent hover:border-[#3b82f6] transition-all"
                >
                  <span aria-hidden="true">❓</span> Yardım & Destek
                </a>
              </div>

              <hr class="border-slate-100" aria-hidden="true" />

              <div class="p-3" role="none">
                <button
                  type="button"
                  role="menuitem"
                  onclick={() => { authStore.signOut(); goto('/login'); showUserMenu = false }}
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all"
                >
                  <span aria-hidden="true">🚪</span> Güvenli Çıkış
                </button>
              </div>
            </div>
          {/if}
        </div>

      </div>
    </header>

    <!-- İçerik -->
    <main class="flex-1 overflow-auto" style="padding-top:60px;">
      {@render children()}
    </main>

  </div>
</div>

<style>
  .sidebar {
    background-color: #0f172a;
    color: #94a3b8;
    border-right: 1px solid #1e293b;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .nav-menu {
    padding: 0 12px;
    scrollbar-width: thin;
    scrollbar-color: #1e293b transparent;
  }

  .nav-menu::-webkit-scrollbar { width: 4px; }
  .nav-menu::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }

  .nav-item {
    padding: 12px 16px;
    color: #94a3b8;
    border-radius: 8px;
    margin-bottom: 4px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
  }

  .nav-item:hover { background-color: #1e293b; color: #fff; }
  .nav-item.active { background-color: #1e3a8a; color: #fff; font-weight: 500; }

  .nav-sub-item {
    padding: 8px 12px;
    color: #94a3b8;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .nav-sub-item:hover { background-color: #1e293b; color: #fff; }
  .nav-sub-item.active { color: #3b82f6; font-weight: 600; }

  .nav-divider { border: 0; height: 1px; background: #1e293b; margin: 16px 0; }
</style>