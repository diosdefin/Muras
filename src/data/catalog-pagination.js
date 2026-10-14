export const CATALOG_PAGE_SIZE = 24

export function paginateCatalog(results, number = 1, size = CATALOG_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(results.length / size))
  const current = Number.isFinite(number) ? Math.min(totalPages, Math.max(1, Math.floor(number))) : 1
  return { entries: results.slice((current - 1) * size, current * size), current, totalPages, total: results.length }
}

// One page on either side, with endpoints and compact ellipses for large catalogues.
export function pageNumbers(current, totalPages) {
  const pages = new Set([1, totalPages, current - 1, current, current + 1].filter(value => value >= 1 && value <= totalPages))
  const ordered = [...pages].sort((a, b) => a - b)
  const result = []
  ordered.forEach((page, index) => {
    if (index && page - ordered[index - 1] > 1) result.push('…')
    result.push(page)
  })
  return result
}
