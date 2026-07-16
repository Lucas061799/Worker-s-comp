import { useState, useRef, useEffect, useCallback } from 'react'

// Nominatim returns state as a full name ("Illinois"); the State <Select>
// expects USPS 2-letter abbreviations ("IL"). Map both directions so we
// don't silently dump a string the dropdown can't match.
const STATE_NAME_TO_ABBR = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY', 'district of columbia': 'DC',
}

function normalizeState(raw) {
  if (!raw) return ''
  const trimmed = String(raw).trim()
  // Already an abbreviation
  if (trimmed.length === 2) return trimmed.toUpperCase()
  const hit = STATE_NAME_TO_ABBR[trimmed.toLowerCase()]
  return hit || trimmed
}

export default function AddressAutocomplete({ value, onChange, onSelect, label = 'Address', required, error }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const debounceRef = useRef(null)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const [isDark, setIsDark] = useState(document.documentElement.getAttribute('data-dark') === 'true')
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-dark') === 'true')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-dark'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => { setQuery(value || '') }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Recalculate dropdown position whenever it opens or window scrolls/resizes
  const calcPosition = useCallback(() => {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    calcPosition()
    window.addEventListener('scroll', calcPosition, true)
    window.addEventListener('resize', calcPosition)
    return () => {
      window.removeEventListener('scroll', calcPosition, true)
      window.removeEventListener('resize', calcPosition)
    }
  }, [open, calcPosition])

  const search = useCallback(async (q) => {
    if (!q || q.length < 3) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=us`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setSuggestions(data)
      setOpen(data.length > 0)
      setHighlighted(-1)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    onChange && onChange(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 350)
  }

  const handleSelect = (item) => {
    const a = item.address || {}
    const road    = a.road || a.pedestrian || a.footway || ''
    const houseNo = a.house_number ? `${a.house_number} ` : ''
    const street  = `${houseNo}${road}`.trim()
    const city    = a.city || a.town || a.village || a.county || ''
    const state   = normalizeState(a['ISO3166-2-lvl4']?.split('-')[1] || a.state || '')
    const zip     = a.postcode || ''
    setQuery(street)
    setOpen(false)
    setSuggestions([])
    onSelect && onSelect({ address: street, city, state, zip })
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown')  { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); handleSelect(suggestions[highlighted]) }
    if (e.key === 'Escape')     { setOpen(false) }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-[13px] font-semibold text-gray-600 mb-1.5 tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) { calcPosition(); setOpen(true) } }}
          placeholder="Start typing an address…"
          className={`w-full border rounded-lg px-3.5 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:ring-2 transition-all hover:border-gray-300 ${
            error
              ? 'border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]/40'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading
            ? <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            : <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
              </svg>
          }
        </div>
      </div>

      {/* Dropdown — fixed positioning so it's never clipped by overflow-y-auto containers */}
      {open && suggestions.length > 0 && (
        <div
          style={{ ...dropdownStyle, background: isDark ? '#252948' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F3F4F6', borderRadius: '12px', overflow: 'hidden', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)' }}
        >
          {suggestions.map((item, idx) => {
            const a = item.address || {}
            const road    = a.road || a.pedestrian || a.footway || ''
            const houseNo = a.house_number ? `${a.house_number} ` : ''
            const city    = a.city || a.town || a.village || ''
            const state   = normalizeState(a['ISO3166-2-lvl4']?.split('-')[1] || a.state || '')
            const zip     = a.postcode || ''
            const line1   = `${houseNo}${road}`.trim() || item.display_name.split(',')[0]
            const line2   = [city, state, zip].filter(Boolean).join(', ')

            return (
              <button
                key={item.place_id}
                type="button"
                onMouseDown={() => handleSelect(item)}
                className="w-full text-left px-4 py-2.5 flex items-start gap-3 transition-all"
                style={idx === highlighted
                  ? { background: isDark ? 'rgba(167,139,250,0.15)' : 'linear-gradient(88.09deg, rgba(92,46,212,0.07) 0%, rgba(166,20,195,0.07) 100%)' }
                  : { background: isDark ? '#252948' : 'white' }
                }
                onMouseEnter={() => setHighlighted(idx)}
              >
                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div>
                  <p className="text-xs font-semibold text-gray-800" style={isDark ? { color: '#F9FAFB' } : undefined}>{line1}</p>
                  {line2 && <p className="text-[10px] text-gray-400 mt-0.5">{line2}</p>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}
