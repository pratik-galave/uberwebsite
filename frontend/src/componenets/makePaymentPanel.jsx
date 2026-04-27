import React from 'react'

const MakePaymentPanel = ({ customerName, fare, paymentStatus, paymentError, onMakePayment, onDone, onRetry }) => {
  const isSuccess = paymentStatus === 'success'
  const isFailed = paymentStatus === 'failed'
  const isProcessing = paymentStatus === 'processing'

  return (
    <div className="rounded-t-2xl bg-surface-container-lowest border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] w-full">
      <div className="flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      <div className="px-6 py-4 text-center">
        {isSuccess ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 border border-primary-container/30">
              <span className="material-symbols-outlined text-3xl text-primary">check_circle</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Complete</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Payment Successful</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Thank you for riding with Velocity</p>
          </>
        ) : isFailed ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 border border-red-200">
              <span className="material-symbols-outlined text-3xl text-red-500">error</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Failed</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Payment Failed</h2>
            {paymentError && (
              <p className="mt-2 text-sm text-red-500">{paymentError}</p>
            )}
          </>
        ) : isProcessing ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 border border-primary-container/30 animate-pulse">
              <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Processing</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Opening Payment...</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Please wait while we prepare your payment</p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ride Complete</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-on-surface">Payment Due</h2>
            {paymentError && (
              <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-md px-3 py-2">{paymentError}</p>
            )}
          </>
        )}
      </div>

      {/* Fare Card */}
      <div className="mx-6 rounded-lg bg-surface-container-low border border-outline-variant/15 p-6 mb-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Amount</p>
        <p className="text-4xl font-black font-display tracking-tight text-on-surface">{fare || '—'}</p>
        {customerName && (
          <p className="mt-2 text-sm text-on-surface-variant">
            Passenger: <span className="font-bold text-on-surface">{customerName}</span>
          </p>
        )}
      </div>

      {/* Payment Methods - only show when pending */}
      {!isSuccess && !isFailed && !isProcessing && (
        <>
          <div className="mx-6 rounded-lg border border-outline-variant/15 overflow-hidden mb-4">
            <div className="w-full flex items-center gap-4 px-4 py-3.5 text-left bg-primary-container/5 border-l-4 border-primary">
              <span className="material-symbols-outlined text-xl text-primary">account_balance</span>
              <div>
                <p className="text-sm font-bold text-on-surface">Razorpay Secure Payment</p>
                <p className="text-xs text-on-surface-variant">UPI, Cards, Net Banking, Wallets</p>
              </div>
            </div>
          </div>

          <div className="mx-6 rounded-lg border border-outline-variant/15 p-4 mb-4 flex flex-col items-center bg-surface-container-low/50">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Or Scan to Pay via UPI</p>
            <div className="rounded-xl border border-outline-variant/30 bg-white p-2 mb-2 shadow-sm">
              <img 
                src={`https://quickchart.io/qr?size=150&text=${encodeURIComponent(`upi://pay?pa=${import.meta.env.VITE_COMPANY_UPI_ID || 'yourcompany@upi'}&pn=Velocity&am=${String(fare || 0).replace('₹', '').trim()}&cu=INR`)}`} 
                alt="UPI QR Code" 
                className="w-32 h-32 object-contain"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant text-center px-4">Scan with GPay, PhonePe, or Paytm</p>
          </div>
        </>
      )}

      {/* Security badge */}
      {!isSuccess && !isFailed && !isProcessing && (
        <div className="mx-6 mb-4 flex items-center justify-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">lock</span>
          <p className="text-xs">Secured by Razorpay • 256-bit Encryption</p>
        </div>
      )}

      <div className="px-6 pb-6">
        {isSuccess ? (
          <button
            type="button"
            onClick={onDone}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-on-surface text-surface py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-on-surface/90 transition-all"
          >
            Done
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        ) : isFailed ? (
          <button
            type="button"
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-container text-on-primary-container py-3.5 text-sm font-bold uppercase tracking-wider hover:brightness-95 transition-all"
          >
            Try Again
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        ) : isProcessing ? (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-on-surface/30 text-surface py-3.5 text-sm font-bold uppercase tracking-wider cursor-not-allowed"
          >
            Processing...
          </button>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={onMakePayment}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-container text-on-primary-container py-3.5 text-sm font-bold uppercase tracking-wider hover:brightness-95 transition-all active:scale-[0.98]"
            >
              Pay Now
              <span className="material-symbols-outlined text-lg">payments</span>
            </button>
            <button
              type="button"
              onClick={onDone}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-transparent border border-outline-variant/30 text-on-surface py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-surface-container-low transition-all active:scale-[0.98]"
            >
              I've Paid via QR
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MakePaymentPanel