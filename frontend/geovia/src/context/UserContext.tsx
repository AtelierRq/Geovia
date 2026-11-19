import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  changeAccountPassword, getCurrentAccount, loginAccount, logoutAccount,
  registerAccount, requestEmailChange, updateBackendProfile, type BackendProfile,
} from '../api/profile'

export type DemoUser = { username: string; email: string; avatar: string | null; bio: string; city: string }
type ProfileUpdates = Partial<Omit<DemoUser, 'email'>>
type UserContextValue = {
  user: DemoUser | null
  backendProfile: BackendProfile | null
  profileLoading: boolean
  profileError: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (updates: ProfileUpdates) => Promise<void>
  changeEmail: (email: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  refreshBackendProfile: () => Promise<void>
}
const UserContext = createContext<UserContextValue | null>(null)
function toUser(account: Awaited<ReturnType<typeof getCurrentAccount>>): DemoUser {
  return { username: account.profile.username, email: account.email, avatar: account.profile.avatarUrl, bio: account.profile.bio ?? '', city: account.profile.city ?? '' }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null)
  const [backendProfile, setBackendProfile] = useState<BackendProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const refreshBackendProfile = useCallback(async () => {
    try {
      const account = await getCurrentAccount()
      setUser(toUser(account)); setBackendProfile(account.profile); setProfileError(null)
    } catch (error) {
      setUser(null); setBackendProfile(null)
      if (error instanceof Error && !error.message.includes('(401)')) setProfileError(error.message)
      throw error
    }
  }, [])
  useEffect(() => {
    refreshBackendProfile().catch(() => undefined).finally(() => setProfileLoading(false))
  }, [refreshBackendProfile])
  async function login(email: string, password: string) {
    const account = await loginAccount(email, password)
    setUser(toUser(account)); setBackendProfile(account.profile); setProfileError(null)
  }
  async function register(email: string, password: string, username: string) {
    await registerAccount(email, password, username)
  }
  async function signOut() {
    await logoutAccount()
    setUser(null); setBackendProfile(null); setProfileError(null)
  }
  async function updateUser(updates: ProfileUpdates) {
    if (!user || !backendProfile) return
    const next = { ...user, ...updates }
    setProfileError(null)
    try {
      const profile = await updateBackendProfile(backendProfile.id, next)
      setBackendProfile(profile)
      setUser({ ...next, username: profile.username, avatar: profile.avatarUrl, bio: profile.bio ?? '', city: profile.city ?? '' })
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Nie udało się zapisać profilu.')
      throw error
    }
  }
  async function changeEmail(email: string) { await requestEmailChange(email) }
  async function changePassword(currentPassword: string, newPassword: string) { await changeAccountPassword(currentPassword, newPassword) }

  return <UserContext.Provider value={{ user, backendProfile, profileLoading, profileError, login, register, signOut, updateUser, changeEmail, changePassword, refreshBackendProfile }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}
