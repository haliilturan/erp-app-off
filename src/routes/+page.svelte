<script lang="ts">
  import { goto } from '$app/navigation'
  import { authStore } from '$lib/stores/auth.svelte'

  $effect(() => {
    if (!authStore.loading) {
      if (authStore.isLoggedIn) {
        goto('/dashboard')
      } else {
        goto('/login')
      }
    }
  })
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="text-slate-400">Yükleniyor...</div>
</div>