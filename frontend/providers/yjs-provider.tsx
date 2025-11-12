'use client'

import { ReactNode, useEffect } from 'react'
import { useYjs } from '@/hooks/use-yjs'
import { useHallStore } from '@/store/hall-store'
import { usePilgrimStore } from '@/store/pilgrim-store'
import { useParams } from 'next/navigation'

interface YjsProviderProps {
  children: ReactNode
  enabled?: boolean
}

export function YjsProvider({ children, enabled = true }: YjsProviderProps) {
  const { doc, connected, synced } = useYjs({
    room: 'mawa-collaboration',
    enabled,
  })

  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const isRTL = locale === 'ar'

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
      {/* Connection status indicator - positioned based on language direction */}
      <div 
        className="fixed top-4 z-50"
        style={{
          [isRTL ? 'left' : 'right']: '1rem',
        }}
      >
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
          {connected && synced ? (isRTL ? 'مزامنة مباشرة نشطة' : 'Real-time sync active') : (isRTL ? 'جاري الاتصال...' : 'Connecting...')}
        </div>
      </div>
      {children}
    </>
  )
}
