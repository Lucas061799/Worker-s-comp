import { useEffect } from 'react'
import NorbieLoader from '../../components/NorbieLoader'

/* The two waits in the flow, as CBIC draws them: the screen is taken over
   while the call is out, one answer in flight at a time. All a plan carries
   now is how long that is — the overlay says nothing, so there is no copy,
   no step list and no bar to describe.

   Rating fans out across the markets; finalizing is the single call that
   turns an indication into a bindable number, so it is shorter. */
export const RATING = { ms: 4300 }
export const FINALIZING = { ms: 2700 }

export default function Loading({ plan = RATING, onDone, isDark = false }) {
  const { ms } = plan

  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), ms)
    return () => clearTimeout(t)
  }, [ms, onDone])

  return (
    /* Absolute inside <main>, which is the positioned ancestor, so the
       wait covers the work and leaves the rail alone — the agent can still
       see where they are while the call is out. Nothing is scrollable
       behind it on either of these two screens. */
    <div
      className="absolute inset-0 z-[70] flex flex-col items-center justify-center"
      style={{
        background: isDark ? 'rgba(19,22,41,0.82)' : 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(3px)',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="w-[130px] h-[130px]">
        <NorbieLoader dark={isDark} />
      </div>
    </div>
  )
}
