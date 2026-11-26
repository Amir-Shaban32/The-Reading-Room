import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { books, type LibraryBook } from '@/data/books'
import { useMediaQuery } from '@/lib/router'
import { useRecommend } from './recommend-sheet'

const NewsletterBookshelf = lazy(async () => {
  const module = await import('./ui/newsletter-bookshelf')
  return { default: module.NewsletterBookshelf }
})

const filters = [
  { id: 'all', label: 'All' },
  { id: 'Currently reading', label: 'Reading' },
  { id: 'Read', label: 'Read' },
] as const
type FilterId = (typeof filters)[number]['id']

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

const shelfItems = books.map((book) => ({ ...book, date: String(book.year), subtitle: book.author }))

export function Library() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const wide = useMediaQuery('(min-width: 820px)')
  const recommend = useRecommend()

  const normalizedQuery = query.trim().toLocaleLowerCase()
  const focusedBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          (filter === 'all' || book.status === filter) &&
          (!normalizedQuery ||
            `${book.title} ${book.author} ${book.edition} ${book.year}`
              .toLocaleLowerCase()
              .includes(normalizedQuery)),
      ),
    [filter, normalizedQuery],
  )
  const dimmedIds = useMemo(() => {
    const focused = new Set(focusedBooks.map((book) => book.id))
    return new Set(books.filter((book) => !focused.has(book.id)).map((book) => book.id))
  }, [focusedBooks])

  const selectedBook = focusedBooks.find((book) => book.id === selectedId)
  const selectedIndex = selectedBook ? focusedBooks.indexOf(selectedBook) : -1

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (document.querySelector('dialog[open]')) return
      const target = event.target as HTMLElement
      const typing = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      if ((event.key === '/' && !typing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      } else if (event.key === 'Escape' && !typing) {
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function step(direction: -1 | 1) {
    if (selectedIndex < 0 || focusedBooks.length < 2) return
    const next = (selectedIndex + direction + focusedBooks.length) % focusedBooks.length
    setSelectedId(focusedBooks[next]!.id)
  }

  const counts = {
    all: books.length,
    'Currently reading': books.filter((b) => b.status === 'Currently reading').length,
    Read: books.filter((b) => b.status === 'Read').length,
  }

  return (
    <section className="library reveal" id="shelf" aria-label="My bookshelf">
      <div className="toolbar">
        <div className="search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 4.5 4.5" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            aria-label="Search books"
            placeholder="Search"
            value={query}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedId(null)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setQuery('')
                event.currentTarget.blur()
              }
            }}
          />
          {query ? (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery('')
                searchRef.current?.focus()
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="m9.5 9.5 5 5m0-5-5 5" />
              </svg>
            </button>
          ) : (
            <kbd className="search-key" aria-hidden="true">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          )}
        </div>

        <Segmented
          value={filter}
          onChange={(next) => {
            setFilter(next)
            setSelectedId(null)
          }}
          counts={counts}
        />
      </div>

      <div className="stage">
        <Suspense fallback={<div className="stage-placeholder" aria-hidden="true" />}>
          <NewsletterBookshelf
            items={shelfItems}
            value={selectedBook?.id ?? null}
            onValueChange={setSelectedId}
            dimmedIds={dimmedIds}
            focusOffset={wide ? 0.2 : 0}
            height={wide ? 540 : 440}
          />
        </Suspense>

        {focusedBooks.length === 0 && (
          <div className="stage-empty" role="status">
            <p>No books match “{query.trim()}”.</p>
            <button type="button" className="link" onClick={() => setQuery('')}>
              Clear search
            </button>
          </div>
        )}

        {selectedBook && (
          <BookDetails
            key={selectedBook.id}
            book={selectedBook}
            position={`${selectedIndex + 1} of ${focusedBooks.length}`}
            onStep={focusedBooks.length > 1 ? step : undefined}
            onClose={() => setSelectedId(null)}
            onRecommend={() => recommend(selectedBook.title)}
          />
        )}
      </div>

      <p className="stage-hint" aria-live="polite">
        {selectedBook
          ? 'Drag to turn the book. Press Esc to put it back.'
          : 'Choose a book to take it off the shelf. Drag to browse.'}
      </p>
    </section>
  )
}

function Segmented({
  value,
  onChange,
  counts,
}: {
  value: FilterId
  onChange: (value: FilterId) => void
  counts: Record<FilterId, number>
}) {
  const groupRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLSpanElement>(null)

  // The white thumb slides between segments, like a native segmented control.
  useLayoutEffect(() => {
    const place = () => {
      const active = groupRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      const thumb = thumbRef.current
      if (!active || !thumb) return
      thumb.style.width = `${active.offsetWidth}px`
      thumb.style.transform = `translateX(${active.offsetLeft}px)`
    }
    place()
    const observer = new ResizeObserver(place)
    if (groupRef.current) observer.observe(groupRef.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={groupRef} className="segmented" role="group" aria-label="Show books">
      <span ref={thumbRef} className="segmented-thumb" aria-hidden="true" />
      {filters.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
        >
          {item.label}
          <span className="segmented-count">{counts[item.id]}</span>
        </button>
      ))}
    </div>
  )
}

function BookDetails({
  book,
  position,
  onStep,
  onClose,
  onRecommend,
}: {
  book: LibraryBook
  position: string
  onStep?: (direction: -1 | 1) => void
  onClose: () => void
  onRecommend: () => void
}) {
  const reading = book.status === 'Currently reading'
  return (
    <aside className="details" aria-live="polite" aria-label={`${book.title} details`}>
      <button type="button" className="icon-button details-close" onClick={onClose} aria-label="Put the book back">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 7 10 10M17 7 7 17" />
        </svg>
      </button>

      <p className={`details-status${reading ? ' is-reading' : ''}`}>{book.status}</p>
      <h2>{book.title}</h2>
      <p className="details-author">{book.author}</p>

      <dl className="details-facts">
        <div>
          <dt>Edition</dt>
          <dd>{book.edition}</dd>
        </div>
        <div>
          <dt>Length</dt>
          <dd>{book.pages.toLocaleString()} pages</dd>
        </div>
        <div>
          <dt>Published</dt>
          <dd>{book.year}</dd>
        </div>
        {book.finishedDate && (
          <div>
            <dt>Finished</dt>
            <dd>{book.finishedDate}</dd>
          </div>
        )}
      </dl>

      {book.note && <p className="details-note">{book.note}</p>}

      <div className="details-actions">
        <button type="button" className="link" onClick={onRecommend}>
          Recommend something like this <span aria-hidden="true">›</span>
        </button>
        {onStep && (
          <div className="details-nav">
            <button type="button" className="icon-button" onClick={() => onStep(-1)} aria-label="Previous book">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14 7-5 5 5 5" />
              </svg>
            </button>
            <span>{position}</span>
            <button type="button" className="icon-button" onClick={() => onStep(1)} aria-label="Next book">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m10 7 5 5-5 5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
