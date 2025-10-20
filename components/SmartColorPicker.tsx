'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Color {
  id: string
  name: string
  hex_code: string
  usage_count: number
}

interface SmartColorPickerProps {
  value?: string // Color name
  hexValue?: string // Hex code
  onChange: (colorName: string, hexCode: string) => void
  required?: boolean
}

export default function SmartColorPicker({
  value = '',
  hexValue = '#000000',
  onChange,
  required = false
}: SmartColorPickerProps) {
  const [colorName, setColorName] = useState(value)
  const [hexCode, setHexCode] = useState(hexValue)
  const [suggestions, setSuggestions] = useState<Color[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const colorPickerRef = useRef<HTMLInputElement>(null)

  // Fetch color suggestions as user types
  useEffect(() => {
    if (colorName.length >= 2) {
      fetchSuggestions(colorName)
    } else {
      setSuggestions([])
    }
  }, [colorName])

  const fetchSuggestions = async (searchTerm: string) => {
    try {
      const supabase = createClient()

      // Get user's company
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('auth_user_id', user.id)
        .single()

      if (!userData?.company_id) return

      // Search colors by name (case-insensitive)
      const { data: colors } = await supabase
        .from('colors')
        .select('*')
        .eq('company_id', userData.company_id)
        .ilike('name', `%${searchTerm}%`)
        .order('usage_count', { ascending: false })
        .limit(5)

      setSuggestions(colors || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching color suggestions:', error)
    }
  }

  const selectColor = (color: Color) => {
    setColorName(color.name)
    setHexCode(color.hex_code)
    onChange(color.name, color.hex_code)
    setShowSuggestions(false)

    // Increment usage count
    incrementUsage(color.id)
  }

  const incrementUsage = async (colorId: string) => {
    try {
      const supabase = createClient()
      await supabase.rpc('increment_color_usage', { color_id: colorId })
    } catch (error) {
      console.error('Error incrementing color usage:', error)
    }
  }

  const handleColorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setColorName(newName)
    onChange(newName, hexCode)
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
    setHexCode(newHex)
    onChange(colorName, newHex)
  }

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
    setHexCode(newHex)
    onChange(colorName, newHex)
  }

  return (
    <div className="space-y-4">
      {/* Color Name Input */}
      <div className="relative">
        <label htmlFor="color-name" className="block text-sm font-medium text-gray-700 mb-2">
          Color Name {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={inputRef}
          id="color-name"
          type="text"
          value={colorName}
          onChange={handleColorNameChange}
          onFocus={() => colorName.length >= 2 && setShowSuggestions(true)}
          placeholder="e.g., Sky Blue, Forest Green"
          required={required}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />

        {/* Color Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {suggestions.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => selectColor(color)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
              >
                <div
                  className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color.hex_code }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{color.name}</p>
                  <p className="text-xs text-gray-500">{color.hex_code}</p>
                </div>
                <div className="text-xs text-gray-400">
                  Used {color.usage_count}×
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hex Code Input with Color Picker */}
      <div>
        <label htmlFor="hex-code" className="block text-sm font-medium text-gray-700 mb-2">
          Color Code {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              id="hex-code"
              type="text"
              value={hexCode}
              onChange={handleHexChange}
              placeholder="#000000"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              required={required}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
            />
          </div>
          <div className="relative">
            <input
              ref={colorPickerRef}
              type="color"
              value={hexCode}
              onChange={handleColorPickerChange}
              className="h-10 w-16 cursor-pointer rounded-md border border-gray-300"
              title="Pick a color"
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Enter a hex color code or use the color picker
        </p>
      </div>

      {/* Color Preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div
          className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: hexCode }}
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{colorName || 'No color name'}</p>
          <p className="text-xs text-gray-500 font-mono">{hexCode}</p>
        </div>
      </div>
    </div>
  )
}
