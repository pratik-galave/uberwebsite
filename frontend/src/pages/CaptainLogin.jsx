import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/captainDataContext.js'

const CaptainLogin = () => {
  const navigate = useNavigate()
  const { setCaptainData } = useContext(CaptainDataContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const normalizeCaptainData = (captain) => ({
    _id: captain?._id ?? '',
    email: captain?.email ?? '',
    firstname: captain?.fullname?.firstname ?? '',
    lastname: captain?.fullname?.lastname ?? '',
    vehicleColor: captain?.vehicle?.color ?? '',
    vehiclePlate: captain?.vehicle?.vehiclePlate ?? '',
    vehicleCapacity: captain?.vehicle?.capacity?.toString?.() ?? '',
    vehicleType: captain?.vehicle?.vehicleType ?? '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const data = { email: email.trim(), password }
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:4000'

    try {
      const loginResponse = await axios.post(`${baseUrl}/captain/login`, data)

      if (loginResponse.status === 200) {
        const token = loginResponse.data.token
        if (token) {
          localStorage.setItem('captainToken', token)
        }

        const profileResponse = await axios.get(`${baseUrl}/captain/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const captain = profileResponse?.data?.captain
        const normalizedCaptain = normalizeCaptainData(captain)
        setCaptainData(normalizedCaptain)
        localStorage.setItem('captainData', JSON.stringify(normalizedCaptain))

        navigate('/captain-home')
      }

      setEmail('')
      setPassword('')
    } catch (error) {
      const validationMessage = error?.response?.data?.errors?.[0]?.msg
      const apiMessage = error?.response?.data?.error
      setErrorMessage(validationMessage || apiMessage || 'Captain login failed. Please try again.')
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-hidden antialiased">
      {/* Abstract Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary-fixed/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-on-tertiary-container/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      {/* Main Content Container */}
      <main className="w-full max-w-[420px] px-container-margin z-10 flex flex-col gap-4">
        {/* Glassmorphic Login Card */}
        <div className="bg-surface-variant/40 backdrop-blur-[40px] border border-outline/20 rounded-xl p-stack-lg shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden flex-1 flex flex-col justify-between">
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary-fixed/20 to-transparent"></div>
          
          {/* Brand Header */}
          <div className="text-center mb-stack-lg">
            <h1 className="font-display-xl text-display-xl text-secondary-fixed tracking-tighter mb-stack-sm">CAPTAIN</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Sign in to your fleet account</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
            {/* Email Input */}
            <div className="flex flex-col gap-stack-sm">
              <label className="font-label-caps text-label-caps text-on-surface-variant pl-1 uppercase" htmlFor="email">Email</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-[20px] pointer-events-none">person</span>
                <input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg pl-12 pr-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors placeholder:text-on-surface-variant/40" 
                  placeholder="Enter your email" 
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="flex flex-col gap-stack-sm">
              <div className="flex justify-between items-center pl-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="password">Password</label>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-[20px] pointer-events-none">lock</span>
                <input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg pl-12 pr-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors placeholder:text-on-surface-variant/40" 
                  placeholder="Enter your password" 
                  required
                />
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-lg bg-error-container/20 border border-error-container px-3 py-2 text-sm text-error">
                {errorMessage}
              </p>
            ) : null}
            
            {/* Login Button */}
            <button 
              type="submit"
              className="w-full mt-stack-sm bg-gradient-to-r from-secondary-fixed to-[#00B8D4] text-on-primary-fixed font-label-caps text-label-caps py-4 rounded-lg shadow-[0_0_20px_rgba(98,255,150,0.25)] hover:shadow-[0_0_25px_rgba(98,255,150,0.4)] transition-all active:scale-[0.98] uppercase tracking-widest flex justify-center items-center gap-2"
            >
              Login as Captain
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>
          
          {/* Footer Link */}
          <div className="text-center mt-stack-lg">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Join a fleet?{' '}
              <Link to="/captain-signup" className="text-secondary-fixed font-medium hover:text-secondary-fixed-dim transition-colors">Register as a Captain</Link>
            </p>
          </div>
        </div>

        {/* User Login Link */}
        <div className="bg-surface-variant/40 backdrop-blur-[40px] border border-outline/20 rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 bg-surface-container-lowest/40 border border-outline/20 py-3 rounded-lg text-primary-container font-body-md text-body-md hover:bg-surface-container-lowest transition-colors backdrop-blur-md"
          >
            <span className="material-symbols-outlined">person</span>
            Sign in as User
          </Link>
        </div>
      </main>
    </div>
  )
}

export default CaptainLogin