import { browser } from '$app/environment'

let _online = $state(browser ? navigator.onLine : true)
let _syncing = $state(false)
let _lastSync = $state<Date | null>(null)

if (browser) {
  window.addEventListener('online', () => { _online = true })
  window.addEventListener('offline', () => { _online = false })
}

export const networkStore = {
  get online()   { return _online },
  get syncing()  { return _syncing },
  get lastSync() { return _lastSync },
  setSyncing(v: boolean) { _syncing = v },
  setLastSync(d: Date)   { _lastSync = d }
}