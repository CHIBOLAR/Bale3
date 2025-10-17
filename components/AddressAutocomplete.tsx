'use client'

import { useState, useEffect, useRef } from 'react'

interface AddressComponents {
  address_line1: string
  address_line2: string
  city: string
  state: string
  country: string
  pin_code: string
}

interface AddressAutocompleteProps {
  onSelectAddress: (address: AddressComponents) => void
  placeholder?: string
  initialValue?: string
}

interface GeoapifyFeature {
  properties: {
    formatted: string
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
    housenumber?: string
    street?: string
    suburb?: string
    county?: string
  }
}

export default function AddressAutocomplete({
  onSelectAddress,
  placeholder = 'Search for your address...',
  initialValue = '',
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions from Geoapify
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    // Debounce API calls
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query
          )}&apiKey=${apiKey}&limit=5`
        )
        const data = await response.json()
        setSuggestions(data.features || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error fetching address suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query])

  const handleSelectSuggestion = (feature: GeoapifyFeature) => {
    const props = feature.properties

    // Build address_line1 from available components
    let addressLine1 = ''
    if (props.housenumber) {
      addressLine1 = props.housenumber
    }
    if (props.street) {
      addressLine1 = addressLine1 ? `${addressLine1} ${props.street}` : props.street
    }
    if (!addressLine1 && props.address_line1) {
      addressLine1 = props.address_line1
    }

    const addressComponents: AddressComponents = {
      address_line1: addressLine1 || '',
      address_line2: props.suburb || props.address_line2 || '',
      city: props.city || '',
      state: props.state || props.county || '',
      country: props.country || '',
      pin_code: props.postcode || '',
    }

    setQuery(props.formatted)
    setShowSuggestions(false)
    onSelectAddress(addressComponents)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-brand-blue border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((feature, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(feature)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="text-sm text-gray-900">{feature.properties.formatted}</div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && query.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3">
          <p className="text-sm text-gray-500">No addresses found. Try a different search.</p>
        </div>
      )}
    </div>
  )
}
