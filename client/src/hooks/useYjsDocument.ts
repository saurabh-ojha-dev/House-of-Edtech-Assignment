'use client'


import { useEffect, useState } from 'react'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export interface YjsState {
  /** The shared Yjs document — null until client-side init completes */
  ydoc: import('yjs').Doc | null
  /** WebSocket provider — null until client-side init completes */
  provider: import('y-websocket').WebsocketProvider | null
  /** Live WebSocket connection status */
  status: ConnectionStatus
  /** True once IndexedDB has loaded any locally-persisted state */
  synced: boolean
}

export function useYjsDocument(docName: string): YjsState {
  const [state, setState] = useState<YjsState>({
    ydoc: null,
    provider: null,
    status: 'connecting',
    synced: false,
  })

  useEffect(() => {
    let cancelled = false
    // Capture references for cleanup
    let _ydoc: import('yjs').Doc | null = null
    let _provider: import('y-websocket').WebsocketProvider | null = null
    let _idb: import('y-indexeddb').IndexeddbPersistence | null = null

    async function init() {
      // Dynamic imports — safe: this runs only in the browser
      const [Y, { WebsocketProvider }, { IndexeddbPersistence }] = await Promise.all([
        import('yjs'),
        import('y-websocket'),
        import('y-indexeddb'),
      ])

      if (cancelled) return

      const ydoc = new Y.Doc()
      _ydoc = ydoc

      const idb = new IndexeddbPersistence(docName, ydoc)
      _idb = idb
      idb.on('synced', () => {
        if (!cancelled) setState(prev => ({ ...prev, synced: true }))
      })

      const provider = new WebsocketProvider(
        'ws://localhost:1234',
        docName,
        ydoc,
        { connect: true }
      )
      _provider = provider

      provider.on('status', ({ status }: { status: string }) => {
        if (!cancelled) setState(prev => ({ ...prev, status: status as ConnectionStatus }))
      })

      if (!cancelled) {
        setState(prev => ({ ...prev, ydoc, provider }))
      }
    }

    init().catch(err => console.error('[useYjsDocument] init error:', err))

    return () => {
      cancelled = true
      _provider?.destroy()
      _idb?.destroy()
      _ydoc?.destroy()
    }
  }, [docName])

  return state
}
