import { db } from '$lib/db/instant'

// Svelte 5 runes ile auth state
let _user = $state<any>(null)
let _loading = $state(true)
let _error = $state<string | null>(null)

// InstantDB auth durumunu dinle
db.subscribeAuth((auth) => {
  _loading = false
  if (auth.error) {
    _error = auth.error.message
    _user = null
    return
  }
  _user = auth.user ?? null
  _error = null
})

export const authStore = {
  get user()    { return _user },
  get loading() { return _loading },
  get error()   { return _error },
  get isLoggedIn() { return !!_user },

  async signIn(email: string, password: string) {
    _error = null
    try {
      await db.auth.signInWithEmail({ email, password })
    } catch (err: any) {
      _error = err.message ?? 'Giriş başarısız'
      throw err
    }
  },

  async signUp(email: string, password: string, fullName: string) {
    _error = null
    try {
      await db.auth.signUpWithMagicLink({ email })
    } catch (err: any) {
      _error = err.message ?? 'Kayıt başarısız'
      throw err
    }
  },

  async sendMagicLink(email: string) {
    await db.auth.sendMagicCode({ email })
  },

  async verifyCode(email: string, code: string) {
    await db.auth.signInWithMagicCode({ email, code })
  },

  async signOut() {
    await db.auth.signOut()
    _user = null
  }
}