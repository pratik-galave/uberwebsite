import React from 'react'
import { IoCallOutline, IoChatbubbleEllipsesOutline, IoCloseOutline } from 'react-icons/io5'

const CustomerInfoPanel = ({
  customerName,
  fare,
  distance,
  pickup,
  dropoff,
  note,
  otpValue,
  verificationStatus,
  onOtpChange,
  onVerifyOtp,
  onClose,
  onConfirm,
}) => {
  const isVerifying = verificationStatus === 'pending'
  const isVerified = verificationStatus === 'success'
  const isInvalidOtp = verificationStatus === 'failed'

  return (
    <section className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.24)]">
      <div className="px-4 pb-5 pt-4">
        <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-3">
          <p className="text-2xl font-semibold tracking-tight text-black">Customer Info</p>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-800 transition hover:bg-neutral-200"
            aria-label="Close customer info"
          >
            <IoCloseOutline className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold leading-tight text-black">{customerName}</p>
            <p className="mt-1 text-sm text-neutral-500">Ride confirmed</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-black">{fare}</p>
            <p className="text-sm text-neutral-500">{distance}</p>
          </div>
        </div>

        <div className="mt-4 space-y-4 rounded-2xl border border-neutral-200 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Pick up</p>
            <p className="mt-1 text-[1.2rem] font-medium text-black">{pickup}</p>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Drop off</p>
            <p className="mt-1 text-[1.2rem] font-medium text-black">{dropoff}</p>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Note</p>
            <p className="mt-1 text-base leading-snug text-neutral-700">{note}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-300 text-lg font-semibold text-emerald-900"
          >
            <IoCallOutline className="h-5 w-5" />
            Call
          </button>

          <button
            type="button"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-lg font-semibold text-white"
          >
            <IoChatbubbleEllipsesOutline className="h-5 w-5" />
            Message
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl bg-neutral-200 text-lg font-medium text-neutral-600"
          >
            Cancel
          </button>
        </div>

        <div className="mt-3">
          <label htmlFor="ride-otp" className="mb-1 block text-sm font-medium text-neutral-600">
            Enter OTP
          </label>
          <input
            id="ride-otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otpValue}
            onChange={(event) => onOtpChange?.(event.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-black outline-none placeholder:text-neutral-400 focus:border-amber-400"
          />

          <button
            type="button"
            onClick={onVerifyOtp}
            className="mt-3 h-11 w-full rounded-xl bg-black text-base font-semibold text-white transition hover:bg-neutral-800"
          >
            {isVerifying ? 'Verifying OTP...' : 'Verify OTP With User'}
          </button>

          {isVerified ? (
            <p className="mt-2 text-sm font-medium text-emerald-700">OTP verified successfully.</p>
          ) : null}

          {isInvalidOtp ? (
            <p className="mt-2 text-sm font-medium text-red-600">OTP does not match user OTP.</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!isVerified}
          className="mt-3 h-12 w-full rounded-xl bg-amber-400 text-lg font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
        >
          Confirm
        </button>
      </div>
    </section>
  )
}

export default CustomerInfoPanel