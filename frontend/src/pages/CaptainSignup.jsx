import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/captainDataContext.js'

const CaptainSignup = () => {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [vehicleColor, setVehicleColor] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleCapacity, setVehicleCapacity] = useState('')
  const [vehicleType, setVehicleType] = useState('car')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setCaptainData } = useContext(CaptainDataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
      const response = await axios.post(`${baseUrl}/captain/register`, {
        fullname: { firstname, lastname },
        email,
        password,
        vehicle: {
          color: vehicleColor,
          plate: vehiclePlate,
          capacity: Number(vehicleCapacity),
          vehicleType,
        },
      })
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token)
      }
      if (response.data?.captain) {
        setCaptainData(response.data.captain)
      }
      navigate('/captain-home')
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'Registration failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-2 focus:ring-primary-container transition-all"

  return (
    <main className="relative flex min-h-screen flex-col bg-background text-on-surface overflow-auto">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/30">
        <Link to="/" className="text-2xl font-extrabold tracking-tight font-display">
          Velocity<span className="text-primary">.</span>
        </Link>
        <Link to="/captain-login" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          Already a captain?
        </Link>
      </nav>

      <section className="flex-1 flex items-center justify-center px-6 py-12 overflow-auto">
        <div className="w-full max-w-lg">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-container/20 border border-primary-container/40 px-3 py-1">
            <span className="material-symbols-outlined text-sm text-primary">local_taxi</span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Captain Registration</span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-on-surface">
            Join the Fleet
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">Register as a captain and start earning</p>

          {error && (
            <div className="mt-6 rounded-md border border-error/30 bg-error-container px-4 py-3">
              <p className="text-sm font-medium text-on-error-container">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Personal Info */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 pb-2 border-b border-outline-variant/20">Personal Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">First Name</label>
                  <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required minLength={3} placeholder="John" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Last Name</label>
                  <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Doe" className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="captain@velocity.com" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minimum 6 characters" className={inputClass} />
            </div>

            {/* Vehicle Info */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 pb-2 border-b border-outline-variant/20">Vehicle Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Color</label>
                  <input type="text" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} required minLength={3} placeholder="White" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">License Plate</label>
                  <input type="text" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} required minLength={3} placeholder="KA-01-XX-1234" className={inputClass} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Capacity</label>
                <input type="number" value={vehicleCapacity} onChange={(e) => setVehicleCapacity(e.target.value)} required min={1} placeholder="4" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Vehicle Type</label>
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputClass}>
                  <option value="car">Car</option>
                  <option value="auto">Auto</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-on-surface text-surface py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-on-surface/90 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Registering...' : 'Register as Captain'}
              {!isLoading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Already registered?{' '}
            <Link to="/captain-login" className="font-bold text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default CaptainSignup