/**
 * Pantone TCX (Textile Color eXtended) Color Library
 *
 * This library contains common Pantone textile colors used in the fabric industry.
 * Pantone codes are industry-standard color references that ensure consistent
 * color communication between designers, manufacturers, and suppliers.
 *
 * Note: Hex codes are approximations for digital display. Physical Pantone
 * colors on fabric may vary based on substrate, printing method, and supplier.
 */

export interface PantoneColor {
  pantoneCode: string
  name: string
  hexCode: string
  category: 'basic' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'neutral' | 'special'
}

export const PANTONE_COLORS: PantoneColor[] = [
  // Basic Colors
  { pantoneCode: '19-0406 TCX', name: 'Black', hexCode: '#000000', category: 'basic' },
  { pantoneCode: '11-0601 TCX', name: 'White', hexCode: '#FFFFFF', category: 'basic' },
  { pantoneCode: '14-4002 TCX', name: 'Gray', hexCode: '#808080', category: 'neutral' },
  { pantoneCode: '18-5102 TCX', name: 'Steel Gray', hexCode: '#6B7C7D', category: 'neutral' },

  // Blues
  { pantoneCode: '19-4052 TCX', name: 'Classic Blue', hexCode: '#0F4C81', category: 'blue' },
  { pantoneCode: '19-5420 TCX', name: 'Navy Blue', hexCode: '#000080', category: 'blue' },
  { pantoneCode: '19-4049 TCX', name: 'Royal Blue', hexCode: '#4169E1', category: 'blue' },
  { pantoneCode: '14-4318 TCX', name: 'Sky Blue', hexCode: '#87CEEB', category: 'blue' },
  { pantoneCode: '18-4140 TCX', name: 'Teal', hexCode: '#008080', category: 'blue' },
  { pantoneCode: '17-4540 TCX', name: 'Cyan', hexCode: '#00BFFF', category: 'blue' },
  { pantoneCode: '19-4241 TCX', name: 'Deep Royal', hexCode: '#002366', category: 'blue' },
  { pantoneCode: '19-4030 TCX', name: 'Midnight Navy', hexCode: '#003366', category: 'blue' },
  { pantoneCode: '18-4025 TCX', name: 'Columbia Blue', hexCode: '#B9D9EB', category: 'blue' },
  { pantoneCode: '16-4132 TCX', name: 'Turquoise', hexCode: '#40E0D0', category: 'blue' },
  { pantoneCode: '19-4220 TCX', name: 'Eggplant', hexCode: '#3D2B3D', category: 'blue' },

  // Greens
  { pantoneCode: '19-0315 TCX', name: 'Green', hexCode: '#008000', category: 'green' },
  { pantoneCode: '19-0417 TCX', name: 'Dark Green', hexCode: '#006400', category: 'green' },
  { pantoneCode: '13-0220 TCX', name: 'Light Green', hexCode: '#90EE90', category: 'green' },
  { pantoneCode: '15-6442 TCX', name: 'Emerald', hexCode: '#50C878', category: 'green' },
  { pantoneCode: '17-5641 TCX', name: 'Kelly Green', hexCode: '#4CBB17', category: 'green' },
  { pantoneCode: '18-5845 TCX', name: 'Midnight Green', hexCode: '#004953', category: 'green' },
  { pantoneCode: '18-5633 TCX', name: 'Dolphin', hexCode: '#0E8C7F', category: 'green' },
  { pantoneCode: '13-0530 TCX', name: 'Lime', hexCode: '#00FF00', category: 'green' },

  // Reds and Pinks
  { pantoneCode: '19-1664 TCX', name: 'Red', hexCode: '#FF0000', category: 'red' },
  { pantoneCode: '19-1557 TCX', name: 'Maroon', hexCode: '#800000', category: 'red' },
  { pantoneCode: '13-1520 TCX', name: 'Pink', hexCode: '#FFC0CB', category: 'red' },
  { pantoneCode: '18-1764 TCX', name: 'Cardinal', hexCode: '#C41E3A', category: 'red' },
  { pantoneCode: '19-1663 TCX', name: 'Devil Red', hexCode: '#8B0000', category: 'red' },
  { pantoneCode: '18-1547 TCX', name: 'Hot Pink', hexCode: '#FF69B4', category: 'red' },
  { pantoneCode: '19-1726 TCX', name: 'Burgundy', hexCode: '#800020', category: 'red' },
  { pantoneCode: '19-1930 TCX', name: '49er Burgundy', hexCode: '#7C0A02', category: 'red' },
  { pantoneCode: '18-1741 TCX', name: 'Co. Burgundy', hexCode: '#6D071A', category: 'red' },
  { pantoneCode: '18-2143 TCX', name: 'Light Maroon', hexCode: '#C32148', category: 'red' },

  // Purples
  { pantoneCode: '19-3536 TCX', name: 'Purple', hexCode: '#800080', category: 'purple' },
  { pantoneCode: '16-3520 TCX', name: 'Lilac', hexCode: '#C8A2C8', category: 'purple' },

  // Yellows and Oranges
  { pantoneCode: '13-0922 TCX', name: 'Yellow', hexCode: '#FFFF00', category: 'yellow' },
  { pantoneCode: '13-0755 TCX', name: 'Gold', hexCode: '#FFD700', category: 'yellow' },
  { pantoneCode: '15-1263 TCX', name: 'Orange', hexCode: '#FFA500', category: 'yellow' },
  { pantoneCode: '16-1459 TCX', name: 'Texas Orange', hexCode: '#FF4500', category: 'yellow' },
  { pantoneCode: '15-1147 TCX', name: 'Tennessee Orange', hexCode: '#FF8200', category: 'yellow' },
  { pantoneCode: '16-1350 TCX', name: 'Burnt Orange', hexCode: '#CC5500', category: 'yellow' },
  { pantoneCode: '16-0953 TCX', name: 'Vegas Gold', hexCode: '#C5B358', category: 'yellow' },
  { pantoneCode: '14-1064 TCX', name: 'Light Gold', hexCode: '#F0E68C', category: 'yellow' },
  { pantoneCode: '14-0852 TCX', name: 'Raven Gold', hexCode: '#DAA520', category: 'yellow' },
  { pantoneCode: '13-0739 TCX', name: 'Maize', hexCode: '#FBEC5D', category: 'yellow' },
  { pantoneCode: '13-0632 TCX', name: 'Lime/Yellow', hexCode: '#E3F988', category: 'yellow' },

  // Browns and Neutrals
  { pantoneCode: '18-1154 TCX', name: 'Brown', hexCode: '#A52A2A', category: 'neutral' },
  { pantoneCode: '11-0107 TCX', name: 'Beige', hexCode: '#F5F5DC', category: 'neutral' },
  { pantoneCode: '11-0617 TCX', name: 'Cream', hexCode: '#FFFDD0', category: 'neutral' },
  { pantoneCode: '12-0911 TCX', name: 'Tan', hexCode: '#D2B48C', category: 'neutral' },
  { pantoneCode: '18-1142 TCX', name: 'Bronze', hexCode: '#CD7F32', category: 'neutral' },

  // Special Colors
  { pantoneCode: '18-5612 TCX', name: 'Shark Teal', hexCode: '#006B7D', category: 'special' },
  { pantoneCode: '18-4735 TCX', name: 'Marlin Teal', hexCode: '#008B9C', category: 'special' },
  { pantoneCode: '17-5126 TCX', name: 'Eagle Gray', hexCode: '#B0B7BC', category: 'special' },
  { pantoneCode: '19-4241 TCX', name: 'Dk. Royal', hexCode: '#002366', category: 'special' },
  { pantoneCode: '19-4340 TCX', name: 'Avalanche Blue', hexCode: '#003D79', category: 'special' },
  { pantoneCode: '14-1133 TCX', name: 'Metallic Gold', hexCode: '#D4AF37', category: 'special' },
  { pantoneCode: '14-4102 TCX', name: 'Metallic Silver', hexCode: '#C0C0C0', category: 'special' },
  { pantoneCode: '14-5002 TCX', name: 'Silver', hexCode: '#C0C0C0', category: 'special' },
]

