import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { adminApi, type AdminOrder } from '../api/admin.api.ts'
import { useAdminAuthStore } from '../../auth/admin-auth.store.ts'

/**
 * Plays a pleasant 2-tone melodic chime using Web Audio API (zero audio file dependencies).
 */
export function playNewOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const now = ctx.currentTime

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)
    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.05)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.4)

    // Tone 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.15)
    gain2.gain.setValueAtTime(0, now + 0.15)
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.2)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.7)
  } catch {
    // Ignore audio autoplay restrictions if user hasn't interacted with page yet
  }
}

export function useOrderNotification() {
  const navigate = useNavigate()
  const isSuperAdmin = useAdminAuthStore((state) => state.isSuperAdmin)
  const hasPermission = useAdminAuthStore((state) => state.hasPermission)

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('saudi_brand_sound_enabled') !== 'false'
    } catch {
      return true
    }
  })

  const prevOrderIdsRef = useRef<Set<string> | null>(null)

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem('saudi_brand_sound_enabled', String(next))
      } catch {
        // ignore
      }
      if (next) {
        playNewOrderChime()
        toast.info('تم تفعيل التنبيهات الصوتية للأوردرات الجديدة 🔔')
      } else {
        toast.info('تم كتم التنبيهات الصوتية 🔕')
      }
      return next
    })
  }

  useEffect(() => {
    if (!isSuperAdmin() && !hasPermission('manage_orders') && !hasPermission('view_overview')) {
      return
    }

    let isMounted = true

    const checkNewOrders = async () => {
      // Pause polling when browser tab is inactive/hidden to conserve network & server load
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return
      }

      try {
        const res = await adminApi.getOrders()
        const orders = res?.data || []

        if (!isMounted) return

        const currentIds = new Set(orders.map((o: AdminOrder) => o._id))

        // Initial load: record existing IDs without ringing
        if (prevOrderIdsRef.current === null) {
          prevOrderIdsRef.current = currentIds
          return
        }

        // Subsequent check: find new order IDs
        const newOrders = orders.filter((o: AdminOrder) => !prevOrderIdsRef.current!.has(o._id))

        if (newOrders.length > 0) {
          if (soundEnabled) {
            playNewOrderChime()
          }

          const latest = newOrders[0]
          const customer = latest.customerName || 'عميل جديد'
          const amount = latest.totalPrice ? `${latest.totalPrice} ج.م` : ''

          toast.success(`🔔 طلب جديد وارد الآن من ${customer} ${amount ? `بمبلغ ${amount}` : ''}!`, {
            duration: 9000,
            action: {
              label: 'عرض الطلب',
              onClick: () => navigate('/admin/orders'),
            },
          })
        }

        prevOrderIdsRef.current = currentIds
      } catch {
        // Silently ignore polling network errors
      }
    }

    // Check immediately on mount, then poll every 25 seconds
    checkNewOrders()
    const interval = setInterval(checkNewOrders, 25000)

    // Check immediately when admin tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkNewOrders()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isSuperAdmin, hasPermission, soundEnabled, navigate])

  return { soundEnabled, toggleSound }
}

