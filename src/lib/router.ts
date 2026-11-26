import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

export type Route = 'home' | 'about'

const routeFromHash = (): Route => (window.location.hash === '#/about' ? 'about' : 'home')

/**
 * Two pages, hash-routed so the site works on any static host.
 * Page changes cross-fade with the View Transitions API where supported.
 */
export function useRoute() {
  const [route, setRoute] = useState<Route>(routeFromHash)

  useEffect(() => {
    let current = routeFromHash()
    const onHashChange = () => {
      const next = routeFromHash()
      // In-page anchors (e.g. #shelf) scroll themselves.
      if (next === current && !window.location.hash.startsWith('#/')) return
      current = next
      const commit = () => {
        flushSync(() => setRoute(next))
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (document.startViewTransition && !reduce) document.startViewTransition(commit)
      else commit()
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}
