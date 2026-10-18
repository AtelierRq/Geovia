import { createContext, useContext, useState, type ReactNode } from 'react'

export type DemoUser = {
  username: string
  email: string
  avatar: string | null
}

type UserContextValue = {
  user: DemoUser | null
  signInDemo: () => void
  signOut: () => void
  updateUser: (updates: Partial<DemoUser>) => void
}

const USER_KEY = 'geovia.demoUser'
const UserContext = createContext<UserContextValue | null>(null)

function readUser(): DemoUser | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as DemoUser | null
  } catch {
    return null
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(readUser)

  function updateUser(updates: Partial<DemoUser>) {
    setUser((current) => {
      if (!current) return current

      const next = { ...current, ...updates }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }

  function signInDemo() {
    const demoUser = readUser() ?? {
      username: 'GeoviaUser',
      email: 'uzytkownik@example.com',
      avatar: null,
    }

    localStorage.setItem(USER_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
  }

  function signOut() {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, signInDemo, signOut, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }

  return context
}
