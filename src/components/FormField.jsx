import { useRef, useState, useEffect } from 'react'

// Phone formatter — produces (555) 000-0000
function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
}

// Reusable input
export function Input({ label, required, placeholder, type = 'text', value, onChange, className = '', error = false }) {
  const handleChange = (e) => {
    if (!onChange) return
    if (type === 'tel') {
      onChange(formatPhone(e.target.value))
    } else {
      onChange(e.target.value)
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type === 'tel' ? 'text' : type}
        inputMode={type === 'tel' ? 'numeric' : undefined}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400'
            : 'border-gray-200 bg-white focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40 hover:border-gray-300'
        }`}
      />
      {error && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> This field is required</p>}
    </div>
  )
}

// Date formatter — produces MM/DD/YYYY as user types
function formatDateInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEK_DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const YEAR_RANGE = Array.from({ length: 26 }, (_, i) => new Date().getFullYear() - 5 + i)

// Custom calendar popup — 3-mode: days / months / years
function CalendarPopup({ value, onChange, onClose, anchorRef }) {
  const today = new Date()
  const parsed = (() => {
    if (!value || value.length < 10) return null
    const [m, d, y] = value.split('/')
    if (!m || !d || !y || y.length !== 4) return null
    const dt = new Date(+y, +m - 1, +d)
    return isNaN(dt.getTime()) ? null : dt
  })()

  const [viewYear, setViewYear] = useState(parsed ? parsed.getFullYear() : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed ? parsed.getMonth() : today.getMonth())
  const [mode, setMode] = useState('days') // 'days' | 'months' | 'years'
  const popupRef = useRef(null)

  // Fixed-position calc — mirrors Select's dropdown so the popup floats
  // above overflow:hidden ancestors (table containers, cards, modals).
  // The initial `visibility: hidden` keeps the popup out of the flow while
  // it also keeps it out of `anchorRef.current.getBoundingClientRect()` —
  // otherwise the popup renders below the input for one frame, extends
  // the anchor's bottom, and `recalc` places the fixed popup even lower.
  const [popupStyle, setPopupStyle] = useState({
    position: 'fixed', top: 0, left: 0, width: 264, zIndex: 9999,
    visibility: 'hidden',
  })
  useEffect(() => {
    const recalc = () => {
      if (!anchorRef.current) return
      const r = anchorRef.current.getBoundingClientRect()
      const width = 264
      // Right-align if the popup would overflow the viewport on the right.
      const leftPreferred = r.left
      const left = leftPreferred + width > window.innerWidth - 8
        ? Math.max(8, window.innerWidth - width - 8)
        : leftPreferred
      setPopupStyle({
        position: 'fixed',
        top: r.bottom + 4,
        left,
        width,
        zIndex: 9999,
      })
    }
    recalc()
    window.addEventListener('scroll', recalc, true)
    window.addEventListener('resize', recalc)
    return () => {
      window.removeEventListener('scroll', recalc, true)
      window.removeEventListener('resize', recalc)
    }
  }, [anchorRef])

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) &&
          anchorRef.current && !anchorRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorRef])

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }
  const prevYear = () => setViewYear(y => y - 1)
  const nextYear = () => setViewYear(y => y + 1)

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const isSelected = (day) => parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === day
  const isToday = (day) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day

  const selectDay = (day) => {
    onChange(`${String(viewMonth + 1).padStart(2,'0')}/${String(day).padStart(2,'0')}/${viewYear}`)
    onClose()
  }

  return (
    <div
      ref={popupRef}
      className="rounded-2xl p-3 select-none"
      style={{ ...popupStyle, background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(15,10,40,0.12)' }}
    >
      {/* ── DAYS VIEW ── */}
      {mode === 'days' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button type="button" onClick={() => setMode('months')}
              className="px-3 py-1 rounded-lg text-[13px] font-bold transition hover:bg-gray-100"
              style={{ background: 'linear-gradient(88.09deg,#5C2ED4 0%,#A614C3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {MONTHS_SHORT[viewMonth]} {viewYear}
            </button>
            <button type="button" onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map(d => (
              <span key={d} className="text-center text-[10px] font-bold text-gray-400 pb-1">{d}</span>
            ))}
          </div>
          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              const selected = day && isSelected(day)
              const tod = day && isToday(day)
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!day}
                  onClick={() => day && selectDay(day)}
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-all ${
                    !day ? 'invisible' :
                    selected ? 'text-white font-bold' :
                    tod ? 'font-bold' :
                    'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={
                    selected ? { background: 'linear-gradient(88.09deg,#5C2ED4 0%,#A614C3 100%)', boxShadow: '0 2px 8px rgba(92,46,212,0.35)' } :
                    tod ? { color: '#7C3AED', border: '1.5px solid #7C3AED' } :
                    {}
                  }
                >
                  {day}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ── MONTHS VIEW ── */}
      {mode === 'months' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevYear}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button type="button" onClick={() => setMode('years')}
              className="px-2 py-1 rounded-lg text-[13px] font-bold text-gray-800 transition hover:bg-gray-100">
              {viewYear}
            </button>
            <button type="button" onClick={nextYear}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_SHORT.map((m, idx) => {
              const isCurMonth = idx === viewMonth
              const isTodayMonth = today.getFullYear() === viewYear && today.getMonth() === idx
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setViewMonth(idx); setMode('days') }}
                  className="py-2 rounded-xl text-xs font-semibold transition-all"
                  style={
                    isCurMonth
                      ? { background: 'linear-gradient(88.09deg,#5C2ED4 0%,#A614C3 100%)', color: 'white', boxShadow: '0 2px 8px rgba(92,46,212,0.3)' }
                      : isTodayMonth
                      ? { border: '1.5px solid #7C3AED', color: '#7C3AED', background: 'transparent' }
                      : { border: '1.5px solid transparent', color: '#374151', background: 'transparent' }
                  }
                  onMouseEnter={e => { if (!isCurMonth) e.currentTarget.style.background = '#F9FAFB' }}
                  onMouseLeave={e => { if (!isCurMonth) e.currentTarget.style.background = isTodayMonth ? 'transparent' : 'transparent' }}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ── YEARS VIEW ── */}
      {mode === 'years' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setMode('days')}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span className="text-[13px] font-bold text-gray-800">Select Year</span>
            <div className="w-7" />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '192px' }}>
            <div className="grid grid-cols-3 gap-1.5">
              {YEAR_RANGE.map(y => {
                const isSelYear = y === viewYear
                const isTodayYear = y === today.getFullYear()
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => { setViewYear(y); setMode('months') }}
                    className="py-2 rounded-xl text-xs font-semibold transition-all"
                    style={
                      isSelYear
                        ? { background: 'linear-gradient(88.09deg,#5C2ED4 0%,#A614C3 100%)', color: 'white', boxShadow: '0 2px 8px rgba(92,46,212,0.3)' }
                        : isTodayYear
                        ? { border: '1.5px solid #7C3AED', color: '#7C3AED', background: 'transparent' }
                        : { border: '1.5px solid transparent', color: '#374151', background: 'transparent' }
                    }
                    onMouseEnter={e => { if (!isSelYear) e.currentTarget.style.background = '#F9FAFB' }}
                    onMouseLeave={e => { if (!isSelYear) e.currentTarget.style.background = 'transparent' }}
                  >
                    {y}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Date input with auto-format + custom calendar picker
export function DateInput({ label, required, value, onChange, className = '', error = false }) {
  const [showCal, setShowCal] = useState(false)
  const wrapRef = useRef()

  const handleTextChange = (e) => {
    if (!onChange) return
    onChange(formatDateInput(e.target.value))
  }

  return (
    <div className={`${className} relative`} ref={wrapRef}>
      {label && (
        <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value || ''}
          onChange={handleTextChange}
          placeholder="MM / DD / YYYY"
          maxLength={10}
          className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all pr-10 ${
            error
              ? 'border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 bg-white focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40 hover:border-gray-300'
          }`}
        />
        {/* Calendar icon */}
        <button
          type="button"
          onClick={() => setShowCal(v => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
          style={{ color: showCal ? '#7C3AED' : value ? '#7C3AED' : '#9CA3AF' }}
          onMouseEnter={e => e.currentTarget.style.color = '#7C3AED'}
          onMouseLeave={e => e.currentTarget.style.color = (showCal || value) ? '#7C3AED' : '#9CA3AF'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </button>
      </div>

      {/* Custom calendar popup */}
      {showCal && (
        <CalendarPopup
          value={value}
          onChange={(v) => { onChange && onChange(v) }}
          onClose={() => setShowCal(false)}
          anchorRef={wrapRef}
        />
      )}

      {error && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> This field is required</p>}
    </div>
  )
}

// Textarea
export function Textarea({ label, required, placeholder, rows = 4, value, onChange, className = '', error = false }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all resize-none ${
          error
            ? 'border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400'
            : 'border-gray-200 bg-white focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40 hover:border-gray-300'
        }`}
      />
      {error && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> This field is required</p>}
    </div>
  )
}

// Select / Dropdown — custom styled, no native <select>
export function Select({ label, required, options = [], value, onChange, placeholder = 'Select...', className = '', error = false }) {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const ref = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Recalculate dropdown position on open / scroll / resize so it floats above
  // overflow:hidden ancestors (carrier cards, modals, etc.).
  useEffect(() => {
    if (!open || !triggerRef.current) return
    const recalc = () => {
      if (!triggerRef.current) return
      const r = triggerRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: r.bottom + 4,
        left: r.left,
        width: r.width,
        zIndex: 9999,
      })
    }
    recalc()
    window.addEventListener('scroll', recalc, true)
    window.addEventListener('resize', recalc)
    return () => {
      window.removeEventListener('scroll', recalc, true)
      window.removeEventListener('resize', recalc)
    }
  }, [open])

  const optVal = (opt) => opt.value ?? opt
  const optLabel = (opt) => opt.label ?? opt
  const selectedLabel = options.find(o => optVal(o) === value) ? optLabel(options.find(o => optVal(o) === value)) : null

  return (
    <div className={`${className} relative`} ref={ref}>
      {label && (
        <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm text-left transition-all"
        style={{
          background: 'white',
          borderColor: error ? '#FCA5A5' : open ? '#7C3AED' : '#E5E7EB',
          boxShadow: error ? '0 0 0 2px rgba(252,165,165,0.3)' : open ? '0 0 0 2px rgba(124,58,237,0.1)' : 'none',
          color: selectedLabel ? '#1F2937' : '#9CA3AF',
        }}
      >
        <span className="truncate pr-2">{selectedLabel || placeholder}</span>
        <svg
          className="w-4 h-4 shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: open ? '#7C3AED' : '#9CA3AF' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown panel — fixed positioning so it's never clipped by overflow:hidden parents */}
      {open && (
        <div
          className="rounded-xl overflow-hidden bop-select-dropdown"
          style={{ ...dropdownStyle, background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
            {options.map(opt => {
              const v = optVal(opt)
              const l = optLabel(opt)
              const selected = v === value
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => { onChange && onChange(v); setOpen(false) }}
                  className="w-full text-left px-3.5 py-2.5 text-sm transition-all flex items-center justify-between gap-2"
                  style={{
                    background: selected ? 'linear-gradient(88.09deg, rgba(92,46,212,0.07) 0%, rgba(166,20,195,0.07) 100%)' : 'transparent',
                    color: selected ? '#A614C3' : '#374151',
                    fontWeight: selected ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#F9FAFB' }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                >
                  <span>{l}</span>
                  {selected && (
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" stroke="url(#selCheckG)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="selCheckG" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#5C2ED4"/><stop offset="100%" stopColor="#A614C3"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> This field is required</p>}
    </div>
  )
}

// Radio Group
export function RadioGroup({ label, required, options = [], value, onChange, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[13px] font-semibold text-gray-600 mb-2.5 tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="flex gap-4">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange && onChange(opt)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
              value === opt
                ? 'border-[#5C2ED4] text-[#5C2ED4]'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
            }`}
            style={value === opt ? { background: 'linear-gradient(88.09deg, rgba(92,46,212,0.08) 0%, rgba(166,20,195,0.08) 100%)' } : {}}
          >
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              value === opt ? 'border-[#A614C3]' : 'border-gray-300'
            }`}>
              {value === opt && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)' }} />}
            </div>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// Checkbox
export function Checkbox({ label, checked, onChange, className = '' }) {
  return (
    <label className={`flex items-start gap-2.5 cursor-pointer group ${className}`}>
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all ${
          checked ? 'border-[#A614C3]' : 'border-gray-300 group-hover:border-[#5C2ED4]/40'
        }`}
        style={checked ? { background: 'linear-gradient(88.09deg, #5C2ED4 0%, #A614C3 100%)' } : {}}
        onClick={() => onChange && onChange(!checked)}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="text-xs text-gray-600">{label}</span>
    </label>
  )
}

// Two-column grid
export function FormGrid({ children, cols = 2, className = '' }) {
  const colClass = cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : cols === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
  return (
    <div className={`grid ${colClass} gap-x-6 gap-y-5 ${className}`}>
      {children}
    </div>
  )
}
