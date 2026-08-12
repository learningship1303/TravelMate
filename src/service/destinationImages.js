import { useEffect, useState } from 'react'
import { GetPlaceDetails } from './GlobalApi'

const CACHE_PREFIX = 'tm_img_cache_v1:'
const memoryCache = new Map()

function cacheKey(query) {
  return query.trim().toLowerCase()
}

function readCache(key) {
  if (memoryCache.has(key)) return memoryCache.get(key)
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (raw) {
      const parsed = JSON.parse(raw)
      memoryCache.set(key, parsed)
      return parsed
    }
  } catch {
    // ignore malformed cache entries
  }
  return null
}

function writeCache(key, value) {
  memoryCache.set(key, value)
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value))
  } catch {
    // storage full/unavailable, memory cache still works for this session
  }
}

async function fetchWikimediaImages(query, limit) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: String(limit * 2),
    gsrnamespace: '6',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '1200',
    format: 'json',
    origin: '*',
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`)
  if (!res.ok) throw new Error('Wikimedia request failed')
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) return []
  return Object.values(pages)
    .map((page) => page.imageinfo?.[0])
    .filter((info) => info && /\.(jpe?g|png)$/i.test(info.url))
    .map((info) => info.thumburl || info.url)
    .slice(0, limit)
}

async function fetchGooglePlacePhotos(query, limit) {
  const res = await GetPlaceDetails({ textQuery: query })
  const photoUrls = res?.data?.photoUrls || []
  return photoUrls.slice(0, limit)
}

export async function getDestinationImages(query, count = 6) {
  const key = cacheKey(query || '')
  if (!key) return []

  const cached = readCache(key)
  if (cached && cached.length) return cached

  let images = []
  try {
    images = await fetchWikimediaImages(key, count)
  } catch {
    images = []
  }

  if (images.length < count) {
    try {
      const extra = await fetchGooglePlacePhotos(key, count - images.length)
      images = [...images, ...extra]
    } catch {
      // fall through with whatever Wikimedia returned
    }
  }

  if (images.length) writeCache(key, images)
  return images
}

export function useDestinationImages(query, count = 6) {
  const [state, setState] = useState({ images: [], loading: Boolean(query), error: null })

  useEffect(() => {
    if (!query) {
      setState({ images: [], loading: false, error: null })
      return undefined
    }
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))
    getDestinationImages(query, count)
      .then((images) => {
        if (!cancelled) setState({ images, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ images: [], loading: false, error })
      })
    return () => {
      cancelled = true
    }
  }, [query, count])

  return state
}
