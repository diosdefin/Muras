import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { REGIONS, polygons, validateBoundaries, validateMapGeometry, validateRegionalEvidence } from '../src/data/geography/model.js'

export const BOUNDARY_SHA256 = 'b2161137ec372230b04f7b755b3d4fd50f3a6c6197f82bebc2301fb3b0222036'
export const BOUNDARY_URL = 'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/KGZ/ADM1/geoBoundaries-KGZ-ADM1_simplified.geojson'

// A local, deterministic equirectangular display projection, adjusted at mid-latitude.
// Every polygon and interior ring comes from the pinned official simplified file.
export function projectBoundaries(geojson, metadata) {
  const errors = validateBoundaries(geojson)
  if (errors.length) throw new Error(errors.join('\n'))
  const points = geojson.features.flatMap(f => polygons(f.geometry).flat(2))
  const xs = points.map(p => p[0]), ys = points.map(p => p[1])
  const west = Math.min(...xs), east = Math.max(...xs), south = Math.min(...ys), north = Math.max(...ys)
  const cosine = Math.cos((south + north) / 2 * Math.PI / 180)
  const scale = 960 / ((east - west) * cosine)
  const project = ([lon, lat]) => [(lon - west) * cosine * scale + 20, (north - lat) * scale + 20].map(v => +v.toFixed(2))
  const regions = REGIONS.map(region => {
    const feature = geojson.features.find(f => f.properties.shapeISO === region.iso)
    const path = polygons(feature.geometry).flatMap(rings => rings.map(ring => ring.slice(0, -1).map((p, i) => `${i ? 'L' : 'M'}${project(p).join(',')}`).join('') + 'Z')).join('')
    return { id: region.id, name: region.name, path }
  })
  return {
    schemaVersion: 1,
    viewBox: [0, 0, 1000, +((north - south) * scale + 40).toFixed(2)],
    projection: 'Equirectangular; cosine correction at mid-latitude; SVG coordinates rounded to 0.01 units',
    provenance: { boundaryId: metadata.boundaryID, yearRepresented: metadata.boundaryYearRepresented,
      sourceUpdatedAt: metadata.sourceDataUpdateDate, builtAt: metadata.buildDate, retrievedAt: '2026-10-12',
      sourceUrl: BOUNDARY_URL, sha256: BOUNDARY_SHA256, license: 'ODbL-1.0',
      licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/', attribution: 'geoBoundaries · OpenStreetMap contributors · Wambacher' },
    regions,
  }
}

export async function prepareMap(root, species) {
  try {
    const [bytes, meta, evidence, license] = await Promise.all([
      readFile(resolve(root, 'data/geography/source/regions.geojson')),
      readFile(resolve(root, 'data/geography/source/metadata.json'), 'utf8'),
      readFile(resolve(root, 'data/geography/occurrences.source.json'), 'utf8'),
      readFile(resolve(root, 'data/geography/source/ODbL-1.0.txt'), 'utf8'),
    ])
    if (createHash('sha256').update(bytes).digest('hex') !== BOUNDARY_SHA256) throw new Error('Контрольная сумма границ не совпадает с проверенным набором.')
    const metadata = JSON.parse(meta)
    if (metadata.boundaryID !== 'KGZ-ADM1-38789647' || metadata.boundaryType !== 'ADM1' || metadata.boundaryISO !== 'KGZ' || metadata.admUnitCount !== '7' || metadata.boundaryYearRepresented !== '2017' || metadata.boundaryLicense !== 'Open Data Commons Open Database License 1.0' || metadata.simplifiedGeometryGeoJSON !== BOUNDARY_URL) throw new Error('Изменены происхождение, дата или лицензия проверенных границ.')
    if (!license.includes('ODC Open Database License (ODbL)')) throw new Error('Отсутствует полный текст ODbL.')
    const geojson = JSON.parse(bytes.toString('utf8'))
    const occurrences = JSON.parse(evidence)
    const errors = validateRegionalEvidence(occurrences, species)
    if (errors.length) throw new Error(errors.join('\n'))
    const geometry = projectBoundaries(geojson, metadata)
    const geometryErrors = validateMapGeometry(geometry)
    if (geometryErrors.length) throw new Error(geometryErrors.join('\n'))
    const publicGeojson = { ...geojson, attribution: geometry.provenance.attribution, license: geometry.provenance.licenseUrl, source: BOUNDARY_URL }
    const payloads = new Map([
      ['public/data/geography/map.json', JSON.stringify(geometry) + '\n'],
      ['public/data/geography/occurrences.json', JSON.stringify(occurrences, null, 2) + '\n'],
      ['public/data/geography/regions.geojson', JSON.stringify(publicGeojson) + '\n'],
      ['public/data/geography/metadata.json', JSON.stringify(metadata, null, 2) + '\n'],
      ['public/data/geography/ODbL-1.0.txt', license.replace(/\r\n/g, '\n')],
    ])
    return { geometry, occurrences, payloads }
  } catch (error) { throw new Error(`Некорректные данные карты: ${error.message}`) }
}

export async function publishMap(root, prepared, { check = false, validateOnly = false } = {}) {
  if (validateOnly) return
  for (const [file, payload] of prepared.payloads) {
    const path = resolve(root, file)
    if (check) {
      let actual
      try { actual = await readFile(path, 'utf8') } catch { actual = null }
      if (actual?.replace(/\r\n/g, '\n') !== payload) throw new Error(`${file}: отсутствует или устарел. Выполните npm run data`)
    } else {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, payload, 'utf8')
    }
  }
}
