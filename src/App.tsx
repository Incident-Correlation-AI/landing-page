import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Navbar from './components/Navbar'
import { FinalCta, Footer, Hero, HowItWorks, NotDoing, Principles, Problem, WhyItMatters } from './components/Sections'
import LoginPage from './LoginPage'
import DashboardPage from './DashboardPage'
import ReservedRoute from './ReservedRoute'

const ParticleBackground = lazy(() => import('./components/ParticleBackground'))

function WindowChrome() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-between border-b border-dim bg-bg px-4 font-mono text-xs text-dim sm:text-sm">
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 border border-dim" />
        <span className="inline-block h-3 w-3 border border-dim" />
        <span className="inline-block h-3 w-3 border border-dim" />
      </div>
      <span className="text-ink">lad@hackathon: ~</span>
      <span>zsh · utf-8</span>
    </div>
  )
}

function Landing() {
  return (
    <div className="relative min-h-screen text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>
      <WindowChrome />
      <Navbar />
      <main id="main" tabIndex={-1} className="relative z-10 pt-[calc(2rem+4rem)] outline-none">
        <Hero />
        <Problem />
        <WhyItMatters />
        <HowItWorks />
        <Principles />
        <NotDoing />
        <FinalCta />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<ReservedRoute title="Page not found" note="This address is not part of the site." />} />
      </Routes>
    </AuthProvider>
  )
}
