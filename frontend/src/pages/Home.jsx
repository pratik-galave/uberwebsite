import React from 'react'
import { Link } from 'react-router-dom'
import bgImage from '../assets/image.png'


const Home = () => {
  return (
    <main className="h-screen w-full overflow-hidden bg-neutral-100">
      <section
        className="relative h-[78vh] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
      </section>

      <section className="flex h-[22vh] w-full flex-col justify-between bg-white px-6 pb-6 pt-5 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-950">
          Get started with Uber
        </h1>

        <Link
          to="/login"
          className="flex w-full items-center justify-center rounded-xl bg-black px-5 py-4 text-xl font-medium text-white transition hover:bg-neutral-800"
        >
          <span>Continue</span>
          <span className="ml-3 text-2xl leading-none">&rarr;</span>
        </Link>
      </section>
    </main>
  )
}

export default Home