import { useCallback, useEffect, useState } from 'react'
import type { User } from '@freeappstore/sdk'
import { fas } from '../lib/fas'

export function useAuth() {
  const [user, setUser] = useState<User | null>(fas.auth.user)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
    return fas.auth.onChange(setUser)
  }, [])

  const signIn = useCallback(() => fas.auth.signIn(), [])
  const signInWithGoogle = useCallback(() => fas.auth.signIn('google'), [])
  const signOut = useCallback(() => fas.auth.signOut(), [])

  return { user, loading, signIn, signInWithGoogle, signOut }
}
