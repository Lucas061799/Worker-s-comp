import { useState, useRef, useEffect } from 'react'

/* Quick Jump — same shape as con-gl / CBIC: one button that opens a
   list of places to skip to. Used on the landing page as a floating
   corner widget so a demo can jump straight to a later step. */
export function DemoJump({ jumps, active }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const away = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [open])

  const accent = '#7C3AED'

  return (
    <div ref={ref} className="relative">
      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 rounded-xl p-1.5"
          style={{ background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 8px 28px rgba(17,24,39,0.16)' }}
        >
          {jumps.map(j => {
            const on = j.key === active
            return (
              <button
                key={j.key}
                type="button"
                onClick={() => { setOpen(false); j.go() }}
                className="w-full text-left px-3 py-2 rounded-lg text-[13px] transition hover:bg-gray-50"
                style={on
                  ? {
                      background: 'linear-gradient(88.09deg, rgba(92,46,212,0.12) 0%, rgba(166,20,195,0.12) 100%)',
                      color: accent,
                      fontWeight: 600,
                    }
                  : { color: '#4B5563' }}
              >
                {j.label}
              </button>
            )
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #E5E7EB', backdropFilter: 'blur(6px)' }}
      >
        <span
          className="w-10 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(88.09deg, rgba(92,46,212,0.14) 0%, rgba(166,20,195,0.14) 100%)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
          </svg>
        </span>
        <span style={{ fontSize: '14.5px', fontWeight: 400, color: '#4B5563' }}>Quick Jump</span>
      </button>
    </div>
  )
}

/* Floating wrapper — landing page only. */
export default function DemoBar({ jumps, active }) {
  return (
    <div className="fixed bottom-4 left-3 z-[10001] no-print w-[232px]">
      <DemoJump jumps={jumps} active={active} />
    </div>
  )
}
