import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/userDataContext.js'

const UserLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUserData } = useContext(UserDataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
      const response = await axios.post(`${baseUrl}/user/login`, { email, password })
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token)
      }
      if (response.data?.user) {
        setUserData(response.data.user)
      }
      navigate('/home')
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-on-surface overflow-auto">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/30">
        <Link to="/" >
          <img src="/velocity_logo.png" alt="Velocity" className="h-8" />
        </Link>
        <Link
          to="/captain-login"
          className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-lg">local_taxi</span>
          Captain Portal
        </Link>
      </nav>

      {/* Login Form */}
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Welcome Back</p>
            <h1 className="font-display text-4xl font-black tracking-tight text-on-surface">
              Sign In
            </h1>
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-error/30 bg-error-container px-4 py-3">
              <p className="text-sm font-medium text-on-error-container">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-2 focus:ring-primary-container transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-2 focus:ring-primary-container transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-on-surface text-surface py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-on-surface/90 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            New here?{' '}
            <Link to="/signup" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default UserLogin
