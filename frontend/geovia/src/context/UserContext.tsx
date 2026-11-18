import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  ensureBackendProfile,
  updateBackendProfile,
  type BackendProfile,
} from '../api/profile'

export type DemoUser = {
  username: string
  email: string
  avatar: string | null
  bio: string
  city: string
}

type UserContextValue = {
  user: DemoUser | null
  backendProfile: BackendProfile | null
  profileLoading: boolean
  profileError: string | null
  signInDemo: () => void
  signOut: () => void
  updateUser: (updates: Partial<DemoUser>) => Promise<void>
  refreshBackendProfile: () => Promise<void>
}

const USER_KEY = 'geovia.demoUser'
const UserContext = createContext<UserContextValue | null>(null)

function readUser(): DemoUser | null {
  try {
    const value = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as Partial<DemoUser> | null
    if (!value) return null
    return {
      username: value.username ?? 'GeoviaUser',
      email: value.email ?? 'uzytkownik@example.com',
      avatar: value.avatar ?? null,
      bio: value.bio ?? '',
      city: value.city ?? '',
    }
  } catch {
    return null
  }
}

function toDemoUser(profile: BackendProfile, current: DemoUser): DemoUser {
  return {
    ...current,
    username: profile.username,
    avatar: profile.avatarUrl,
    bio: profile.bio ?? '',
    city: profile.city ?? '',
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(readUser)
  const [backendProfile, setBackendProfile] = useState<BackendProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const refreshBackendProfile = useCallback(async () => {
    if (!user) {
      setBackendProfile(null)
      return
    }
    setProfileLoading(true)
    setProfileError(null)
    try {
      const profile = await ensureBackendProfile(user)
      setBackendProfile(profile)
      const synchronizedUser = toDemoUser(profile, user)
      setUser(synchronizedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(synchronizedUser))
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Nie udało się pobrać profilu.')
      throw error
    } finally {
      setProfileLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setBackendProfile(null)
      return
    }
    let active = true
    setProfileLoading(true)
    setProfileError(null)
    ensureBackendProfile(user)
      .then((profile) => {
        if (!active) return
        setBackendProfile(profile)
        const synchronizedUser = toDemoUser(profile, user)
        setUser(synchronizedUser)
        localStorage.setItem(USER_KEY, JSON.stringify(synchronizedUser))
      })
      .catch((error: unknown) => {
        if (active) setProfileError(error instanceof Error ? error.message : 'Nie udało się połączyć z backendem.')
      })
      .finally(() => {
        if (active) setProfileLoading(false)
      })
    return () => { active = false }
    // The profile bootstrap is keyed by the stable demo email. Updating profile
    // fields must not trigger another ensure request after every server response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  function updateUser(updates: Partial<DemoUser>): Promise<void> {
    if (!user) return Promise.resolve()
    const next = { ...user, ...updates }
    setUser(next)
    localStorage.setItem(USER_KEY, JSON.stringify(next))

    const hasProfileChanges = ['username', 'avatar', 'bio', 'city'].some((key) => key in updates)
    if (!hasProfileChanges) return Promise.resolve()

    return (async () => {
      setProfileError(null)
      try {
        const currentProfile = backendProfile ?? await ensureBackendProfile(user)
        const updatedProfile = await updateBackendProfile(currentProfile.id, next)
        setBackendProfile(updatedProfile)
        const synchronizedUser = toDemoUser(updatedProfile, next)
        setUser(synchronizedUser)
        localStorage.setItem(USER_KEY, JSON.stringify(synchronizedUser))
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : 'Nie udało się zapisać profilu.')
        throw error
      }
    })()
  }

  function signInDemo() {
    const demoUser = readUser() ?? {
      username: 'GeoviaUser',
      email: 'uzytkownik@example.com',
      avatar: null,
      bio: '',
      city: '',
    }
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser))
    setBackendProfile(null)
    setUser(demoUser)
  }

  function signOut() {
    localStorage.removeItem(USER_KEY)
    setUser(null)
    setBackendProfile(null)
    setProfileError(null)
  }

  return (
    <UserContext.Provider value={{ user, backendProfile, profileLoading, profileError, signInDemo, signOut, updateUser, refreshBackendProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}
