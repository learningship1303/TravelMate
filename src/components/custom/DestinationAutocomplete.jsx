import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MapPin, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { autocompletePlaces, createSessionToken, getPlaceDetails, placesConfigured } from '@/service/placesApi'
import { SmartImage } from './SmartImage'

export function DestinationAutocomplete({
  value,
  onChangeText,
  onSelect,
  placeholder = 'Search for a city, landmark, or airport',
  className,
  inputClassName,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const sessionTokenRef = useRef(createSessionToken())
  const skipNextFetchRef = useRef(false)
  const containerRef = useRef(null)

  const debouncedQuery = useDebouncedValue(value, 300)

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false
      return undefined
    }
    if (!placesConfigured || !debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([])
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    setLoading(true)
    autocompletePlaces(debouncedQuery, sessionTokenRef.current, controller.signal)
      .then((results) => {
        setSuggestions(results.slice(0, 5))
        setLoading(false)
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setSuggestions([])
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [debouncedQuery])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [suggestions])

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectSuggestion = async (suggestion) => {
    skipNextFetchRef.current = true
    setOpen(false)
    setSuggestions([])
    const label = suggestion.fullText || suggestion.mainText
    onChangeText?.(label)

    try {
      const details = await getPlaceDetails(suggestion.placeId, sessionTokenRef.current)
      onSelect?.({
        description: details?.formattedAddress || label,
        mainText: suggestion.mainText,
        coordinates: details?.location
          ? { lat: details.location.latitude, lng: details.location.longitude }
          : undefined,
        placeId: suggestion.placeId,
      })
    } catch {
      onSelect?.({ description: label, mainText: suggestion.mainText, placeId: suggestion.placeId })
    }

    sessionTokenRef.current = createSessionToken()
  }

  const handleKeyDown = (event) => {
    if (!open || suggestions.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
    } else if (event.key === 'Enter') {
      if (highlightedIndex >= 0) {
        event.preventDefault()
        selectSuggestion(suggestions[highlightedIndex])
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && placesConfigured && (loading || suggestions.length > 0)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2" />
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            onChangeText?.(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="destination-listbox"
          className={cn(
            'border-input bg-background/80 focus-visible:ring-ring/50 w-full rounded-xl border py-3 pl-11 pr-10 text-sm shadow-xs outline-none transition focus-visible:ring-[3px]',
            inputClassName
          )}
        />
        {loading && (
          <Loader2 className="text-muted-foreground absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            id="destination-listbox"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="bg-popover text-popover-foreground shadow-soft-lg absolute z-50 mt-2 w-full overflow-hidden rounded-xl border"
          >
            {loading && suggestions.length === 0 && (
              <li className="text-muted-foreground px-4 py-3 text-sm">Searching destinations...</li>
            )}
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.placeId}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseDown={(event) => {
                  event.preventDefault()
                  selectSuggestion(suggestion)
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors',
                  index === highlightedIndex ? 'bg-accent/10' : 'hover:bg-accent/5'
                )}
              >
                <SmartImage query={suggestion.mainText} alt={suggestion.mainText} className="size-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{suggestion.mainText}</p>
                  {suggestion.secondaryText && (
                    <p className="text-muted-foreground truncate text-xs">{suggestion.secondaryText}</p>
                  )}
                </div>
                <MapPin className="text-muted-foreground size-4 shrink-0" />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