/**
 * Search Pantone colors by code, name, or hex
 */
export function searchPantoneColors(query: string, limit: number = 10): PantoneColor[] {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return PANTONE_COLORS.slice(0, limit)
  }

  const results = PANTONE_COLORS.filter(color => {
    return (
      color.pantoneCode.toLowerCase().includes(normalizedQuery) ||
      color.name.toLowerCase().includes(normalizedQuery) ||
      color.hexCode.toLowerCase().includes(normalizedQuery)
    )
  })

  return results.slice(0, limit)
}

/**
 * Get Pantone color by exact code
 */
export function getPantoneColorByCode(pantoneCode: string): PantoneColor | undefined {
  return PANTONE_COLORS.find(
    color => color.pantoneCode.toLowerCase() === pantoneCode.toLowerCase()
  )
}

/**
 * Get Pantone color by hex code (approximate match)
 */
export function getPantoneColorByHex(hexCode: string): PantoneColor | undefined {
  return PANTONE_COLORS.find(
    color => color.hexCode.toLowerCase() === hexCode.toLowerCase()
  )
}

/**
 * Get all colors in a category
 */
export function getPantoneColorsByCategory(category: PantoneColor['category']): PantoneColor[] {
  return PANTONE_COLORS.filter(color => color.category === category)
}
