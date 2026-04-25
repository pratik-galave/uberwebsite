import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/captainDataContext.js'

const CaptainSignup = () => {
  const navigate = useNavigate()
  const { setCaptainData } = useContext(CaptainDataContext)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [vehicleColor, setVehicleColor] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleCapacity, setVehicleCapacity] = useState('')
  const [vehicleType, setVehicleType] = useState('')
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    const data = {
      fullname: {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
      },
      email: email.trim(),
      password,
      vehicle: {
        color: vehicleColor.trim(),
        vehiclePlate: vehiclePlate.trim(),
        capacity: Number(vehicleCapacity),
        vehicleType,
      },
    }
    const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:4000'

    try {
      const response = await axios.post(`${baseUrl}/captain/register`, data)

      if (response.status === 201) {
        const captain = response.data.captain
        const normalizedCaptain = normalizeCaptainData(captain)

        setCaptainData(normalizedCaptain)
        localStorage.setItem('captainData', JSON.stringify(normalizedCaptain))

        if (response.data.token) {
          localStorage.setItem('captainToken', response.data.token)
        }

        navigate('/captain-home')
      }

      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setVehicleColor('')
      setVehiclePlate('')
      setVehicleCapacity('')
      setVehicleType('')
    } catch (error) {
      const validationMessage = error?.response?.data?.errors?.[0]?.msg
      const apiMessage = error?.response?.data?.error
      setErrorMessage(validationMessage || apiMessage || 'Captain signup failed. Please try again.')
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-hidden antialiased py-6 h-screen overflow-y-auto hide-scrollbar">
      {/* Abstract Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary-fixed/10 blur-[120px] rounded-full pointer-events-none fixed"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-on-tertiary-container/5 blur-[150px] rounded-full pointer-events-none fixed"></div>
      
      {/* Main Content Container */}
      <main className="w-full max-w-[420px] px-container-margin z-10 flex flex-col gap-4 mt-auto mb-auto relative">
        {/* Glassmorphic Signup Card */}
        <div className="bg-surface-variant/40 backdrop-blur-[40px] border border-outline/20 rounded-xl p-stack-lg shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden flex-1 flex flex-col justify-between">
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary-fixed/20 to-transparent"></div>
          
          <div>
            {/* Brand Header */}
            <div className="text-center mb-stack-lg">
              <h1 className="font-display-xl text-display-xl text-secondary-fixed tracking-tighter mb-stack-sm">CAPTAIN</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Join our premium fleet</p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
              
              {/* Name Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-stack-sm">
                  <label className="font-label-caps text-label-caps text-on-surface-variant pl-1 uppercase" htmlFor="captainFirstName">First Name</label>
                  <input
                    id="captainFirstName"
                    type="text"
                    required
                    minLength={3}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors placeholder:text-on-surface-variant/40"
                    placeholder="First"
                  />
                </div>
                <div className="flex flex-col gap-stack-sm">
                  <label className="font-label-caps text-label-caps text-on-surface-variant pl-1 uppercase" htmlFor="captainLastName">Last Name</label>
                  <input
                    id="captainLastName"
                    type="text"
                    required
                    minLength={3}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors placeholder:text-on-surface-variant/40"
                    placeholder="Last"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-stack-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant pl-1 uppercase" htmlFor="captainEmail">Email</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-[20px] pointer-events-none">mail</span>
                  <input 
                    id="captainEmail" 
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg pl-12 pr-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors placeholder:text-on-surface-variant/40" 
                    placeholder="name@example.com" 
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="flex flex-col gap-stack-sm">
                <label className="font-label-caps text-label-caps text-on-surface-variant pl-1 uppercase" htmlFor="captainPassword">Password</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-[20px] pointer-events-none">lock</span>
                  <input 
                    id="captainPassword" 
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg pl-12 pr-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors placeholder:text-on-surface-variant/40" 
                    placeholder="Min 6 characters" 
                  />
                </div>
              </div>

              <div className="w-full h-px bg-outline/20 my-2"></div>

              {/* Vehicle Info */}
              <label className="font-label-caps text-label-caps text-secondary-fixed pl-1 uppercase mb-[-8px]">Vehicle Details</label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-stack-sm">
                  <input
                    type="text"
                    required
                    value={vehicleColor}
                    onChange={(event) => setVehicleColor(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors placeholder:text-on-surface-variant/40"
                    placeholder="Color"
                  />
                </div>
                <div className="flex flex-col gap-stack-sm">
                  <input
                    type="text"
                    required
                    value={vehiclePlate}
                    onChange={(event) => setVehiclePlate(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors placeholder:text-on-surface-variant/40 uppercase"
                    placeholder="Plate No."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-stack-sm">
                  <input
                    type="number"
                    required
                    min={1}
                    value={vehicleCapacity}
                    onChange={(event) => setVehicleCapacity(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors placeholder:text-on-surface-variant/40"
                    placeholder="Capacity"
                  />
                </div>
                <div className="flex flex-col gap-stack-sm">
                  <select
                    required
                    value={vehicleType}
                    onChange={(event) => setVehicleType(event.target.value)}
                    className="w-full bg-surface-container-lowest/60 border border-outline/30 rounded-lg px-4 py-3 text-on-surface font-body-md text-body-md focus:border-secondary-fixed focus:outline-none focus:ring-1 focus:ring-secondary-fixed transition-colors text-on-surface-variant/90 appearance-none"
                  >
                    <option value="" disabled>Type</option>
                    <option className="text-black" value="car">Car</option>
                    <option className="text-black" value="auto">Auto</option>
                    <option className="text-black" value="bike">Bike</option>
                  </select>
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
                className="w-full mt-stack-sm bg-gradient-to-r from-secondary-fixed to-[#00B8D4] text-on-primary-fixed font-label-caps text-label-caps py-4 rounded-lg shadow-[0_0_20px_rgba(98,255,150,0.25)] hover:shadow-[0_0_25px_rgba(98,255,150,0.4)] transition-all active:scale-[0.98] uppercase tracking-widest flex justify-center items-center gap-2"
              >
                Register as Captain
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
            
            {/* Footer Link */}
            <div className="text-center mt-stack-lg">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?{' '}
                <Link to="/captain-login" className="text-secondary-fixed font-medium hover:text-secondary-fixed-dim transition-colors">Login here</Link>
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

export default CaptainSignup