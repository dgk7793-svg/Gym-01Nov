import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

// Fetches GET /api{path}. Returns { data, error, loading, reload, setData }.
export default function useApi(path, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled })
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await api(path)
      if (id === requestId.current) setState({ data, error: null, loading: false })
    } catch (error) {
      if (id === requestId.current) setState({ data: null, error, loading: false })
    }
  }, [path])

  useEffect(() => {
    if (enabled) load()
    return () => {
      requestId.current++
    }
  }, [load, enabled])

  const setData = useCallback(
    (update) => setState((s) => ({ ...s, data: typeof update === 'function' ? update(s.data) : update })),
    []
  )

  return { ...state, reload: load, setData }
}
