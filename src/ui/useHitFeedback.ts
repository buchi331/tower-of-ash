import { useEffect, useRef, useState } from 'react'

// Returns a shake flag and the most recent hp delta to display as a floating number.
export function useHitFeedback(hp: number) {
  const prev = useRef(hp)
  const [pop, setPop] = useState<{ delta: number; key: number } | null>(null)
  const [shake, setShake] = useState(false)
  const keyRef = useRef(0)

  useEffect(() => {
    const delta = hp - prev.current
    prev.current = hp
    if (delta < 0) {
      keyRef.current += 1
      setPop({ delta, key: keyRef.current })
      setShake(true)
      const t = setTimeout(() => setShake(false), 220)
      return () => clearTimeout(t)
    }
  }, [hp])

  return { pop, shake }
}
