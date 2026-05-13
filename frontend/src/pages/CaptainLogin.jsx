import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google'
import { BASE_URL } from '../config.js'
import { CaptainDataContext } from '../context/captainDataContext.js'

const CaptainLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setCaptainData } = useContext(CaptainDataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const baseUrl = BASE_URL
      const response = await axios.post(`${baseUrl}/captain/login`, { email, password })
      if (response.data?.token) {
        localStorage.setItem('captainToken', response.data.token)
      }
      if (response.data?.captain) {
        setCaptainData(response.data.captain)
      }
      navigate('/captain-home')
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setIsLoading(true)
    try {
      const response = await axios.post(`${BASE_URL}/captain/google-auth`, {
        token: credentialResponse.credential,
      })
      if (response.data?.token) {
        localStorage.setItem('captainToken', response.data.token)
      }
      if (response.data?.captain) {
        setCaptainData(response.data.captain)
      }
      navigate('/captain-home')
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Google login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-on-surface overflow-auto">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/30">
        <Link to="/">
          <img src="/velocity_logo.png" alt="Velocity" className="h-8" />
        </Link>
        <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-lg">person</span>
          Rider Login
        </Link>
      </nav>

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-container/20 border border-primary-container/40 px-3 py-1">
            <span className="material-symbols-outlined text-sm text-primary">local_taxi</span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Captain Portal</span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-on-surface">
            Captain Sign In
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">Access your fleet command dashboard</p>

          {error && (
            <div className="mt-6 rounded-md border border-error/30 bg-error-container px-4 py-3">
              <p className="text-sm font-medium text-on-error-container">
                {typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="captain@velocity.com"
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-2 focus:ring-primary-container transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
              <input
                type="password"
                autoComplete="current-password"
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
              {isLoading ? 'Signing in...' : 'Access Dashboard'}
              {!isLoading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-on-surface-variant">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            New captain?{' '}
            <Link to="/captain-signup" className="font-bold text-primary hover:underline">Register here</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default CaptainLogin
