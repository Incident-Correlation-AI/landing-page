import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../AuthContext'

const links = [
  { href: '#problem', label: 'problem' },
  { href: '#how', label: 'how-it-works' },
  { href: '#principles', label: 'principles' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, dashboardUrl, logout } = useAuth()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-8 z-40 border-b border-dim bg-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
        <Link to="/" className="flex min-w-0 items-center gap-2 font-mono text-base font-medium text-accent sm:text-lg" aria-label="lad, home">
          <span>&gt;_</span>
          <span className="text-ink">lad</span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex" aria-label="Page">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-base text-dim transition-colors duration-150 hover:text-ink px-3 py-1.5"
            >
              [{l.label}]
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <a
                href={dashboardUrl}
                className="inline-flex h-10 items-center justify-center border border-accent bg-accent px-5 font-mono text-base font-medium text-on-accent transition-colors duration-150 hover:bg-accent-hover"
              >
                [ dashboard ]
              </a>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex h-10 items-center justify-center border border-dim px-4 font-mono text-sm font-medium text-dim transition-colors duration-150 hover:border-accent hover:text-accent"
              >
                [ log out ]
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center border border-accent bg-accent px-5 font-mono text-base font-medium text-on-accent transition-colors duration-150 hover:bg-accent-hover"
            >
              [ log in ]
            </Link>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-dim text-ink md:hidden"
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
      <nav id="nav-menu" aria-label="Page" className={`${open ? 'block' : 'hidden'} border-t border-dim bg-bg md:hidden`}>
        <ul className="mx-auto flex max-w-6xl flex-col px-5 py-3 font-mono">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="block py-3 text-base text-dim hover:text-ink" onClick={() => setOpen(false)}>
                [{l.label}]
              </a>
            </li>
          ))}
          {user ? (
            <>
              <li>
                <a href={dashboardUrl} className="block py-3 text-base text-accent" onClick={() => setOpen(false)}>
                  [ dashboard ]
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                  className="block py-3 text-base text-dim hover:text-accent"
                >
                  [ log out ]
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="block py-3 text-base text-accent" onClick={() => setOpen(false)}>
                [ log in ]
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}
