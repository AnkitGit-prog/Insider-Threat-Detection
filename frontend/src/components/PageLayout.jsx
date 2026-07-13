// PageLayout.jsx – Shared layout wrapper for authenticated pages
import Navbar from './Navbar'

export default function PageLayout({ children, className = '' }) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] cyber-grid">
      <Navbar />
      {/* Explicit spacer to force content below the 80px (h-20) fixed navbar */}
      <div className="h-28 w-full shrink-0 pointer-events-none" />
      <main 
        className={`flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex flex-col ${className}`}
      >
        {children}
      </main>
    </div>
  )
}
