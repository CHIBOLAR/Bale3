'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { searchPantoneColors, getPantoneColorByCode, type PantoneColor } from '@/lib/pantone-colors'

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
  onChange: (colorName: string, hexCode: string) => void
  required?: boolean
}

export default function SmartColorPicker({
  value = '',
  hexValue = '#000000',
  onChange,
  required = false
}: SmartColorPickerProps) {
  const [pantoneCode, setPantoneCode] = useState('')
  const [colorName, setColorName] = useState(value)
  const [hexCode, setHexCode] = useState(hexValue)
  const [suggestions, setSuggestions] = useState<Color[]>([])
  const [pantoneSuggestions, setPantoneSuggestions] = useState<PantoneColor[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showPantoneSuggestions, setShowPantoneSuggestions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const pantoneInputRef = useRef<HTMLInputElement>(null)
  const colorPickerRef = useRef<HTMLInputElement>(null)

  // Fetch Pantone suggestions as user types
  useEffect(() => {
    if (pantoneCode.length >= 2) {
      const results = searchPantoneColors(pantoneCode, 5)
      setPantoneSuggestions(results)
      setShowPantoneSuggestions(true)
    } else {
      setPantoneSuggestions([])
    }
  }, [pantoneCode])

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

      // Search colors by name or Pantone code (case-insensitive)
      const { data: colors } = await supabase
        .from('colors')
        .select('*')
        .eq('company_id', userData.company_id)
        .or(`name.ilike.%${searchTerm}%,pantone_code.ilike.%${searchTerm}%`)
        .order('usage_count', { ascending: false })
        .limit(5)

      setSuggestions(colors || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching color suggestions:', error)
    }
  }

  const selectColor = (color: Color) => {
    setPantoneCode(color.pantone_code || '')
    setColorName(color.name)
    setHexCode(color.hex_code)
    onChange(color.name, color.hex_code)
    setShowSuggestions(false)

    // Increment usage count
    incrementUsage(color.id)
  }

  const selectPantoneColor = async (pantoneColor: PantoneColor) => {
    setPantoneCode(pantoneColor.pantoneCode)
    setColorName(pantoneColor.name)
    setHexCode(pantoneColor.hexCode)
    onChange(pantoneColor.name, pantoneColor.hexCode)
    setShowPantoneSuggestions(false)

    // Save to database
    await saveOrFindColor(pantoneColor.name, pantoneColor.hexCode, pantoneColor.pantoneCode)
  }

  const incrementUsage = async (colorId: string) => {
    try {
      const supabase = createClient()
      await supabase.rpc('increment_color_usage', { color_id: colorId })
    } catch (error) {
      console.error('Error incrementing usage:', error)
    }
  }

  const handlePantoneCodeChange = (code: string) => {
    setPantoneCode(code)
    // Auto-fill from Pantone library if exact match
    if (code.length >= 5) {
      const pantoneColor = getPantoneColorByCode(code)
      if (pantoneColor) {
        setColorName(pantoneColor.name)
        setHexCode(pantoneColor.hexCode)
        onChange(pantoneColor.name, pantoneColor.hexCode)
      }
    }
  }

  const handleColorNameChange = (name: string) => {
    setColorName(name)
    onChange(name, hexCode)
  }

  const handleManualColorPick = (hex: string) => {
    setHexCode(hex.toUpperCase())
    onChange(colorName || 'Custom Color', hex.toUpperCase())

    // If color name is provided, save to database
    if (colorName) {
      saveOrFindColor(colorName, hex.toUpperCase(), pantoneCode || null)
    }
  }

  const openColorPicker = () => {
    colorPickerRef.current?.click()
  }

  const saveOrFindColor = async (name: string, hex: string, pantone: string | null = null) => {
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

      // Check if this color already exists (by Pantone code, name, or hex)
      let query = supabase
        .from('colors')
        .select('*')
        .eq('company_id', userData.company_id)

      if (pantone) {
        query = query.or(`pantone_code.eq.${pantone},name.eq.${name},hex_code.eq.${hex}`)
      } else {
        query = query.or(`name.eq.${name},hex_code.eq.${hex}`)
      }

      const { data: existingColor } = await query.single()

      if (existingColor) {
        // Use existing color
        setPantoneCode(existingColor.pantone_code || '')
        setColorName(existingColor.name)
        setHexCode(existingColor.hex_code)
        onChange(existingColor.name, existingColor.hex_code)
        await incrementUsage(existingColor.id)
      } else {
        // Create new color entry
        const { data: newColor, error } = await supabase
          .from('colors')
          .insert([{
            company_id: userData.company_id,
            name: name,
            hex_code: hex,
            pantone_code: pantone,
            usage_count: 1
          }])
          .select()
          .single()

        if (error) {
          console.error('Error creating color:', error)
        } else if (newColor) {
          setPantoneCode(newColor.pantone_code || '')
          setColorName(newColor.name)
          setHexCode(newColor.hex_code)
          onChange(newColor.name, newColor.hex_code)
        }
      }
    } catch (error) {
      console.error('Error saving/finding color:', error)
    }
  }

  return (
    <div className="space-y-3">
      {/* Pantone Code Input - Priority Field */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <span>Pantone Code (TCX)</span>
          <span className="text-xs text-gray-500 font-normal">Textile industry standard</span>
          {/* Tooltip Icon */}
          <div className="relative group inline-block">
            <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Add color below swatch
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </label>
        <div className="relative">
          <input
            ref={pantoneInputRef}
            type="text"
            value={pantoneCode}
            onChange={(e) => handlePantoneCodeChange(e.target.value.toUpperCase())}
            onFocus={() => pantoneCode.length >= 2 && setShowPantoneSuggestions(true)}
            onBlur={() => setTimeout(() => setShowPantoneSuggestions(false), 200)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-mono"
            placeholder="e.g., 19-4052 TCX, 19-1664 TCX"
          />

          {/* Pantone Autocomplete Suggestions */}
          {showPantoneSuggestions && pantoneSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {pantoneSuggestions.map((pantoneColor, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectPantoneColor(pantoneColor)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                >
                  <div
                    className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: pantoneColor.hexCode }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{pantoneColor.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{pantoneColor.pantoneCode} • {pantoneColor.hexCode}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Enter Pantone TCX code for precise color matching (optional, but recommended for textile industry)
        </p>
      </div>

      {/* Color Name Input with Autocomplete */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Name {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2">
          {/* Color Swatch - Clickable */}
          <div
            onClick={openColorPicker}
            className="w-12 h-[42px] rounded-lg border-2 border-gray-300 flex-shrink-0 cursor-pointer hover:border-brand-blue transition-colors relative group"
            style={{ backgroundColor: hexCode }}
            title="Click to pick exact color"
          >
            {/* Picker icon overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all">
              <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>

          {/* Hidden Color Picker Input */}
          <input
            ref={colorPickerRef}
            type="color"
            value={hexCode}
            onChange={(e) => handleManualColorPick(e.target.value)}
            className="hidden"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={colorName}
              onChange={(e) => handleColorNameChange(e.target.value)}
              onFocus={() => colorName.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              required={required}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              placeholder="e.g., Navy Blue, Burgundy"
            />

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => selectColor(color)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div
                      className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{color.name}</div>
                      <div className="text-xs text-gray-500">
                        {color.pantone_code && <span className="font-mono">{color.pantone_code} • </span>}
                        {color.hex_code} • Used {color.usage_count} times
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Type a color name or click the color box to pick manually
        </p>
      </div>
    </div>
  )
}
