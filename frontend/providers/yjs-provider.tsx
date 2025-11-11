'use client'

import { ReactNode, useEffect } from 'react'
import { useYjs } from '@/hooks/use-yjs'
import { useHallStore } from '@/store/hall-store'
import { usePilgrimStore } from '@/store/pilgrim-store'

interface YjsProviderProps {
  children: ReactNode
  enabled?: boolean
}

export function YjsProvider({ children, enabled = true }: YjsProviderProps) {
  const { doc, connected, synced } = useYjs({
    room: 'mawa-collaboration',
    enabled,
  })

  const initHallYjs = useHallStore((state) => state.initYjs)
  const initPilgrimYjs = usePilgrimStore((state) => state.initYjs)

  useEffect(() => {
    if (doc && synced) {
      try {
        initHallYjs(doc)
        initPilgrimYjs(doc)
      } catch (error) {
        console.error('[Yjs] Failed to initialize stores:', error)
      }
    }
  }, [doc, synced, initHallYjs, initPilgrimYjs])

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <>
      {/* Connection status indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all ${
            connected && synced
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              connected && synced ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`}
          />
          {connected && synced ? 'Real-time sync active' : 'Connecting...'}
        </div>
      </div>
      {children}
    </>
  )
}
