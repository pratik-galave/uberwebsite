import React from 'react'

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
    <section className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-surface-variant/40 border border-outline/20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[40px] overflow-hidden">
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="px-container-margin pb-6 pt-5">
        <div className="mb-stack-md flex items-center justify-between border-b border-outline/10 pb-4">
          <div className="flex items-center gap-2 text-primary-container bg-primary-container/10 px-3 py-1.5 rounded-full border border-primary-container/20">
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            <span className="font-label-caps text-[12px] uppercase tracking-widest">Customer Info</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest border border-outline/20 text-on-surface shadow-sm transition hover:bg-surface-variant"
            aria-label="Close customer info"
          >
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>
        </div>

        <div className="flex items-start justify-between gap-3 mb-stack-md">
          <div className="flex gap-3 items-center">
            <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-primary-container/20 to-surface-variant border border-primary-container/30 flex items-center justify-center text-primary-container shadow-[0_0_15px_rgba(0,229,255,0.15)] relative">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </div>
            <div>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-primary-container mb-0.5">Ride confirmed</p>
              <p className="font-display-sm text-[22px] leading-none tracking-tight text-on-surface">{customerName}</p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end justify-center">
            <p className="font-display-md text-[28px] leading-none font-bold text-primary-container tracking-tighter">{fare}</p>
            <div className="flex items-center gap-1 text-on-surface-variant mt-1 bg-surface-container-lowest/60 px-2 py-0.5 rounded border border-outline/10">
              <span className="material-symbols-outlined text-[12px]">route</span>
              <p className="font-body-sm text-[12px]">{distance}</p>
            </div>
          </div>
        </div>

        <div className="mt-stack-md flex flex-col gap-3 relative rounded-2xl bg-surface-container-lowest/40 border border-outline/10 p-4">
          <div className="relative z-10 flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant/50 text-primary-container border border-outline/10 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
              <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>
            </div>
            <div className="min-w-0 flex-1 border-b border-outline/10 pb-3">
              <p className="font-display-xs text-[16px] leading-tight text-on-surface tracking-wide truncate">{pickup}</p>
              <p className="mt-0.5 font-body-sm text-[12px] text-on-surface-variant/70 uppercase font-label-caps">Pick up</p>
            </div>
          </div>

          <div className="relative z-10 flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant/50 text-[#00B8D4] border border-outline/10 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
            </div>
            <div className="min-w-0 flex-1 border-b border-outline/10 pb-3">
              <p className="font-display-xs text-[16px] leading-tight text-on-surface tracking-wide truncate">{dropoff}</p>
              <p className="mt-0.5 font-body-sm text-[12px] text-on-surface-variant/70 uppercase font-label-caps">Drop off</p>
            </div>
          </div>

          <div className="relative z-10 flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant border border-outline/10 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
              <span className="material-symbols-outlined text-[18px]">description</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display-xs text-[14px] leading-tight text-on-surface/80 tracking-wide">{note}</p>
              <p className="mt-0.5 font-body-sm text-[12px] text-on-surface-variant/70 uppercase font-label-caps">Note</p>
            </div>
          </div>
        </div>

        <div className="mt-stack-md grid grid-cols-3 gap-3">
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 py-3 transition hover:bg-[#00E676]/20 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00E676]/20 text-[#00E676] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(0,230,118,0.2)]">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-[#00E676]">Call</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-primary-container/10 border border-primary-container/30 py-3 transition hover:bg-primary-container/20 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/20 text-primary-container group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-primary-container">Message</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-error-container/20 border border-error-container/40 py-3 transition hover:bg-error-container/40 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-container/40 text-error group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </div>
            <span className="font-label-caps text-[10px] uppercase tracking-widest text-error">Cancel</span>
          </button>
        </div>

        <div className="mt-stack-lg rounded-2xl bg-surface-container-lowest/60 border border-outline/20 p-4">
          <label htmlFor="ride-otp" className="font-label-caps text-[12px] uppercase tracking-widest text-on-surface-variant mb-2 block">
            Security Verification
          </label>
          <div className="flex gap-2">
            <input
              id="ride-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otpValue}
              onChange={(event) => onOtpChange?.(event.target.value)}
              className="h-12 w-full rounded-xl border border-outline/30 bg-surface-variant px-4 text-on-surface font-display-sm text-[16px] outline-none placeholder:text-on-surface-variant/40 focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
            <button
              type="button"
              onClick={onVerifyOtp}
              className="h-12 px-6 rounded-xl bg-surface-variant border border-outline/30 text-on-surface font-label-caps text-[12px] uppercase tracking-widest transition hover:bg-surface-variant/80 shrink-0 flex items-center justify-center"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {isVerified ? (
            <p className="mt-2 text-sm font-medium text-[#00E676] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              OTP verified successfully.
            </p>
          ) : null}

          {isInvalidOtp ? (
            <p className="mt-2 text-sm font-medium text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              OTP does not match user OTP.
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!isVerified}
          className="mt-stack-sm flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-background font-label-caps text-[14px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          Begin Journey
          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
        </button>
      </div>
    </section>
  )
}

export default CustomerInfoPanel