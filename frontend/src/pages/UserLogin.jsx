import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const UserLogin = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
    const data = { email, password }
    console.log(data)
        setEmail('')
        setPassword('')
    }


  return (
    <main className="h-screen bg-neutral-200 px-6 py-6 text-black">
      <div className="mx-auto flex h-full w-full max-w-sm flex-col">
        <div className="self-start text-4xl font-semibold tracking-tight">Uber</div>

        <form onSubmit={(e) => handleSubmit(e)} className="mt-5 flex-1" >
          <label htmlFor="email" className="mb-2 block text-3xl font-medium">
            What's your email
          </label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            className="mb-7 w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-3 text-base text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password" className="mb-2 block text-3xl font-medium">
            Enter Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-7 w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-3 text-base text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-5 py-3 text-2xl font-semibold text-white transition hover:bg-neutral-800"
          >
            Login
          </button>

          <p className="mt-5 text-center text-xl text-black">
            New here?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Create new Account
            </Link>
          </p>
        </form>

        <Link
          to="/captain-login"
          className="mt-auto w-full rounded-xl bg-emerald-500 px-5 py-3 text-center text-2xl font-semibold text-white transition hover:bg-emerald-600"
        >
          Sign in as Captain
        </Link>
      </div>
    </main>
  )
}

export default UserLogin