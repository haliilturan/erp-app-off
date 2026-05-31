<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
  // Gerçek projede InstantDB'den gelecek, şimdilik mock
  const stats = [
    { label: 'Toplam Sipariş',  value: '1,284',  change: '+12.5%', up: true  },
    { label: 'Aktif Müşteri',   value: '342',    change: '+4.2%',  up: true  },
    { label: 'Stok Uyarısı',    value: '18',     change: '-3',     up: false },
    { label: 'Aylık Ciro',      value: '$94.2K', change: '+8.1%',  up: true  },
  ]

  type Status = 'online' | 'busy' | 'offline'

  const members = [
    { id: 1, name: 'Sam Frank',         email: 'sam.frank@hll.int',   role: 'UX Designer',       status: 'online'  as Status, lastActive: '2 mins ago', color: '#3b82f6' },
    { id: 2, name: 'William Tennessee', email: 'william.t@hll.int',   role: 'Senior Designer',   status: 'busy'    as Status, lastActive: '1 hr ago',   color: '#d29922' },
    { id: 3, name: 'Emily Smith',       email: 'emily.smith@hll.int', role: 'Creative Director', status: 'offline' as Status, lastActive: '1 day ago',  color: '#8b5cf6' },
    { id: 4, name: 'Dan Johnson',       email: 'dan.johnson@hll.int', role: 'Graphic Designer',  status: 'online'  as Status, lastActive: 'Just now',   color: '#3fb950' },
    { id: 5, name: 'Sarah Davis',       email: 'sarah.davis@hll.int', role: 'UX/UI Designer',    status: 'online'  as Status, lastActive: '5 mins ago', color: '#f97316' },
  ]

  function initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  let search = $state('')
  let page   = $state(1)

  const filtered = $derived(
    members.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
    )
  )

  const statusLabel: Record<Status, string> = {
    online: 'Online', busy: 'Busy', offline: 'Offline'
  }
</script>

<div class="erp-page">
  <!-- Stats -->
  <div class="erp-stats-grid">
    {#each stats as s}
      <div class="erp-stat-card">
        <span class="erp-stat-label">{s.label}</span>
        <span class="erp-stat-value">{s.value}</span>
        <span class="erp-stat-change" class:down={!s.up}>{s.change}</span>
      </div>
    {/each}
  </div>

  <!-- Team Members -->
  <div class="erp-card">
    <div class="erp-card-header">
      <span class="erp-card-title">Team Members</span>
      <div style="display:flex;align-items:center;gap:8px;">
        <!-- Search -->
        <div class="erp-search-wrap">
          <span class="erp-search-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input class="erp-input" style="width:190px;" placeholder="Search members..." bind:value={search} />
        </div>
        <!-- Add -->
        <button class="erp-btn erp-btn-primary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Member
        </button>
      </div>
    </div>

    <table class="erp-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Status</th>
          <th>Last Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as m (m.id)}
          <tr>
            <td>
              <div class="erp-user-cell">
                <div class="erp-user-avatar" style="background:{m.color}">
                  {initials(m.name)}
                </div>
                <div>
                  <div class="erp-user-name">{m.name}</div>
                  <div class="erp-user-email">{m.email}</div>
                </div>
              </div>
            </td>
            <td style="color:var(--text-primary)">{m.role}</td>
            <td>
              <span class="erp-badge erp-badge-{m.status}">
                <span class="erp-dot erp-dot-{m.status}"></span>
                {statusLabel[m.status]}
              </span>
            </td>
            <td>{m.lastActive}</td>
            <td>
              <div style="display:flex;align-items:center;gap:4px;">
                <button class="erp-btn-icon" title="Düzenle">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="erp-btn-icon" title="Sil" style="color:var(--status-danger)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">
              Üye bulunamadı
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="erp-pagination">
      <span class="erp-pagination-info">Showing 1 to 5 of 24 members</span>
      <button class="erp-page-btn" disabled={page === 1} onclick={() => page--}>Prev</button>
      {#each [1, 2, 3] as p}
        <button class="erp-page-btn" class:active={page === p} onclick={() => page = p}>{p}</button>
      {/each}
      <button class="erp-page-btn" disabled>…</button>
      <button class="erp-page-btn" onclick={() => page = 5}>5</button>
      <button class="erp-page-btn" onclick={() => page++}>Next</button>
    </div>
  </div>
</div>