'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Color {
  id: string
  name: string
  hex_code: string
  pantone_code: string | null
  usage_count: number
}

interface SmartColorPickerProps {
  value?: string // Color name
  hexValue?: string // Hex code
  pantoneValue?: string // Pantone code
  onChange: (colorName: string, hexCode: string, pantoneCode?: string) => void
  required?: boolean
}

export default function SmartColorPicker({
  value = '',
  hexValue = '#000000',
  pantoneValue = '',
  onChange,
  required = false
}: SmartColorPickerProps) {
  const [colorName, setColorName] = useState(value)
  const [hexCode, setHexCode] = useState(hexValue)
  const [pantoneCode, setPantoneCode] = useState(pantoneValue)
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
    setPantoneCode(color.pantone_code || '')
    onChange(color.name, color.hex_code, color.pantone_code || undefined)
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
    onChange(newName, hexCode, pantoneCode)
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
    setHexCode(newHex)
    onChange(colorName, newHex, pantoneCode)
  }

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value
    setHexCode(newHex)
    onChange(colorName, newHex, pantoneCode)
  }

  const handlePantoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPantone = e.target.value
    setPantoneCode(newPantone)
    onChange(colorName, hexCode, newPantone)
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
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
        />

        {/* Color Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg border border-gray-200 overflow-auto">
            {suggestions.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => selectColor(color)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: color.hex_code }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{color.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 font-mono">{color.hex_code}</p>
                    {color.pantone_code && (
                      <span className="text-xs text-brand-blue font-mono">• {color.pantone_code}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-md">
                  Used {color.usage_count}×
                </div>
              </button>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Start typing to see suggested colors from your catalog
        </p>
      </div>

      {/* Hex Code Input with Color Picker */}
      <div>
        <label htmlFor="hex-code" className="block text-sm font-medium text-gray-700 mb-2">
          Hex Color Code {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              id="hex-code"
              type="text"
              value={hexCode}
              onChange={handleHexChange}
              placeholder="#000000"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              required={required}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-mono"
            />
          </div>
          <div className="relative">
            <input
              ref={colorPickerRef}
              type="color"
              value={hexCode}
              onChange={handleColorPickerChange}
              className="h-[42px] w-20 cursor-pointer rounded-lg border-2 border-gray-300 hover:border-brand-blue transition-colors"
              title="Pick a color"
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Enter a hex color code or click the color box to pick a color
        </p>
      </div>

      {/* Pantone Code Input */}
      <div>
        <label htmlFor="pantone-code" className="block text-sm font-medium text-gray-700 mb-2">
          Pantone Code <span className="text-xs text-gray-500">(Optional)</span>
        </label>
        <input
          id="pantone-code"
          type="text"
          value={pantoneCode}
          onChange={handlePantoneChange}
          placeholder="e.g., 19-4052 TCX"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-mono"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter a Pantone color code for textile matching (e.g., 19-1664 TCX for Red)
        </p>
      </div>

      {/* Color Preview */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div
          className="w-16 h-16 rounded-xl border-2 border-gray-300 shadow-md flex-shrink-0"
          style={{ backgroundColor: hexCode }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{colorName || 'No color name'}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-600 font-mono">{hexCode}</p>
            {pantoneCode && (
              <p className="text-xs text-brand-blue font-mono">• {pantoneCode}</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">This is how the color will appear</p>
        </div>
      </div>
    </div>
  )
}
