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
    <main className="h-screen bg-neutral-200 px-6 py-6 text-black">
      <div className="mx-auto flex h-full w-full max-w-sm flex-col">
        <div className="self-start text-4xl font-semibold tracking-tight">Uber</div>

        <form onSubmit={(e) => handleSubmit(e)} className="mt-5 flex-1">
          <label htmlFor="email" className="mb-2 block text-3xl font-medium">
            What's your email
          </label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
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
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-7 w-full rounded-xl border border-transparent bg-neutral-300 px-4 py-3 text-base text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-500"
          />

          {errorMessage ? (
            <p className="mb-5 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-5 py-3 text-2xl font-semibold text-white transition hover:bg-neutral-800"
          >
            Login
          </button>

          <p className="mt-5 text-center text-xl text-black">
            Join a fleet?{' '}
            <Link to="/captain-signup" className="text-blue-600 hover:underline">
              Register as a Captain
            </Link>
          </p>
        </form>

        <Link
          to="/signup"
          className="mt-auto w-full rounded-xl bg-orange-500 px-5 py-3 text-center text-2xl font-semibold text-white transition hover:bg-orange-600"
        >
          Sign in as User
        </Link>
      </div>
    </main>
  )
}

export default CaptainLogin