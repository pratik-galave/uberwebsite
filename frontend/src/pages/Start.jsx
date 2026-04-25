import React from 'react'
import { Link } from 'react-router-dom'

const Start = () => {
  return (
    <main className="relative flex min-h-screen flex-col bg-background text-on-surface overflow-auto">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/30">
        <span className="text-2xl font-extrabold tracking-tight font-display">
          Velocity<span className="text-primary">.</span>
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
          <a href="#" className="hover:text-on-surface transition-colors">Product</a>
          <a href="#" className="hover:text-on-surface transition-colors">Safety</a>
          <a href="#" className="hover:text-on-surface transition-colors">Fleet</a>
        </div>
        <Link
          to="/login"
          className="rounded-md bg-on-surface text-surface px-5 py-2.5 text-sm font-bold tracking-wide hover:bg-on-surface/90 transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="mb-6">
          <span className="inline-block rounded-full border border-outline-variant/40 bg-surface-container-low px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Next-Gen Mobility
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-on-surface max-w-4xl">
          Move with
          <br />
          <span className="text-primary">Precision</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-on-surface-variant leading-relaxed">
          The high-performance mobility platform engineered for speed,
          reliability, and total control. Connect to the grid.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-md bg-on-surface text-surface px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-on-surface/90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            Ride Now
          </Link>
          <Link
            to="/captain-login"
            className="flex items-center gap-2 rounded-md border border-on-surface/20 bg-surface text-on-surface px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-lg">local_taxi</span>
            Drive with Us
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <footer className="border-t border-outline-variant/30 px-8 py-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
          <div>
            <p className="text-2xl font-extrabold font-display tracking-tight text-on-surface">50M+</p>
            <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant mt-1">Active Riders</p>
          </div>
          <div className="w-px h-8 bg-outline-variant/30 hidden md:block" />
          <div>
            <p className="text-2xl font-extrabold font-display tracking-tight text-on-surface">200+</p>
            <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant mt-1">Cities</p>
          </div>
          <div className="w-px h-8 bg-outline-variant/30 hidden md:block" />
          <div>
            <p className="text-2xl font-extrabold font-display tracking-tight text-on-surface">99.9%</p>
            <p className="text-xs font-medium uppercase tracking-widest text-on-surface-variant mt-1">Uptime</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Start