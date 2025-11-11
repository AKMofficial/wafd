'use client'

import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const WS_URL = process.env.NEXT_PUBLIC_YJS_WS_URL || 'ws://localhost:1234'

interface UseYjsOptions {
  room: string
  enabled?: boolean
}

export function useYjs({ room, enabled = true }: UseYjsOptions) {
  const [doc] = useState(() => new Y.Doc())
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const [synced, setSynced] = useState(false)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const wsProvider = new WebsocketProvider(WS_URL, room, doc, {
      connect: true,
      maxBackoffTime: 2500,
    })

    wsProvider.on('status', (event: { status: string }) => {
      const isConnected = event.status === 'connected'
      setConnected(isConnected)
    })

    wsProvider.on('sync', (isSynced: boolean) => {
      setSynced(isSynced)
    })

    setProvider(wsProvider)

    return () => {
      wsProvider.destroy()
    }
  }, [room, doc, enabled])

  return {
    doc,
    provider,
    synced,
    connected,
  }
}
