import React from 'react'
import { Link } from 'react-router-dom'
import { IoArrowForward } from 'react-icons/io5'

const Start = () => {
  return (
    <main className="bg-background text-on-background font-body-md text-body-md antialiased min-h-screen flex flex-col relative overflow-hidden">
      {/* Atmospheric Background Image with Gradient Overlays */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyUXT8C9atVY85KwgDsPQMNAJ9tOHrE_2xqsqb8QM38eCbdLSzop5oDagbq7G1rmjOaIM3I6-qnpDfOcFmKvKsbGLopi7oJjcJ-9gJcvs_G3yljx-dtR-6Lm5vaHuzgL3wptmlze5Z16R83SQjeeqYojuXbor7Q1vCl9FnwrnmxUzheeH1-iKoh7j2Y4akqEDzmpf-knqFi4CMlMalP0AWQhwxfkcfyiNbqmWTPCMEGXgZ_x2B5oEa6vMoiVQ_aZ4Uxgh1apA7fqP1')" }}
      />
      
      {/* Base Layer Obscuration / Vignette */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/60 to-background"></div>
      <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent to-[#050505]/80"></div>
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#050505]/70 backdrop-blur-3xl border-b border-white/10 shadow-2xl font-inter tracking-tight antialiased">
        <div className="text-xl font-black tracking-tighter text-white">
          VELOCITY
        </div>
      </header>
      
      {/* Main Content Canvas */}
      <section className="relative z-10 flex-grow flex items-center justify-center px-container-margin pt-[80px] pb-safe-area-bottom">
        {/* Central Glassmorphic Card */}
        <div className="bg-surface-variant/50 backdrop-blur-[30px] border border-white/10 p-[40px] rounded-[32px] max-w-xl w-full shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col items-center text-center relative overflow-hidden group">
          {/* Subtle Top Light Edge Reflection */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="mb-stack-md flex justify-center items-center w-16 h-16 rounded-full bg-primary-container/10 border border-primary-container/20">
            <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          </div>
          
          <h1 className="font-display-xl text-display-xl text-white mb-stack-md tracking-tight">
            Your Premium Journey Awaits.
          </h1>
          
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-[48px] max-w-md mx-auto">
            Step into a world of exclusive, high-tier logistics. Quiet, intentional, and perfectly orchestrated to your schedule.
          </p>
          
          <Link
            to="/login"
            className="bg-primary-container text-on-primary-container font-label-caps text-label-caps px-10 py-5 rounded-full shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            GET STARTED
            <IoArrowForward className="text-[18px]" />
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Start