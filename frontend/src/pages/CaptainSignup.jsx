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
    <main className="h-screen overflow-hidden bg-neutral-200 px-6 py-5 text-black">
      <div className="mx-auto flex h-full w-full max-w-sm flex-col">
        <div className="self-start text-4xl font-semibold tracking-tight leading-none">
          Uber
        </div>
        <div className="-mt-1 text-4xl leading-none">→</div>

        <form className="mt-5 flex-1" onSubmit={handleSubmit}>
          <label htmlFor="captainName" className="mb-2 block text-2xl font-medium">
            What's our Captain's name
          </label>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <input
              id="captainFirstName"
              type="text"
              placeholder="First name"
              required
              minLength={3}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            />
            <input
              id="captainLastName"
              type="text"
              placeholder="Last name"
              required
              minLength={3}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            />
          </div>

          <label htmlFor="captainEmail" className="mb-2 block text-2xl font-medium">
            What's our Captain's email
          </label>
          <input
            id="captainEmail"
            type="email"
            placeholder="email@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mb-5 w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
          />

          <label htmlFor="captainPassword" className="mb-2 block text-2xl font-medium">
            Enter Password
          </label>
          <input
            id="captainPassword"
            type="password"
            placeholder="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mb-5 w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
          />

          <label className="mb-2 block text-2xl font-medium">Vehicle Information</label>
          <div className="mb-5 grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Vehicle Color"
              required
              value={vehicleColor}
              onChange={(event) => setVehicleColor(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            />
            <input
              type="text"
              placeholder="Vehicle Plate"
              required
              value={vehiclePlate}
              onChange={(event) => setVehiclePlate(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Vehicle Capacity"
              required
              min={1}
              value={vehicleCapacity}
              onChange={(event) => setVehicleCapacity(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
            />
            <select
              required
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
              className="w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-500"
            >
              <option value="">Select Vehicle</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="bike">Bike</option>
            </select>
          </div>

          {errorMessage ? (
            <p className="mb-5 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-5 py-2.5 text-xl font-semibold text-white transition hover:bg-neutral-800"
          >
            Create Captain Account
          </button>

          <p className="mt-4 text-center text-base text-black">
            Already have a account?{' '}
            <Link to="/captain-login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </form>

        <p className="mt-auto pb-1 text-[10px] leading-4 text-neutral-700">
          This site is protected by reCAPTCHA and the{' '}
          <a href="#" className="underline">
            Google Privacy Policy
          </a>{' '}
          and{' '}
          <a href="#" className="underline">
            Terms of Service
          </a>{' '}
          apply.
        </p>
      </div>
    </main>
  )
}

export default CaptainSignup