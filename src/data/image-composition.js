// Presentation metadata, not a scientific claim or a physical edit of the image.
export const DEFAULT_COMPOSITION = Object.freeze({ x: 0.5, y: 0.5, zoom: 1 })

export function validComposition(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === 3 && ['x', 'y', 'zoom'].every(key => Number.isFinite(value[key])) &&
    value.x >= 0 && value.x <= 1 && value.y >= 0 && value.y <= 1 && value.zoom >= 1 && value.zoom <= 1.6
}

export function imageComposition(photo) {
  return validComposition(photo?.composition) ? photo.composition : DEFAULT_COMPOSITION
}

export function compositionStyle(photo) {
  const { x, y, zoom } = imageComposition(photo)
  const position = `${+(x * 100).toFixed(2)}% ${+(y * 100).toFixed(2)}%`
  return { objectPosition: position, transformOrigin: position, transform: `scale(${zoom})` }
}

// Equivalent source crop of CSS cover + object-position + scale at the same origin.
// Used to verify editorial crops against the actual subjects in the photographs.
export function compositionCrop(width, height, targetAspect = 4 / 3, composition = DEFAULT_COMPOSITION) {
  if (![width, height, targetAspect].every(v => Number.isFinite(v) && v > 0)) return null
  const { x, y, zoom } = validComposition(composition) ? composition : DEFAULT_COMPOSITION
  const cropWidth = Math.min(width, height * targetAspect) / zoom
  const cropHeight = cropWidth / targetAspect
  return { x: (width - cropWidth) * x, y: (height - cropHeight) * y, width: cropWidth, height: cropHeight }
}
