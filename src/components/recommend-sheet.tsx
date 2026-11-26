import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { contact, profile } from '@/data/profile'

type OpenRecommend = (aboutTitle?: string) => void

const RecommendContext = createContext<OpenRecommend>(() => {})

/** Opens the "Recommend a book" sheet, optionally about a specific book. */
export const useRecommend = () => useContext(RecommendContext)

export function RecommendProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [aboutTitle, setAboutTitle] = useState<string | undefined>()
  const [copied, setCopied] = useState(false)

  const open = useCallback<OpenRecommend>((title) => {
    setAboutTitle(title)
    setCopied(false)
    dialogRef.current?.showModal()
  }, [])

  const close = () => dialogRef.current?.close()

  // Lock page scroll while the sheet is open.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const sync = () => document.documentElement.classList.toggle('sheet-open', dialog.open)
    const observer = new MutationObserver(sync)
    observer.observe(dialog, { attributes: true, attributeFilter: ['open'] })
    return () => observer.disconnect()
  }, [])

  const message = aboutTitle
    ? `Hi ${profile.firstName}! Since you're reading "${aboutTitle}", I think you'd like: `
    : `Hi ${profile.firstName}! A book for your shelf: `
  const text = encodeURIComponent(message)
  const subject = encodeURIComponent(
    aboutTitle ? `A book like ${aboutTitle}` : 'A book for The Reading Room',
  )

  const channels = [
    {
      name: 'Mail',
      detail: contact.email,
      href: `mailto:${contact.email}?subject=${subject}&body=${text}`,
      tint: 'linear-gradient(180deg, #1a9bfc, #0a6cf0)',
      icon: (
        <path d="M4 7.5 12 13l8-5.5M5.5 6h13A1.5 1.5 0 0 1 20 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-9A1.5 1.5 0 0 1 5.5 6Z" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      ),
    },
    {
      name: 'Messages',
      detail: 'Send a text',
      href: `sms:${contact.phone}?&body=${text}`,
      tint: 'linear-gradient(180deg, #5ff777, #12bf3c)',
      icon: (
        <path d="M12 5c4.4 0 8 2.9 8 6.5S16.4 18 12 18c-.8 0-1.6-.1-2.3-.3L6 19.3l1-2.9C5.2 15.2 4 13.4 4 11.5 4 7.9 7.6 5 12 5Z" fill="#fff" />
      ),
    },
    {
      name: 'WhatsApp',
      detail: 'Chat on WhatsApp',
      href: `https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${text}`,
      tint: '#25d366',
      icon: (
        <>
          <path d="M12 4.5a7.5 7.5 0 0 0-6.5 11.2L4.5 19.5l3.9-1A7.5 7.5 0 1 0 12 4.5Z" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9.6 8.6c.2-.3.5-.3.7 0l.6 1.3c.1.2 0 .4-.1.6l-.4.4c.4.9 1.2 1.7 2.1 2.1l.4-.4c.2-.2.4-.2.6-.1l1.3.6c.3.2.3.5 0 .8-.5.6-1.2.8-2 .5a6.3 6.3 0 0 1-3.6-3.6c-.3-.8-.1-1.6.4-2.2Z" fill="#fff" />
        </>
      ),
    },
    {
      name: 'X',
      detail: `@${contact.xUsername}`,
      // X has no public "DM this person" link; the profile has the Message button.
      href: `https://x.com/${contact.xUsername}`,
      tint: '#000',
      icon: (
        <path d="M6.5 6h3l2.9 4.1L16 6h1.6l-4.5 5.2 4.9 6.8h-3l-3.1-4.4L8 18H6.4l4.8-5.5L6.5 6Z" fill="#fff" />
      ),
    },
  ]

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked; the Mail row still works.
    }
  }

  return (
    <RecommendContext.Provider value={useMemo(() => open, [open])}>
      {children}
      <dialog
        ref={dialogRef}
        className="sheet"
        aria-labelledby="sheet-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <div className="sheet-panel">
          <span className="sheet-grabber" aria-hidden="true" />
          <header className="sheet-header">
            <h2 id="sheet-title">Recommend a book</h2>
            <p>
              {aboutTitle ? (
                <>Something like <em>{aboutTitle}</em>? Send it my way. I read every one.</>
              ) : (
                <>Send it whichever way is easiest. I read every one.</>
              )}
            </p>
            <button type="button" className="sheet-close" onClick={close} aria-label="Close">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 7 10 10M17 7 7 17" />
              </svg>
            </button>
          </header>

          <ul className="sheet-list">
            {channels.map((channel) => (
              <li key={channel.name}>
                <a
                  href={channel.href}
                  target={channel.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  onClick={() => window.setTimeout(close, 150)}
                >
                  <span className="sheet-icon" style={{ background: channel.tint }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">{channel.icon}</svg>
                  </span>
                  <span className="sheet-label">
                    <strong>{channel.name}</strong>
                    <span>{channel.detail}</span>
                  </span>
                  <svg className="sheet-chevron" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m10 7 5 5-5 5" />
                  </svg>
                </a>
                {channel.name === 'Mail' && (
                  <button type="button" className="sheet-copy" onClick={copyEmail}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </RecommendContext.Provider>
  )
}
