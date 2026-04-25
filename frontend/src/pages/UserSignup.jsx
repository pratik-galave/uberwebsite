import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/userDataContext.js'

const UserSignup = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate()

  const { setUserData } = useContext(UserDataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (firstName.trim().length < 3 || lastName.trim().length < 3) {
      setErrorMessage('First name and last name must be at least 3 characters long.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    const data = {
      firstname: firstName.trim(),
      lastname: lastName.trim(),
      email: email.trim(),
      password,
    }
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

    try {
      const response = await axios.post(`${baseUrl}/user/register`, data)

      if(response.status === 201){
        const responseData = response.data
        setUserData(responseData.user)
        localStorage.setItem('token', responseData.token)
        navigate('/home')
      }

      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
    } catch (error) {
      const validationMessage = error?.response?.data?.errors?.[0]?.msg
      const apiMessage = error?.response?.data?.error
      setErrorMessage(validationMessage || apiMessage || 'Signup failed. Please check your details and try again.')
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-hidden antialiased py-6">
      {/* Abstract Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-on-tertiary-container/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      {/* Main Content Container */}
      <main className="w-full max-w-[420px] px-container-margin z-10 flex flex-col gap-4">
        {/* Glassmorphic Signup Card */}
        <div className="bg-surface-variant/40 backdrop-blur-[40px] border border-outline/20 rounded-xl p-stack-lg shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden flex-1 flex flex-col justify-between">
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div>
            {/* Brand Header */}
            <div className="text-center mb-stack-lg">
              <h1 className="font-display-xl text-display-xl text-primary-container tracking-tighter mb-stack-sm">VELOCITY</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Create your account</p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
              
              {/* Name Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-stack-sm">
                  <label className="font-label-caps text-label-caps text-on-surface-variant pl-1 uppercase" htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    minLength={3}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-on-surface-variant/40"
                    placeholder="First"
                  />
                </div>
                <div className="flex flex-col gap-stack-sm">
                  <label className="font-label-caps text-label-caps text-on-surface-variant pl-1 uppercase" htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    minLength={3}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-on-surface-variant/40"
                    placeholder="Last"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-stack-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant pl-1 uppercase" htmlFor="email">Email</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-[20px] pointer-events-none">mail</span>
                  <input 
                    id="email" 
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg pl-12 pr-4 py-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-on-surface-variant/40" 
                    placeholder="name@example.com" 
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="flex flex-col gap-stack-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant pl-1 uppercase" htmlFor="password">Password</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-[20px] pointer-events-none">lock</span>
                  <input 
                    id="password" 
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg pl-12 pr-4 py-3 text-on-surface font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-on-surface-variant/40" 
                    placeholder="Min 6 characters" 
                  />
                </div>
              </div>
              
              {errorMessage ? (
                <p className="rounded-lg bg-error-container/20 border border-error-container px-3 py-2 text-sm text-error">
                  {errorMessage}
                </p>
              ) : null}

              {/* Signup Button */}
              <button 
                type="submit"
                className="w-full mt-stack-sm bg-gradient-to-r from-primary-container to-[#00B8D4] text-on-primary-fixed font-label-caps text-label-caps py-4 rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all active:scale-[0.98] uppercase tracking-widest flex justify-center items-center gap-2"
              >
                Create Account
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
            
            {/* Footer Link */}
            <div className="text-center mt-stack-lg">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-container font-medium hover:text-primary transition-colors">Login here</Link>
              </p>
            </div>
          </div>
          
          <p className="mt-6 text-center text-[10px] leading-4 text-on-surface-variant/50">
            This site is protected by reCAPTCHA and the{' '}
            <a href="#" className="underline hover:text-on-surface-variant transition-colors">
              Google Privacy Policy
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-on-surface-variant transition-colors">
              Terms of Service
            </a>{' '}
            apply.
          </p>
        </div>
      </main>
    </div>
  )
}

export default UserSignup