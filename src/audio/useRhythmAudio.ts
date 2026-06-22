import { useCallback, useRef } from 'react'

type AudioApi = {
  ensureAudio: () => void
  playBeat: () => void
  playCue: () => void
  playHit: (kind: 'perfect' | 'good' | 'miss') => void
  playResult: (rank: string) => void
}

type BrowserAudioContext = typeof AudioContext

function getAudioContextCtor(): BrowserAudioContext | null {
  return window.AudioContext ?? null
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  durationMs: number,
  type: OscillatorType,
  gainValue = 0.08,
) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)

  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(now)
  oscillator.stop(now + durationMs / 1000 + 0.02)
}

export function useRhythmAudio(): AudioApi {
  const ctxRef = useRef<AudioContext | null>(null)

  const ensureAudio = useCallback(() => {
    if (ctxRef.current) {
      void ctxRef.current.resume()
      return
    }

    const Ctor = getAudioContextCtor()
    if (!Ctor) return

    try {
      ctxRef.current = new Ctor()
      void ctxRef.current.resume()
    } catch {
      ctxRef.current = null
    }
  }, [])

  const withAudio = useCallback((fn: (ctx: AudioContext) => void) => {
    const ctx = ctxRef.current
    if (!ctx) return
    try {
      fn(ctx)
    } catch {
      ctxRef.current = null
    }
  }, [])

  return {
    ensureAudio,
    playBeat: () => withAudio((ctx) => playTone(ctx, 220, 34, 'triangle', 0.035)),
    playCue: () => withAudio((ctx) => playTone(ctx, 440, 70, 'square', 0.045)),
    playHit: (kind) =>
      withAudio((ctx) => {
        if (kind === 'perfect') playTone(ctx, 880, 90, 'sine', 0.08)
        if (kind === 'good') playTone(ctx, 660, 75, 'triangle', 0.065)
        if (kind === 'miss') playTone(ctx, 110, 160, 'sawtooth', 0.045)
      }),
    playResult: (rank) =>
      withAudio((ctx) => {
        const base = rank === 'S' || rank === 'A' ? 523 : 196
        playTone(ctx, base, 120, 'sine', 0.07)
        window.setTimeout(() => withAudio((nextCtx) => playTone(nextCtx, base * 1.5, 140, 'sine', 0.07)), 130)
      }),
  }
}
