// Returns distance in kilometres between two lat/lng points
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Approximate lat/lng for Bangalore pincodes
export const PINCODE_COORDS: Record<string, { lat: number; lng: number; area: string }> = {
  '560001': { lat: 12.9698, lng: 77.5986, area: 'MG Road / City Centre' },
  '560002': { lat: 12.9780, lng: 77.5730, area: 'Malleswaram' },
  '560003': { lat: 12.9630, lng: 77.5830, area: 'Chickpet' },
  '560004': { lat: 12.9416, lng: 77.5749, area: 'Basavanagudi' },
  '560005': { lat: 12.9830, lng: 77.6088, area: 'Russell Market / Shivajinagar' },
  '560008': { lat: 12.9912, lng: 77.5678, area: 'Rajajinagar' },
  '560010': { lat: 12.9876, lng: 77.5470, area: 'Rajajinagar Industrial' },
  '560022': { lat: 13.0232, lng: 77.5402, area: 'Yeshwanthpur' },
  '560034': { lat: 12.9352, lng: 77.6245, area: 'Koramangala' },
  '560037': { lat: 12.9592, lng: 77.6985, area: 'Marathahalli' },
  '560038': { lat: 12.9784, lng: 77.6408, area: 'Indiranagar' },
  '560042': { lat: 12.9773, lng: 77.6100, area: 'Dickenson Road' },
  '560058': { lat: 13.0282, lng: 77.5171, area: 'Peenya' },
  '560066': { lat: 12.9698, lng: 77.7500, area: 'Whitefield' },
  '560078': { lat: 12.8633, lng: 77.6107, area: 'Bannerghatta Road' },
  '560080': { lat: 13.0050, lng: 77.5705, area: 'Sadashivanagar' },
  '560095': { lat: 12.9300, lng: 77.6200, area: 'Koramangala 5th Block' },
  '560099': { lat: 12.7983, lng: 77.6878, area: 'Bommasandra' },
  '560100': { lat: 12.8399, lng: 77.6770, area: 'Electronic City' },
  '560105': { lat: 12.7976, lng: 77.6366, area: 'Jigani' },
}

export const BANGALORE_CENTER = { lat: 12.9716, lng: 77.5946, area: 'Bangalore Centre' }
