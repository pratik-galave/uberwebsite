import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/userDataContext.js'

const UserLogin = () => {
    const navigate = useNavigate()
    const { setUserData } = useContext(UserDataContext)
    
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = { email, password }
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

        try {
            const response = await axios.post(`${baseUrl}/user/login`, data)
            if (response.status === 200) {
                const { user, token } = response.data
                setUserData(user)
                localStorage.setItem('token', token)
                navigate('/home')
            }
        } catch (error) {
            console.error('Login error:', error)
        }

        setEmail('')
        setPassword('')
    }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-hidden antialiased">
      {/* Abstract Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-on-tertiary-container/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      {/* Main Content Container */}
      <main className="w-full max-w-[420px] px-container-margin z-10 flex flex-col gap-4">
        {/* Glassmorphic Login Card */}
        <div className="bg-surface-variant/40 backdrop-blur-[40px] border border-outline/20 rounded-xl p-stack-lg shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          {/* Brand Header */}
          <div className="text-center mb-stack-lg">
            <h1 className="font-display-xl text-display-xl text-primary-container tracking-tighter mb-stack-sm">VELOCITY</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Sign in to your account</p>
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
                  className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg pl-12 pr-4 py-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-on-surface-variant/40" 
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
                  className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg pl-12 pr-4 py-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-on-surface-variant/40" 
                  placeholder="Enter your password" 
                  required
                />
              </div>
            </div>
            
            {/* Login Button */}
            <button 
              type="submit"
              className="w-full mt-stack-sm bg-gradient-to-r from-primary-container to-[#00B8D4] text-on-primary-fixed font-label-caps text-label-caps py-4 rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all active:scale-[0.98] uppercase tracking-widest flex justify-center items-center gap-2"
            >
              Login
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>
          
          {/* Footer Link */}
          <div className="text-center mt-stack-lg">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-container font-medium hover:text-primary transition-colors">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Captain Login Link */}
        <div className="bg-surface-variant/40 backdrop-blur-[40px] border border-outline/20 rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <Link
            to="/captain-login"
            className="w-full flex items-center justify-center gap-2 bg-surface-container-lowest/40 border border-outline/20 py-3 rounded-lg text-secondary-fixed font-body-md text-body-md hover:bg-surface-container-lowest transition-colors backdrop-blur-md"
          >
            <span className="material-symbols-outlined">local_taxi</span>
            Sign in as Captain
          </Link>
        </div>
      </main>
    </div>
  )
}

export default UserLogin